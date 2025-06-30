import React from 'react';
import { Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table-6';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';

import { bugsEndpoint } from '../helpers/url';
import { setUrlParam, getUrlParam } from '../helpers/location';

import BugColumn from './BugColumn';
import {
  calculateMetrics,
  prettyDate,
  ISODate,
  tableRowStyling,
} from './helpers';
import withView from './View';
import Layout from './Layout';
import DateRangePicker from './DateRangePicker';

const CustomPopper = (props) => {
  return (
    <Popper
      {...props}
      style={{ width: '350px', textAlign: 'left' }}
      placement="bottom-start"
    />
  );
};

const MainView = (props) => {
  const {
    graphData,
    tableData,
    initialParamsSet,
    startday,
    endday,
    failurehash,
    updateState,
    tree,
    location,
    updateAppState,
  } = props;

  const [selectedFilter, setSelectedFilter] = React.useState({
    product: [],
    component: [],
  });
  const textFilter = (filter, row) => {
    if (getUrlParam(filter.id) !== filter.value) {
      setUrlParam(filter.id, filter.value);
    }
    const text = row[filter.id];
    const regex = RegExp(filter.value, 'i');
    if (regex.test(text)) {
      return row;
    }
  };

  const autoCompleteFilter = ({ column, onChange }) => {
    const options = [...new Set(tableData.map((d) => d[column.id]))];
    options.sort();
    return (
      <Autocomplete
        slots={{ popper: CustomPopper }}
        size="small"
        multiple
        limitTags={0}
        id="checkboxes-tags-filter"
        options={options}
        onChange={(_event, values) => {
          setUrlParam(column.id, values);
          onChange(values);
          setSelectedFilter({ ...selectedFilter, [column.id]: values });
        }}
        disableCloseOnSelect
        defaultValue={selectedFilter[column.id]}
        fullWidth
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            style={{
              maxHeight: '0.9em',
              border: 'none',
              padding: '0',
              minWidth: '140px',
            }}
            {...params}
          />
        )}
      />
    );
  };

  const columns = [
    {
      Header: 'Bug',
      accessor: 'id',
      headerClassName: 'bug-column-header text-left',
      className: 'bug-column text-left',
      maxWidth: 150,
      width: 115,
      Cell: (_props) => (
        <BugColumn
          data={_props.original}
          tree={tree}
          startday={startday}
          endday={endday}
          failurehash={failurehash}
          location={location}
          graphData={graphData}
          tableData={tableData}
          updateAppState={updateAppState}
        />
      ),
    },
    {
      Header: 'Count',
      accessor: 'count',
      maxWidth: 100,
      filterable: false,
    },
    {
      Header: 'Product',
      accessor: 'product',
      maxWidth: 100,
      filterMethod: (filter, row) => {
        if (filter.value) {
          const regex = RegExp(filter.value.join('|'), 'i');
          if (regex.test(row.product)) {
            return row;
          }
        }
      },
      Filter: autoCompleteFilter,
    },
    {
      Header: 'Component',
      accessor: 'component',
      maxWidth: 100,
      filterMethod: (filter, row) => {
        if (filter.value) {
          const regex = RegExp(filter.value.join('|'), 'i');
          if (regex.test(row.component)) {
            return row;
          }
        }
      },
      Filter: autoCompleteFilter,
    },
    {
      Header: 'Summary',
      accessor: 'summary',
      minWidth: 250,
      filterMethod: (filter, row) => textFilter(filter, row),
    },
    {
      Header: 'Whiteboard',
      accessor: 'whiteboard',
      minWidth: 150,
      filterMethod: (filter, row) => textFilter(filter, row),
    },
  ];

  let graphOneData = null;
  let graphTwoData = null;
  let totalFailures = 0;
  let totalRuns = 0;

  if (graphData.length) {
    ({
      graphOneData,
      graphTwoData,
      totalFailures,
      totalRuns,
    } = calculateMetrics(graphData));
    graphOneData = { all: graphOneData };
    graphOneData.all[0].count = tableData.length;
  }

  const getHeaderAriaLabel = (state, bug, data) => {
    const ariaLabelValue =
      data.Header === 'Count'
        ? 'Filter not available for count'
        : `Type to filter ${data.Header}`;
    return {
      'aria-label': ariaLabelValue,
    };
  };

  const setInitialFiltersFromUrl = () => {
    const filters = [];
    for (const header of ['product', 'component', 'summary', 'whiteboard']) {
      const param = getUrlParam(header);
      if (param) {
        if (header === 'product') {
          filters.push({ id: header, value: param.split(',') });
          if (selectedFilter.product.length === 0) {
            setSelectedFilter({ ...selectedFilter, product: param.split(',') });
          }
        } else if (header === 'component') {
          filters.push({ id: header, value: param.split(',') });
          if (selectedFilter.component.length === 0) {
            setSelectedFilter({
              ...selectedFilter,
              component: param.split(','),
            });
          }
        } else {
          filters.push({ id: header, value: param });
        }
      }
    }
    return filters;
  };

  return (
    <Layout
      {...props}
      graphOneData={graphOneData}
      graphTwoData={graphTwoData}
      header={
        initialParamsSet && (
          <React.Fragment>
            <Row>
              <Col xs="12" className="text-left">
                <Breadcrumb listClassName="bg-white">
                  <BreadcrumbItem>
                    <a title="Treeherder home page" href="/">
                      Treeherder
                    </a>
                  </BreadcrumbItem>
                  <BreadcrumbItem
                    active
                    title="Intermittent Failures View main page"
                  >
                    Main view
                  </BreadcrumbItem>
                </Breadcrumb>
              </Col>
            </Row>
            <Row>
              <Col xs="12" className="mx-auto pt-3">
                <h1>Intermittent Test Failures</h1>
              </Col>
            </Row>
            <Row>
              <Col xs="12" className="mx-auto">
                <p className="subheader">{`${prettyDate(
                  startday,
                )} to ${prettyDate(endday)} UTC`}</p>
              </Col>
            </Row>
            <Row>
              <Col xs="12" className="mx-auto">
                <p className="text-secondary">
                  {totalFailures} bugs in {totalRuns} pushes
                </p>
              </Col>
            </Row>
          </React.Fragment>
        )
      }
      table={
        initialParamsSet && (
          <ReactTable
            data={tableData}
            showPageSizeOptions
            columns={columns}
            className="-striped"
            getTableProps={() => ({ role: 'table' })}
            getTheadFilterThProps={getHeaderAriaLabel}
            getTrProps={tableRowStyling}
            showPaginationTop
            defaultPageSize={50}
            filterable
            defaultFiltered={setInitialFiltersFromUrl()}
          />
        )
      }
      datePicker={<DateRangePicker updateState={updateState} />}
    />
  );
};

MainView.propTypes = {
  location: PropTypes.shape({}).isRequired,
  tree: PropTypes.string.isRequired,
  updateAppState: PropTypes.func,
  updateState: PropTypes.func.isRequired,
  startday: PropTypes.string.isRequired,
  endday: PropTypes.string.isRequired,
  failurehash: PropTypes.string.isRequired,
  tableData: PropTypes.arrayOf(PropTypes.shape({})),
  graphData: PropTypes.arrayOf(PropTypes.shape({})),
  initialParamsSet: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
};

MainView.defaultProps = {
  graphData: [],
  tableData: [],
  updateAppState: null,
};

const defaultState = {
  tree: 'all',
  startday: ISODate(moment().utc().subtract(7, 'days')),
  endday: ISODate(moment().utc()),
  failurehash: 'all',
  endpoint: bugsEndpoint,
  route: '/main',
};

export default withView(defaultState)(MainView);

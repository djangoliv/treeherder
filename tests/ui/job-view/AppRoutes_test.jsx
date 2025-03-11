import React from 'react';
import fetchMock from 'fetch-mock';
import { render } from '@testing-library/react';
import { Provider, ReactReduxContext } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import App from '../../../ui/App';
import reposFixture from '../mock/repositories';
import { getApiUrl } from '../../../ui/helpers/url';
import { getProjectUrl } from '../../../ui/helpers/location';
import {
  configureStore,
  history,
} from '../../../ui/job-view/redux/configureStore';

const testApp = () => {
  const store = configureStore();
  return (
    <Provider store={store} context={ReactReduxContext}>
      <ConnectedRouter history={history} context={ReactReduxContext}>
        <App />
      </ConnectedRouter>
    </Provider>
  );
};

describe('Test for backwards-compatible routes for other apps', () => {
  beforeAll(() => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute(
      'href',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB3UlEQVRYCe1Wy43CMBT0LpwAUQQXOEAX3KGDNAAioQFEBSR8CqADklskuoAzDcCFCrwZpKwc/21gtSttpAi/j2fGz3lPEPKXn/F4TPGez2f64+cYDoe00+k8Xqx9RXy4KgdRGIbkcrlUthZiyPF4dMb7rKAYjNPpJCXHNgjyqYS1AJBHUSScnNUMEagOclm/bm1dMpyOL7sKGNcRxzHp9/tGfGMCSEajES1OpeKT+geDAUnT1IhvdQWtVktKonO2221d2D+23++/269sw/IXMVdkY4lYQBAsl0vWJawXiwUJgsAa1zpxs9nQ1WolEMoc8/mcTCYTK2yrJBfyUhBadjqdGvGNCev1mqKlfB4bEdou2O123uQQjCvbbrfaD1NZgSzLHmPX5+T8HggpZomUS1mBer1OGo0Gj+VsA6NWqyn3SVXJsm1asNzn0opWAlzIXUUYBTzTBbPZjBSvlkMbfIa8rIRJhPIjfAU5RCRJQjDISkH8r1QAetd3+PAEsNGGmCmymHAFh8OBYpa/45HNA6ECr+p//gCYB5RKi8Cn6u08z5X/BxDT7xajQgXElKrnfr9XHYylizFplaWzgNvtVgFgjev1yppWa2cB3W6XNJtNARy+Xq8n+P8dv74CX7af1O/M1vwsAAAAAElFTkSuQmCC',
    );
    document.querySelector('head').appendChild(link);

    fetchMock.get('/revision.txt', []);
    fetchMock.get(getApiUrl('/repository/'), reposFixture);
    fetchMock.get(getApiUrl('/failureclassification/'), []);
    fetchMock.get(getApiUrl('/user/'), []);
    fetchMock.get(getProjectUrl('/jobs/319893964/', 'autoland'), {});
    fetchMock.get(
      getProjectUrl('/jobs/319893964/text_log_errors/', 'autoland'),
      {},
    );
  });

  test('old push health url should redirect to correct url', () => {
    fetchMock.get(
      '/api/project/autoland/push/health/?revision=3c8e093335315c42a87eebf0531effe9cd6fdb95',
      [],
    );

    history.push(
      '/pushhealth.html?repo=autoland&revision=3c8e093335315c42a87eebf0531effe9cd6fdb95',
    );
    render(testApp());

    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: '/push-health',
        search:
          '?repo=autoland&revision=3c8e093335315c42a87eebf0531effe9cd6fdb95',
        hash: '',
      }),
    );
  });

  test('old perfherder route should redirect to correct url', () => {
    fetchMock.get('/api/performance/framework/', []);
    fetchMock.get('/api/performance/tag/', []);

    history.push('/perf.html#/alerts?id=27285&hideDwnToInv=0');
    render(testApp());

    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: '/perfherder/alerts',
        search: '?id=27285&hideDwnToInv=0',
        hash: '',
      }),
    );
  });

  test('old logviewer route should redirect to correct url', () => {
    history.push(
      '/logviewer.html#/jobs?job_id=319893964&repo=autoland&lineNumber=2728',
    );
    render(testApp());

    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: '/logviewer',
        search: '?job_id=319893964&repo=autoland&lineNumber=2728',
        hash: '',
      }),
    );
  });

  test('url is not broken when it contains a table permalink hash', async () => {
    history.push(
      '/perfherder/compare?originalProject=mozilla-central&originalRevision=54e7fb66ad44b8dcb8caab587f929dad60932d71&newProject=mozilla-central&newRevision=54e7fb66ad44b8dcb8caab587f929dad60932d71&framework=1&page=1#tableLink-header-134266337',
    );
    render(testApp());

    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: '/perfherder/compare',
        search:
          '?originalProject=mozilla-central&originalRevision=54e7fb66ad44b8dcb8caab587f929dad60932d71&newProject=mozilla-central&newRevision=54e7fb66ad44b8dcb8caab587f929dad60932d71&framework=1&page=1',
        hash: '#tableLink-header-134266337',
      }),
    );
  });
});

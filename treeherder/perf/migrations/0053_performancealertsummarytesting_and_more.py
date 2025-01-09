# Generated by Django 4.2.16 on 2024-09-18 16:26

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "model",
            "0032_rename_failureline_job_guid_repository_failure_lin_job_gui_b67c6d_idx_and_more",
        ),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        (
            "perf",
            "0052_rename_performancedatum_repository_signature_push_timestamp_performance_reposit_c9d328_idx_and_more",
        ),
    ]

    operations = [
        migrations.CreateModel(
            name="PerformanceAlertSummaryTesting",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("manually_created", models.BooleanField(default=False)),
                ("notes", models.TextField(blank=True, null=True)),
                ("created", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("triage_due_date", models.DateTimeField(default=None, null=True)),
                ("first_triaged", models.DateTimeField(default=None, null=True)),
                ("last_updated", models.DateTimeField(auto_now=True, null=True)),
                (
                    "status",
                    models.IntegerField(
                        choices=[
                            (0, "Untriaged"),
                            (1, "Downstream"),
                            (2, "Reassigned"),
                            (3, "Invalid"),
                            (4, "Improvement"),
                            (5, "Investigating"),
                            (6, "Won't fix"),
                            (7, "Fixed"),
                            (8, "Backed out"),
                        ],
                        default=0,
                    ),
                ),
                ("bug_number", models.PositiveIntegerField(null=True)),
                ("bug_due_date", models.DateTimeField(default=None, null=True)),
                ("bug_updated", models.DateTimeField(null=True)),
                (
                    "assignee",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="assigned_alerts_testing",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "framework",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="perf.performanceframework",
                    ),
                ),
                (
                    "issue_tracker",
                    models.ForeignKey(
                        default=1,
                        on_delete=django.db.models.deletion.PROTECT,
                        to="perf.issuetracker",
                    ),
                ),
                (
                    "prev_push",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to="model.push",
                    ),
                ),
                (
                    "push",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to="model.push",
                    ),
                ),
                (
                    "repository",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="model.repository",
                    ),
                ),
            ],
            options={
                "db_table": "performance_alert_summary_testing",
                "unique_together": {("repository", "framework", "prev_push", "push")},
            },
        ),
        migrations.CreateModel(
            name="PerformanceAlertTesting",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("is_regression", models.BooleanField()),
                ("starred", models.BooleanField(default=False)),
                ("created", models.DateTimeField(auto_now_add=True, null=True)),
                ("first_triaged", models.DateTimeField(default=None, null=True)),
                ("last_updated", models.DateTimeField(auto_now=True, null=True)),
                (
                    "status",
                    models.IntegerField(
                        choices=[
                            (0, "Untriaged"),
                            (1, "Downstream"),
                            (2, "Reassigned"),
                            (3, "Invalid"),
                            (4, "Acknowledged"),
                        ],
                        default=0,
                    ),
                ),
                (
                    "amount_pct",
                    models.FloatField(
                        help_text="Amount in percentage that series has changed"
                    ),
                ),
                (
                    "amount_abs",
                    models.FloatField(
                        help_text="Absolute amount that series has changed"
                    ),
                ),
                (
                    "prev_value",
                    models.FloatField(
                        help_text="Previous value of series before change"
                    ),
                ),
                (
                    "new_value",
                    models.FloatField(help_text="New value of series after change"),
                ),
                (
                    "t_value",
                    models.FloatField(
                        help_text="t value out of analysis indicating confidence that change is 'real'",
                        null=True,
                    ),
                ),
                (
                    "noise_profile",
                    models.CharField(
                        choices=[
                            (
                                "SKEWED",
                                "Samples are heavily found on one side of the mean.",
                            ),
                            (
                                "OUTLIERS",
                                "There are more outliers than should be expected from a normal distribution.",
                            ),
                            (
                                "MODAL",
                                "There are multiple areas where most values are found rather than only one.",
                            ),
                            ("OK", "No issues were found."),
                            ("N/A", "Could not compute a noise profile."),
                        ],
                        default="N/A",
                        help_text="The noise profile of the data which precedes this alert.",
                        max_length=30,
                    ),
                ),
                ("manually_created", models.BooleanField(default=False)),
                (
                    "classifier",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "related_summary",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="related_alerts",
                        to="perf.performancealertsummarytesting",
                    ),
                ),
                (
                    "series_signature",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="perf.performancesignature",
                    ),
                ),
                (
                    "summary",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="alerts",
                        to="perf.performancealertsummarytesting",
                    ),
                ),
            ],
            options={
                "db_table": "performance_alert_testing",
                "unique_together": {("summary", "series_signature")},
            },
        ),
    ]

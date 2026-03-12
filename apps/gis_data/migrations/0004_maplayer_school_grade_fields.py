from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_data', '0003_boundary_pointofinterest_route_polygonfeature_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE map_layers ADD COLUMN IF NOT EXISTS school VARCHAR(50);"
                        "ALTER TABLE map_layers ADD COLUMN IF NOT EXISTS grade VARCHAR(10);"
                        "CREATE INDEX IF NOT EXISTS idx_map_layers_school_grade_orm ON map_layers(school, grade);"
                    ),
                    reverse_sql="DROP INDEX IF EXISTS idx_map_layers_school_grade_orm;",
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='maplayer',
                    name='school',
                    field=models.CharField(blank=True, help_text='School level for curriculum grouping (e.g., THPT)', max_length=50),
                ),
                migrations.AddField(
                    model_name='maplayer',
                    name='grade',
                    field=models.CharField(blank=True, help_text='Grade level for curriculum grouping (e.g., 10)', max_length=10),
                ),
                migrations.AddIndex(
                    model_name='maplayer',
                    index=models.Index(fields=['school', 'grade'], name='idx_map_layers_school_grade_orm'),
                ),
            ],
        ),
    ]

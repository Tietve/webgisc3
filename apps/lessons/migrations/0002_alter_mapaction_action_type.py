# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lessons', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mapaction',
            name='action_type',
            field=models.CharField(
                choices=[
                    ('flyTo', 'Fly To Location'),
                    ('TOGGLE_LAYER', 'Toggle Layer'),
                    ('ZOOM_TO', 'Zoom To Location'),
                    ('HIGHLIGHT', 'Highlight Feature'),
                    ('PAN_TO', 'Pan To Location'),
                    ('SET_BASEMAP', 'Set Basemap'),
                    ('SHOW_POPUP', 'Show Popup'),
                ],
                help_text='Type of map action to perform',
                max_length=50,
            ),
        ),
    ]

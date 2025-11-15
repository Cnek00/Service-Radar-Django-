"""
Management command to load categories from JSON fixture.
Usage: python manage.py load_categories
"""

import json
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from core.models import Category


class Command(BaseCommand):
    help = 'Load categories from JSON fixture file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='core/fixtures/categories.json',
            help='Path to categories JSON file',
        )

    def handle(self, *args, **options):
        file_path = options['file']
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                categories_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR(f'Invalid JSON in file: {file_path}'))
            return

        created_count = 0
        updated_count = 0

        for category_data in categories_data:
            name = category_data.get('name')
            slug = category_data.get('slug')
            description = category_data.get('description', '')

            if not name or not slug:
                self.stdout.write(self.style.WARNING(f'Skipping category with missing name or slug: {category_data}'))
                continue

            category, created = Category.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': description,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated category: {name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {created_count} new categories and updated {updated_count}'))

"""
Script to create webgis_db database and enable PostGIS extension
Run: python create_database.py
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    print("=" * 60)
    print(" CREATE WEBGIS DATABASE")
    print("=" * 60)

    # Connect to PostgreSQL (default postgres database)
    try:
        print("\n1. Connecting to PostgreSQL...")
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='postgres',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("   OK Connected successfully!")

        # Check if database already exists
        print("\n2. Checking database webgis_db...")
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'webgis_db'")
        exists = cursor.fetchone()

        if exists:
            print("   WARNING: Database webgis_db already exists! Skipping creation...")
        else:
            # Create new database
            print("\n3. Creating database webgis_db...")
            cursor.execute("CREATE DATABASE webgis_db")
            print("   OK Created database webgis_db!")

        cursor.close()
        conn.close()

        # Connect to newly created database to enable PostGIS
        print("\n4. Enabling PostGIS extension...")
        conn = psycopg2.connect(
            dbname='webgis_db',
            user='postgres',
            password='postgres',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        try:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis")
            print("   OK PostGIS extension enabled!")
        except Exception as e:
            print(f"   WARNING: Cannot enable PostGIS: {e}")
            print("   (PostGIS might not be installed on local PostgreSQL)")

        cursor.close()
        conn.close()

        print("\n" + "=" * 60)
        print(" COMPLETED!")
        print("=" * 60)
        print("\nDatabase webgis_db created successfully!")
        print("\nNext steps:")
        print("   1. Run migrations: python manage.py migrate")
        print("   2. Add data: python add_data_simple.py")
        print("   3. Open pgAdmin and connect to localhost:5432")
        print("      Database: webgis_db")
        print("      User: postgres")
        print("      Password: postgres")

    except psycopg2.OperationalError as e:
        print(f"\nERROR: Cannot connect to PostgreSQL!")
        print(f"   Details: {e}")
        print("\nSolutions:")
        print("   1. Check if PostgreSQL is running")
        print("   2. Check username/password in script (default: postgres/postgres)")
        print("   3. Check port 5432")
    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == '__main__':
    create_database()

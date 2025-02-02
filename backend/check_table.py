import pg8000.native

print("Connecting to database...")
conn = pg8000.native.Connection(
    user='postgres',
    password='Raintree112233',
    host='localhost',
    database='battlearena',
    port=5432
)

try:
    print("\nChecking alembic version table...")
    results = conn.run("SELECT * FROM alembic_version")
    print("Alembic version entries:")
    for row in results:
        print(f"- {row[0]}")

    print("\nListing all tables...")
    results = conn.run("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    print("Tables in database:")
    for row in results:
        print(f"- {row[0]}")

except Exception as e:
    print(f"\nError occurred:")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")

finally:
    conn.close()
    print("\nConnection closed.")

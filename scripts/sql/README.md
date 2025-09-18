# Database Setup Instructions

This directory contains SQL files to set up the Legal Document Management System database.

## Files Description

- `001_init.sql` - Original database schema initialization
- `002_seed_data.sql` - Original seed data (firms, users, clients, matters)
- `02_current_schema.sql` - Current database schema (structure only)
- `03_current_full_dump.sql` - Complete current database (schema + data)

## Quick Setup (Recommended)

For new installations, use the complete current dump which includes all recent schema changes and sample data:

```bash
# Start the database container
docker compose up -d app-db

# Wait for database to be ready
docker compose exec app-db pg_isready -U app

# Restore the complete database
docker compose exec -T app-db psql -U app -d app < scripts/sql/03_current_full_dump.sql
```

## Alternative Setup Options

### Option 1: Schema Only (if you want to start fresh)
```bash
docker compose exec -T app-db psql -U app -d app < scripts/sql/02_current_schema.sql
```

### Option 2: Original Setup + Manual Data
```bash
# Initialize with original schema
docker compose exec -T app-db psql -U app -d app < scripts/sql/001_init.sql

# Add original seed data
docker compose exec -T app-db psql -U app -d app < scripts/sql/002_seed_data.sql
```

## Database Structure

The database includes the following main entities:

### Core Tables
- `firms` - Law firms and organizations
- `users` - System users with role-based access
- `clients` - Client information and contacts
- `matters` - Legal matters and cases
- `documents` - Document metadata and file information
- `matter_team` - Matter team membership and permissions

### Features
- **Multi-tenant architecture** - Firm-based data isolation
- **Role-based access control** - User permissions and roles
- **Document management** - File storage and metadata
- **Full-text search** - PostgreSQL text search capabilities
- **Audit trails** - Created/updated timestamps
- **UUID primary keys** - Globally unique identifiers

### Sample Data Included

The current dump includes:
- **10 law firms** (including fictional firms like Saul Goodman & Associates)
- **62 active matters** across various practice areas
- **57 clients** with realistic contact information
- **Multiple users** with different roles and permissions
- **Complete relational data** properly linked between entities

### Practice Areas Covered
- Criminal Defense
- Corporate Law
- Civil Litigation
- Environmental Law
- Employment Law
- Real Estate Law
- Tax Law
- Immigration Law
- Family Law
- Product Liability
- Insurance Defense
- Bankruptcy Law

## Database Configuration

The database is configured with:
- PostgreSQL 16
- Extensions: `uuid-ossp`, `pg_trgm` (for full-text search)
- Character encoding: UTF8
- Timezone: UTC

## Troubleshooting

### Connection Issues
```bash
# Check if database is running
docker compose ps app-db

# View database logs
docker compose logs app-db

# Connect to database directly
docker compose exec app-db psql -U app -d app
```

### Permission Issues
If you encounter permission errors, ensure the database user has proper privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE app TO app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app;
```

### Foreign Key Constraints
If you get foreign key constraint errors during restore, you can temporarily disable them:
```sql
SET session_replication_role = replica;
-- Your restore commands here
SET session_replication_role = DEFAULT;
```

## Development Notes

- The database uses UUID primary keys for better distribution and security
- All tables include `created_at` and `updated_at` timestamps
- Soft deletes are implemented using `is_deleted` flags
- Full-text search is enabled on document content and metadata
- Foreign key relationships maintain data integrity

## Production Considerations

When deploying to production:
1. Change default passwords and credentials
2. Review and adjust user permissions
3. Configure appropriate database connection limits
4. Set up regular backups
5. Enable SSL/TLS connections
6. Configure monitoring and alerting

## Creating New Dumps

To create updated database dumps:

```bash
# Schema only
docker compose exec app-db pg_dump -U app -d app --schema-only --no-owner --no-privileges > scripts/sql/new_schema.sql

# Complete dump
docker compose exec app-db pg_dump -U app -d app --no-owner --no-privileges > scripts/sql/new_full_dump.sql
```
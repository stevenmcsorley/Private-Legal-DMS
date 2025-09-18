# Database Schema & Setup

This directory contains the database schema and seed data for fresh installations of the Legal DMS.

## Files

- **`schema.sql`** - Complete database schema export (tables, indexes, functions, triggers)
- **`seeds.sql`** - Essential seed data for fresh installations (default firm, admin user, retention classes)

## Fresh Installation (New Machine)

When cloning this repository to a new machine, use these commands to set up the database:

### 1. Start Services
```bash
make up
```

### 2. Apply Schema & Seed Data
```bash
# Import complete schema and apply seed data
make fresh-install
```

This will:
- Import the complete database schema
- Create default firm: "Demo Law Firm"
- Create default admin user: admin@demolawfirm.com
- Create 4 default retention classes
- Create sample client and matter for testing

### 3. Verify Installation
```bash
# Check database connection
make db-shell

# In the PostgreSQL shell:
\dt  # List tables
SELECT name FROM firms;  # Should show "Demo Law Firm"
\q   # Exit
```

## Development Workflow

### Export Current Schema
When you make database changes and want to update the schema file:
```bash
make schema-export
```

### Development Reset
To reset your development environment:
```bash
make dev-reset  # Keeps current schema/migrations
# OR
make fresh-install  # Uses the exported schema files
```

## Schema Management Commands

| Command | Purpose |
|---------|---------|
| `make schema-export` | Export current database schema to `schema.sql` |
| `make schema-import` | Import schema from `schema.sql` into database |
| `make seed-fresh` | Apply seed data from `seeds.sql` |
| `make fresh-install` | Complete fresh installation (schema + seeds) |
| `make db-shell` | Connect to PostgreSQL shell |

## Default Accounts

After running `make fresh-install`, you'll have:

### Default Firm
- **Name**: Demo Law Firm
- **Email**: admin@demolawfirm.com
- **ID**: `22222222-2222-2222-2222-222222222222`

### Default Admin User
- **Email**: admin@demolawfirm.com
- **Display Name**: Demo Admin
- **Roles**: super_admin, firm_admin
- **ID**: `38db5dcd-a99e-4a41-a3d8-bbfae6466ab6`

### Retention Classes
1. **Standard Legal Documents** (7 years)
2. **Client Communications** (5 years)
3. **Contract Documents** (10 years)
4. **Litigation Files** (Permanent)

### Test Data
- Sample client: "Demo Client Corp"
- Sample matter: "Demo Corporate Contract Review"

## Notes

- **No Document Data**: Seed data doesn't include documents. Upload documents through the application to test the complete processing pipeline (virus scanning, OCR, text extraction).
- **UUID Consistency**: All UUIDs in seed data are fixed to ensure consistent references across fresh installations.
- **Production Ready**: The schema includes all tables, indexes, functions, and triggers needed for production deployment.

## Troubleshooting

### Schema Import Fails
```bash
# Check if database is empty
make db-shell
\dt  # Should show no tables for fresh import

# If tables exist, reset first
make db-reset
make fresh-install
```

### Seed Data Issues
```bash
# Re-apply just the seed data
make seed-fresh
```

### Connection Issues
```bash
# Check service health
make health

# Check database container
docker compose ps | grep app-db
```
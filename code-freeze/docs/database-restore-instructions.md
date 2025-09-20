# Database Restore Instructions

This document explains how to restore the DMS database dumps created during the code freeze.

## Database Dumps Created

- **Main DMS Database**: `dms-main-database-20250920-215122.sql` (4.6MB)
- **Keycloak Database**: `dms-keycloak-database-20250920-215138.sql` (304KB)

## Prerequisites

1. Ensure Docker and Docker Compose are installed
2. Navigate to the DMS project root directory
3. Start the database containers: `docker compose up app-db keycloak-db -d`

## Restore Procedures

### 1. Restore Main DMS Database

```bash
# Stop the application to prevent conflicts
docker compose stop app frontend

# Drop and recreate the database (WARNING: This removes all existing data)
docker exec dms-app-db-1 psql -U app -d postgres -c "DROP DATABASE IF EXISTS app;"
docker exec dms-app-db-1 psql -U app -d postgres -c "CREATE DATABASE app;"

# Restore from dump
docker exec -i dms-app-db-1 psql -U app -d app < code-freeze/database-dumps/dms-main-database-20250920-215122.sql

# Restart the application
docker compose up app frontend -d
```

### 2. Restore Keycloak Database

```bash
# Stop Keycloak to prevent conflicts
docker compose stop keycloak

# Drop and recreate the database (WARNING: This removes all existing data)
docker exec dms-keycloak-db-1 psql -U keycloak -d postgres -c "DROP DATABASE IF EXISTS keycloak;"
docker exec dms-keycloak-db-1 psql -U keycloak -d postgres -c "CREATE DATABASE keycloak;"

# Restore from dump
docker exec -i dms-keycloak-db-1 psql -U keycloak -d keycloak < code-freeze/database-dumps/dms-keycloak-database-20250920-215138.sql

# Restart Keycloak
docker compose up keycloak -d
```

### 3. Complete System Restore

To restore the entire system with both databases:

```bash
# Stop all services
docker compose down

# Start only database containers
docker compose up app-db keycloak-db -d

# Wait for databases to be ready
sleep 10

# Restore main database
docker exec dms-app-db-1 psql -U app -d postgres -c "DROP DATABASE IF EXISTS app;"
docker exec dms-app-db-1 psql -U app -d postgres -c "CREATE DATABASE app;"
docker exec -i dms-app-db-1 psql -U app -d app < code-freeze/database-dumps/dms-main-database-20250920-215122.sql

# Restore Keycloak database
docker exec dms-keycloak-db-1 psql -U keycloak -d postgres -c "DROP DATABASE IF EXISTS keycloak;"
docker exec dms-keycloak-db-1 psql -U keycloak -d postgres -c "CREATE DATABASE keycloak;"
docker exec -i dms-keycloak-db-1 psql -U keycloak -d keycloak < code-freeze/database-dumps/dms-keycloak-database-20250920-215138.sql

# Start all services
docker compose up -d
```

## Verification

After restoring, verify the system is working:

1. **Check database connectivity**:
   ```bash
   docker exec dms-app-db-1 psql -U app -d app -c "SELECT COUNT(*) FROM firms;"
   docker exec dms-keycloak-db-1 psql -U keycloak -d keycloak -c "SELECT COUNT(*) FROM realm;"
   ```

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Keycloak: http://localhost:8081

3. **Test authentication**:
   - Login with existing user credentials
   - Verify role-based access control

## Notes

- The dumps include all user data, firms, documents, and system configurations
- Global settings and super admin configurations are preserved
- Keycloak realm configuration and user credentials are included
- All database tables, indexes, and constraints are restored
- The restore process will overwrite any existing data in the databases

## Troubleshooting

If restore fails:

1. Check container logs: `docker compose logs app-db keycloak-db`
2. Verify database connectivity: `docker exec dms-app-db-1 pg_isready -U app`
3. Check dump file integrity: `head -20 code-freeze/database-dumps/dms-main-database-*.sql`
4. Ensure sufficient disk space: `df -h`

## Data Included in Dumps

### Main Database (`app`)
- User accounts and roles
- Firm configurations
- Matter and client data
- Document metadata and storage references
- Audit logs and system activities
- Global system settings
- Team assignments and permissions

### Keycloak Database (`keycloak`)
- Realm configuration for DMS
- User authentication credentials
- Role mappings and permissions
- Client configurations
- Session data and tokens
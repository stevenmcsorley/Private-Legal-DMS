# Database Migration System

This project uses TypeORM migrations for proper database schema versioning and deployment.

## 🚀 Quick Start

### Running Migrations

```bash
# In the app container or locally with proper DATABASE_URL
npm run migration:run
```

### Docker Environment

```bash
# Run migrations in Docker
docker compose exec app npm run migration:run

# Or use the helper script
docker compose exec app node run-migrations.js
```

## 📝 Migration Commands

### Development

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/DescriptiveName

# Create empty migration file
npm run migration:create -- src/database/migrations/DescriptiveName

# Run pending migrations
npm run migration:run

# Revert last migration (DANGEROUS)
npm run migration:revert

# Show migration status
npm run migration:show
```

## 📁 Migration Structure

```
src/database/migrations/
├── 1725672000000-CreateMatterShares.ts
├── 1726164000000-AddMissingColumns.ts
└── [timestamp]-[DescriptiveName].ts
```

## 🎯 Best Practices

### 1. Always Use Migrations
- ❌ **Never** modify the database schema manually in production
- ❌ **Never** use `synchronize: true` in production
- ✅ **Always** create migrations for schema changes
- ✅ **Always** test migrations in development first

### 2. Migration Naming
- Use descriptive names: `CreateUserTable`, `AddIndexToDocuments`, `AlterColumnType`
- Use timestamp prefixes (auto-generated)
- Be specific about what the migration does

### 3. Safe Migration Patterns
```typescript
// ✅ Good: Safe column addition
await queryRunner.query(`
  ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "new_field" varchar(255) DEFAULT 'default_value'
`);

// ✅ Good: Safe index creation  
await queryRunner.query(`
  CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email")
`);

// ❌ Dangerous: Column removal (use multi-step approach)
// Step 1: Add new column, migrate data
// Step 2: Update application to use new column  
// Step 3: Remove old column in separate migration
```

### 4. Testing Migrations
```bash
# Test migration up and down
npm run migration:run
npm run migration:revert
npm run migration:run
```

## 🔧 Migration File Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DescriptiveName[TIMESTAMP] implements MigrationInterface {
  name = 'DescriptiveName[TIMESTAMP]';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration
    await queryRunner.query(`
      -- Your migration SQL here
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migration (rollback)
    await queryRunner.query(`
      -- Reverse the changes here
    `);
  }
}
```

## 🚨 Important Notes

### Production Deployment
1. **Always backup** the database before running migrations
2. Test migrations on a staging environment first
3. Consider maintenance windows for large migrations
4. Monitor performance during migration execution

### Development Workflow
1. Make entity changes
2. Generate migration: `npm run migration:generate`
3. Review the generated SQL carefully
4. Test the migration (up and down)
5. Commit both entity changes and migration file

### Rollback Strategy
- Migrations should be reversible when possible
- Test rollback scenarios in development
- Some changes (data migrations) may not be safely reversible
- Document any irreversible migrations clearly

## 📊 Current Migrations

| Migration | Description | Status |
|-----------|-------------|--------|
| `CreateMatterShares` | Matter sharing functionality | ✅ Applied |
| `AddMissingColumns` | Consolidates manual schema additions | ⏳ Pending |

## 🆘 Troubleshooting

### Common Issues

**Migration already exists error:**
```bash
# Check which migrations have been run
npm run migration:show

# If needed, revert and re-run
npm run migration:revert
npm run migration:run
```

**Database connection issues:**
- Ensure DATABASE_URL is set correctly
- Verify database is accessible
- Check Docker network connectivity

**TypeORM CLI not found:**
```bash
# Install TypeORM CLI globally if needed
npm install -g typeorm
```

### Emergency Rollback
```sql
-- Manual rollback if needed (DANGEROUS)
DELETE FROM migrations WHERE timestamp = '[MIGRATION_TIMESTAMP]';
-- Then manually revert schema changes
```

## 🔗 Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
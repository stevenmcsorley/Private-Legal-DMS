# Document-Level Sharing Database Changes

## Summary
This migration adds support for document-level sharing alongside existing matter-level sharing, resolving the multiple PDFs handling issue.

## Changes Made

### 1. Schema Changes

#### Added to `matter_shares` table:
- **`document_id`** (UUID, nullable) - References specific document when sharing individual documents
- **Foreign Key**: `fk_matter_shares_document_id` → `documents(id)` ON DELETE CASCADE

#### Updated Constraints:
- **Removed**: Old unique constraint `(matter_id, shared_with_firm)`
- **Added**: New unique index `idx_matter_shares_unique_share` on `(matter_id, shared_with_firm, COALESCE(document_id, '00000000-0000-0000-0000-000000000000'))`

### 2. Business Logic Changes

#### Sharing Behavior:
- **Matter-level sharing**: `document_id = NULL` (legacy behavior, shares entire matter)
- **Document-level sharing**: `document_id = <uuid>` (new feature, shares specific document)

#### Uniqueness Rules:
- Multiple document shares allowed between same matter/firm (different document_id)
- One matter-level share allowed per matter/firm combination (document_id = NULL)
- No duplicate shares for same matter/firm/document combination

### 3. API Changes

#### Backend:
- **Added**: `document_id` parameter to `POST /api/shares` endpoint
- **Updated**: Share filtering logic to return only specified document when document_id is set
- **Enhanced**: Validation to ensure document belongs to matter before sharing

#### Frontend:
- **Added**: Document selection UI in CreateShare component
- **Added**: "Entire Matter" vs individual document selection options
- **Updated**: Form submission to include optional document_id

### 4. Files Modified

#### Backend:
- `services/app/src/common/entities/matter-share.entity.ts` - Added document_id field and relation
- `services/app/src/modules/shares/shares.service.ts` - Updated sharing logic and document filtering
- `services/app/src/modules/shares/shares.controller.ts` - Added document_id parameter support

#### Frontend:
- `services/frontend/src/components/sharing/CreateShare.tsx` - Added document selection UI

#### Database:
- Added `document_id` column to `matter_shares` table
- Updated unique constraints to support document-level sharing
- Added foreign key constraint for document relation

## Migration Applied
- Date: 2025-09-19
- Method: Manual ALTER TABLE commands during development
- Schema dump: `04_document_sharing_schema.sql`
- Complete dump: `04_document_sharing_complete.sql`

## Testing Required
- ✅ Create matter-level shares (entire matter)
- ✅ Create document-level shares (specific documents)
- ✅ Accept/decline shares
- ✅ View shared documents
- ✅ Multiple document shares from same matter to same firm
- ✅ Uniqueness constraint enforcement

## Backward Compatibility
- ✅ Existing matter-level shares continue to work unchanged
- ✅ New document-level sharing is additive functionality
- ✅ No breaking changes to existing API contracts
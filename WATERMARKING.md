# Document Watermarking System

## Overview

The DMS includes a comprehensive watermarking system for protecting shared documents. Watermarks are automatically applied to documents when they are shared with external firms (cross-firm sharing).

## How It Works

### 1. **When Watermarks Are Applied**
- ✅ **External Shares Only**: Watermarks are applied when documents are shared with other law firms
- ✅ **PDF Support**: Currently supports PDF documents only
- ✅ **Configurable**: Admins can enable/disable and customize watermarks
- ❌ **Internal Viewing**: Regular document viewing within the same firm does NOT apply watermarks

### 2. **Watermark Components**
Each watermarked document includes:
- **Header**: Firm name and confidentiality level
- **Footer**: Recipient firm, share ID, and timestamp
- **Diagonal Watermark**: Custom text (configurable by admin)
- **Legal Notices**: Additional notices for attorney work product

### 3. **Admin Configuration**
Firm admins can configure watermarking in **Admin → System Settings → Document Management**:

- **Enable/Disable**: Turn watermarking on or off
- **Custom Text**: Set watermark text (use `{firm_name}` placeholder)
- **Opacity**: Control watermark transparency (0.1 to 1.0)

## How to Test Watermarking

### Prerequisites
1. Have two firms set up in the system
2. Have users from different firms
3. Have PDF documents uploaded

### Testing Steps

#### Step 1: Configure Watermark Settings
1. Log in as a **firm admin**
2. Go to **Admin → System Settings**
3. Navigate to **Document Management** tab
4. Configure watermark settings:
   - ✅ Enable Document Watermarks
   - Set text: `CONFIDENTIAL - {firm_name}`
   - Set opacity: `0.3`
5. **Save** settings

#### Step 2: Create Cross-Firm Share
1. Go to **Admin → Share Management**
2. Click **Create Share**
3. Fill in details:
   - Matter: Select a matter with documents
   - Recipient Firm: Select a different firm
   - Permissions: Any level
   - **Important**: Ensure "Watermark documents" is checked
4. Create the share

#### Step 3: Test Watermarked Download
1. Log in as a user from the **recipient firm**
2. Navigate to **Shares → Received Shares**
3. Open the shared matter
4. **Download or view a PDF document**
5. **Verify**: The PDF should contain:
   - Header with firm name and confidentiality level
   - Footer with share information
   - Diagonal watermark text
   - "_watermarked" suffix in filename

### Troubleshooting

#### Watermarks Not Appearing?
1. **Check Settings**: Ensure watermarking is enabled in System Settings
2. **File Type**: Only PDF files are currently supported
3. **Share Type**: Only external (cross-firm) shares get watermarked
4. **Logs**: Check application logs for watermarking messages

#### Common Issues
- **Internal shares**: Documents viewed within the same firm don't get watermarked
- **Non-PDF files**: Only PDFs are watermarked (other file types show warning in logs)
- **Share permissions**: User must have proper permissions to access shared documents

## Technical Details

### Supported File Types
- ✅ **PDF** (`application/pdf`) - Full support
- ⏳ **Word Documents** - Planned for future release
- ⏳ **Images (JPEG/PNG)** - Planned for future release

### Watermark Service
The watermarking is handled by `WatermarkService` which:
- Reads admin configuration from system settings
- Uses `pdf-lib` library for PDF manipulation
- Applies multiple watermark layers (header, footer, diagonal)
- Handles opacity and custom text settings

### Security Features
- Watermarks are applied server-side (cannot be disabled by clients)
- Each watermark includes unique share ID for tracking
- Confidentiality levels automatically add appropriate legal notices
- Watermarked files are clearly marked with "_watermarked" suffix

## Future Enhancements

### Planned Features
1. **Word Document Support**: Watermarking for .doc/.docx files
2. **Image Watermarking**: Support for JPEG/PNG files
3. **Internal Watermarking**: Optional watermarks for internal document viewing
4. **Advanced Positioning**: More control over watermark placement
5. **Template System**: Predefined watermark templates for different confidentiality levels

### Configuration Options
- **Position Control**: Top/bottom/center/diagonal positioning
- **Font Options**: Different fonts and sizes
- **Color Schemes**: Custom watermark colors
- **Batch Processing**: Watermark multiple documents at once
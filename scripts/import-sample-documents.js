#!/usr/bin/env node

/**
 * Document Import Script for Legal Document Management System
 * 
 * This script imports all sample documents into their respective matters
 * by mapping document file paths to matter IDs based on document content
 * and matter names.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost/api';
const DOCUMENTS_DIR = path.join(__dirname, '..', 'sample_documents');
const JWT_TOKEN = process.env.JWT_TOKEN; // Set this environment variable

// Document to Matter mapping based on content analysis
const DOCUMENT_MATTER_MAPPING = {
  // Saul Goodman & Associates - Walter White Money Laundering
  'Walter_White_Money_Laundering': {
    matter_id: '11111111-1111-1111-1111-111111111111',
    matter_title: 'State v. Walter White - Money Laundering Defense',
    firm_name: 'Saul Goodman & Associates'
  },
  
  // Saul Goodman & Associates - Jesse Pinkman Drug Possession  
  'Jesse_Pinkman_Drug_Possession': {
    matter_id: '22222222-2222-2222-2222-222222222222',
    matter_title: 'State v. Jesse Pinkman - Drug Possession',
    firm_name: 'Saul Goodman & Associates'
  },

  // Saul Goodman & Associates - Los Pollos Hermanos FDA Review
  'Los_Pollos_Hermanos': {
    matter_id: '33333333-3333-3333-3333-333333333333',
    matter_title: 'Los Pollos Hermanos - FDA Compliance Review',
    firm_name: 'Saul Goodman & Associates'
  },

  // Saul Goodman & Associates - Beneke Fabricators IRS Audit
  'Beneke_Fabricators_IRS_Audit': {
    matter_id: 'eeeeeeee-4444-5555-6666-777777777777',
    matter_title: 'Beneke Fabricators - IRS Audit Defense',
    firm_name: 'Saul Goodman & Associates'
  },

  // Hamlin, Hamlin & McGill - Mesa Verde Bank Expansion
  'Mesa_Verde_Bank_Expansion': {
    matter_id: '12343003-1234-5678-9abc-123456789abc',
    matter_title: 'Mesa Verde Bank - Colorado Expansion',
    firm_name: 'Hamlin, Hamlin & McGill'
  },

  // Crane, Poole & Schmidt - Happy Helping Hands Charity Fraud
  'Happy_Helping_Hands_Charity_Fraud': {
    matter_id: '22260001-2222-2222-2222-333333333333',
    matter_title: 'Happy Helping Hands - Charity Fraud Defense',
    firm_name: 'Crane, Poole & Schmidt'
  },

  // Crane, Poole & Schmidt - Nimmo Fertility Clinic Malpractice
  'Nimmo_Fertility_Clinic_Malpractice': {
    matter_id: '22260002-2222-2222-2222-333333333333',
    matter_title: 'Nimmo Fertility Clinic - Medical Malpractice',
    firm_name: 'Crane, Poole & Schmidt'
  },

  // Matlock Law Offices - Martha Henderson Murder Defense
  'Martha_Henderson_Murder': {
    matter_id: '66663001-6666-6666-6666-666666666666',
    matter_title: 'State of Georgia v. Martha Henderson - Spousal Murder Defense',
    firm_name: 'Matlock Law Offices'
  },

  // Pearson Hardman - Ava Hessington Oil Investigation
  'Ava_Hessington_Oil_Murder': {
    matter_id: '11160001-1111-1111-1111-111111111111',
    matter_title: 'Ava Hessington Oil - Murder Conspiracy Defense',
    firm_name: 'Pearson Hardman'
  },

  // Default Law Firm - TechStart IP Patent
  'TechStart_IP_Patent': {
    matter_id: '11111111-5555-3333-4444-555555555002',
    matter_title: 'IP Patent Filing',
    firm_name: 'Default Law Firm'
  },

  // Default Law Firm - Contract Negotiation Acme
  'Contract_Negotiation_Acme': {
    matter_id: '11111111-5555-3333-4444-555555555001',
    matter_title: 'Contract Negotiation - Q4 2025',
    firm_name: 'Default Law Firm'
  },

  // Default Law Firm - Global Manufacturing Contract
  'Global_Manufacturing_Contract_Negotiation': {
    matter_id: 'cea378bc-4798-4255-b9c1-21a057ffb450',
    matter_title: 'Contract Negotiation – Q4 2025',
    firm_name: 'Default Law Firm'
  },

  // Default Law Firm - Greenfield Development Real Estate
  'Greenfield_Development_Real_Estate': {
    matter_id: 'f7f2fd3c-63b5-4bfc-a36c-4676d32b26c4',
    matter_title: 'Real Estate Transaction – Greenfield Project',
    firm_name: 'Default Law Firm'
  },

  // Default Law Firm - FinTech Data Privacy
  'FinTech_Innovators_Data_Privacy': {
    matter_id: 'aa616bca-8298-4424-bb5c-5cd4aeb06681',
    matter_title: 'Data Privacy Audit – Q1 2025',
    firm_name: 'Default Law Firm'
  },

  // Default Law Firm - HydroGreen Energy River Project
  'HydroGreen_Energy_River_Project': {
    matter_id: '3e4ce7af-8bc5-4f16-b83f-865132cf9f82',
    matter_title: 'Environmental Compliance – River Project',
    firm_name: 'Default Law Firm'
  },

  // Rio Rancho Tech - H1B Application
  'Rio_Rancho_Tech_Patent_Portfolio': {
    matter_id: '12343007-1234-5678-9abc-123456789abc',
    matter_title: 'Rio Rancho Tech - Patent Portfolio Acquisition',
    firm_name: 'Hamlin, Hamlin & McGill'
  },

  // Chicken Brothers Restaurant - Product Liability
  'Chicken_Brothers_Trademark': {
    matter_id: 'eeeeeeee-0000-1111-2222-333333333333',
    matter_title: 'Chicken Brothers - Trademark Infringement Defense',
    firm_name: 'Saul Goodman & Associates'
  },

  // Crossroads Motel - Tax Matter
  'Crossroads_Motel_Zoning': {
    matter_id: 'eeeeeeee-ffff-0000-1111-222222222222',
    matter_title: 'Crossroads Motel - Zoning Variance Application',
    firm_name: 'Saul Goodman & Associates'
  },

  // Schrader Personal Injury
  'Schrader_Personal_Injury': {
    matter_id: '55555555-5555-5555-5555-555555555555',
    matter_title: 'Schrader v. Unknown Assailants - Personal Injury',
    firm_name: 'Saul Goodman & Associates'
  },

  // Steven McSorley Family Law
  'Test_Matter_Steven': {
    matter_id: 'e4ea2e78-c406-479f-a85f-fc785632fd18',
    matter_title: 'Test',
    firm_name: 'Default Law Firm'
  },

  // Sterling Cooper - Lucky Strike Tobacco
  'Lucky_Strike_Tobacco_Litigation': {
    matter_id: '55560001-5555-5555-5555-555555555555',
    matter_title: 'Lucky Strike - Tobacco Health Litigation',
    firm_name: 'Sterling Cooper Legal Department'
  }
};

// Document type mappings based on file content and names
const DOCUMENT_TYPE_MAPPING = {
  'Criminal_Complaint': 'pleading',
  'Motion_to_Suppress': 'motion',
  'Police_Report': 'evidence',
  'Bank_Records_Analysis': 'financial',
  'Settlement_Demand_Letter': 'correspondence',
  'Due_Diligence_Report': 'corporate',
  'Federal_Reserve_Application': 'regulatory',
  'Medical_Examiner_Report': 'expert_report',
  'Defense_Strategy_Memo': 'work_product',
  'SEC_Investigation_Subpoena': 'subpoena',
  'Expert_Witness_Report': 'expert_report',
  'Email_Chain': 'correspondence',
  'Deposition_Transcript': 'deposition',
  'Patent_Application': 'intellectual_property',
  'Class_Action_Complaint': 'pleading',
  'Chapter_11_Petition': 'bankruptcy',
  'IRS_Audit_Report': 'financial',
  'EPA_Notice_of_Violation': 'regulatory',
  'Purchase_and_Sale_Agreement': 'contract',
  'Employment_Discrimination_Complaint': 'complaint',
  'Supply_Chain_Agreement': 'contract',
  'H1B_Visa_Application': 'immigration',
  'Product_Liability_Complaint': 'pleading',
  'IRS_Offer_in_Compromise': 'financial',
  'Insurance_Coverage_Analysis': 'expert_report',
  'Divorce_Petition': 'family_law',
  'Document_Production_Response': 'discovery',
  'Forensic_Accounting_Expert_Report': 'expert_report',
  'Settlement_Agreement': 'settlement'
};

// Utility functions
function getDocumentType(filename) {
  for (const [key, type] of Object.entries(DOCUMENT_TYPE_MAPPING)) {
    if (filename.includes(key)) {
      return type;
    }
  }
  
  // Default based on file extension
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'document';
    case '.docx': case '.doc': return 'document';
    case '.txt': return 'correspondence';
    case '.xlsx': case '.xls': return 'financial';
    case '.eml': return 'correspondence';
    case '.jpg': case '.png': return 'evidence';
    default: return 'document';
  }
}

function getDocumentTitle(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  return nameWithoutExt.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
}

function getDocumentDescription(filename, folderPath) {
  const type = getDocumentType(filename);
  const folder = path.basename(folderPath);
  return `${type.charAt(0).toUpperCase() + type.slice(1)} - ${folder.replace(/_/g, ' ')}`;
}

function isPrivileged(filename) {
  const privilegedKeywords = [
    'attorney', 'privileged', 'work_product', 'strategy', 'memo',
    'confidential', 'settlement', 'advice', 'counsel'
  ];
  return privilegedKeywords.some(keyword => 
    filename.toLowerCase().includes(keyword)
  );
}

function isConfidential(filename) {
  const confidentialKeywords = [
    'confidential', 'settlement', 'financial', 'personal', 'medical',
    'bank_records', 'expert_report', 'strategy'
  ];
  return confidentialKeywords.some(keyword => 
    filename.toLowerCase().includes(keyword)
  );
}

function getTags(filename, folderPath) {
  const tags = [];
  const folder = path.basename(folderPath);
  
  // Add folder-based tags
  if (folder.includes('Criminal')) tags.push('criminal');
  if (folder.includes('Corporate')) tags.push('corporate');
  if (folder.includes('Civil')) tags.push('litigation');
  if (folder.includes('Environmental')) tags.push('environmental');
  if (folder.includes('Employment')) tags.push('employment');
  if (folder.includes('Real_Estate')) tags.push('real-estate');
  if (folder.includes('Tax')) tags.push('tax');
  if (folder.includes('Immigration')) tags.push('immigration');
  if (folder.includes('Family')) tags.push('family-law');
  
  // Add document-type based tags
  const type = getDocumentType(filename);
  tags.push(type);
  
  // Add content-based tags
  if (filename.includes('Settlement')) tags.push('settlement');
  if (filename.includes('Expert')) tags.push('expert-witness');
  if (filename.includes('Financial')) tags.push('financial');
  if (filename.includes('Medical')) tags.push('medical');
  
  return tags;
}

function getMatterIdFromPath(filePath) {
  const parts = filePath.split(path.sep);
  
  // Look for matter folder name in path
  for (const part of parts) {
    for (const [key, mapping] of Object.entries(DOCUMENT_MATTER_MAPPING)) {
      if (part.includes(key) || filePath.includes(key)) {
        return mapping.matter_id;
      }
    }
  }
  
  // Default fallback - Walter White case for testing
  return '11111111-1111-1111-1111-111111111111';
}

// File scanning function
function scanDocuments(dir) {
  const documents = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        
        // Only process document files
        if (['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.eml', '.rtf', '.jpg', '.png', '.zip'].includes(ext)) {
          documents.push({
            filePath: fullPath,
            filename: item,
            relativePath: path.relative(DOCUMENTS_DIR, fullPath),
            size: stat.size,
            matterId: getMatterIdFromPath(fullPath),
            title: getDocumentTitle(item),
            description: getDocumentDescription(item, currentDir),
            documentType: getDocumentType(item),
            tags: getTags(item, currentDir),
            privileged: isPrivileged(item),
            confidential: isConfidential(item),
            workProduct: item.toLowerCase().includes('work_product') || item.toLowerCase().includes('strategy')
          });
        }
      }
    }
  }
  
  scanDir(dir);
  return documents;
}

// Upload function
async function uploadDocument(doc) {
  try {
    console.log(`📄 Uploading: ${doc.filename} to matter ${doc.matterId}`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(doc.filePath));
    formData.append('matter_id', doc.matterId);
    formData.append('title', doc.title);
    formData.append('description', doc.description);
    formData.append('document_type', doc.documentType);
    formData.append('tags', JSON.stringify(doc.tags));
    formData.append('confidential', doc.confidential.toString());
    formData.append('privileged', doc.privileged.toString());
    formData.append('work_product', doc.workProduct.toString());
    formData.append('document_date', new Date().toISOString().split('T')[0]);
    
    const headers = {
      ...formData.getHeaders()
    };
    
    if (JWT_TOKEN) {
      headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Successfully uploaded: ${doc.filename} (ID: ${result.id})`);
      return { success: true, document: result };
    } else {
      const error = await response.text();
      console.error(`❌ Failed to upload ${doc.filename}: ${response.status} - ${error}`);
      return { success: false, error: `${response.status} - ${error}` };
    }
  } catch (error) {
    console.error(`❌ Error uploading ${doc.filename}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Document Import Process');
  console.log('=====================================');
  
  // Check if documents directory exists
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    console.error(`❌ Documents directory not found: ${DOCUMENTS_DIR}`);
    process.exit(1);
  }
  
  // Scan for documents
  console.log(`📁 Scanning documents in: ${DOCUMENTS_DIR}`);
  const documents = scanDocuments(DOCUMENTS_DIR);
  
  console.log(`📊 Found ${documents.length} documents to import`);
  console.log('');
  
  // Display summary
  console.log('📋 Import Summary:');
  const byMatter = documents.reduce((acc, doc) => {
    acc[doc.matterId] = (acc[doc.matterId] || 0) + 1;
    return acc;
  }, {});
  
  for (const [matterId, count] of Object.entries(byMatter)) {
    const mapping = Object.values(DOCUMENT_MATTER_MAPPING).find(m => m.matter_id === matterId);
    const matterTitle = mapping ? mapping.matter_title : 'Unknown Matter';
    console.log(`   📂 ${matterTitle}: ${count} documents`);
  }
  console.log('');
  
  // Confirm upload
  if (process.argv.includes('--dry-run')) {
    console.log('🔍 Dry run mode - no documents will be uploaded');
    documents.forEach(doc => {
      console.log(`   Would upload: ${doc.filename} -> ${doc.matterId}`);
    });
    return;
  }
  
  // Perform upload
  console.log('📤 Starting upload process...');
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    console.log(`\n[${i + 1}/${documents.length}] Processing: ${doc.filename}`);
    
    const result = await uploadDocument(doc);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        filename: doc.filename,
        error: result.error
      });
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Final summary
  console.log('\n🎉 Import Process Complete!');
  console.log('===========================');
  console.log(`✅ Successfully uploaded: ${results.success} documents`);
  console.log(`❌ Failed uploads: ${results.failed} documents`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed Uploads:');
    results.errors.forEach(error => {
      console.log(`   • ${error.filename}: ${error.error}`);
    });
  }
  
  console.log('\n📊 Next Steps:');
  console.log('   1. Check the document management interface');
  console.log('   2. Test search functionality with uploaded documents');
  console.log('   3. Verify document processing and OCR results');
  console.log('   4. Test access controls and permissions');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}
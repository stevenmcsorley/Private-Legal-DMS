import React from 'react';
import { DocumentList } from '../components/documents';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Documents</h1>
      <DocumentList />
    </div>
  );
};
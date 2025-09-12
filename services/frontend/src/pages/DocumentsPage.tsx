import React from 'react';
import { DocumentList } from '../components/documents';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documents</h1>
      <DocumentList />
    </div>
  );
};

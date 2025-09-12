import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const LegalHoldManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Legal Hold Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Hold Management</h3>
          <p className="text-gray-600">
            Legal hold creation and management functionality would be implemented here.
            This includes creating holds, assigning custodians, managing hold notifications, and tracking compliance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
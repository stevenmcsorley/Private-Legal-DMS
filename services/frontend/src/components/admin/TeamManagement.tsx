import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const TeamManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Team Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
          <p className="text-gray-600">
            Team creation and management functionality would be implemented here.
            This would include creating teams, assigning users, and managing team permissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
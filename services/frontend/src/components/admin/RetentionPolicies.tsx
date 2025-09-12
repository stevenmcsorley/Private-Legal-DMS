import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export const RetentionPolicies = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Archive className="h-5 w-5 mr-2" />
          Retention Policies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Retention Policy Management</h3>
          <p className="text-gray-600">
            Document retention policy configuration and management would be implemented here.
            This includes setting retention periods, scheduling automatic deletions, and managing compliance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export const SystemSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          System Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
          <p className="text-gray-600">
            System configuration and settings would be implemented here.
            This includes firm settings, integration configurations, security policies, and system preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
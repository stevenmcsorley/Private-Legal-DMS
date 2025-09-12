// import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, Users, FileText, Building } from 'lucide-react';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Legal DMS</h1>
          <p className="text-gray-600">Secure Document Management System</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-center space-y-2">
              <FileText className="h-6 w-6 mx-auto text-blue-600" />
              <p className="text-sm font-medium">Document Management</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Users className="h-6 w-6 mx-auto text-green-600" />
              <p className="text-sm font-medium">Cross-Firm Sharing</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Building className="h-6 w-6 mx-auto text-purple-600" />
              <p className="text-sm font-medium">Client Portal</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Shield className="h-6 w-6 mx-auto text-red-600" />
              <p className="text-sm font-medium">Legal Hold</p>
            </div>
          </Card>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your legal document management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogin}
              className="w-full" 
              size="lg"
            >
              Sign In with Keycloak
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Secure authentication powered by Keycloak</p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-blue-900">Demo System</h3>
              <p className="text-sm text-blue-800">
                This is a demonstration of the Legal DMS with full Phase 1 and Phase 2 functionality including cross-firm collaboration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
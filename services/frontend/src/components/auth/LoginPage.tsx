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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('/images/login-bg.png')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative z-10 flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-lg font-medium text-slate-300">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Background image + overlay */}
      <div className="absolute inset-0 bg-[url('/images/login-bg.png')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold">Legal DMS</h1>
          <p className="text-slate-400">Secure Document Management System</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-center space-y-2">
              <FileText className="h-6 w-6 mx-auto text-amber-500" />
              <p className="text-sm font-medium">Document Management</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Users className="h-6 w-6 mx-auto text-amber-500" />
              <p className="text-sm font-medium">Cross-Firm Sharing</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Building className="h-6 w-6 mx-auto text-amber-500" />
              <p className="text-sm font-medium">Client Portal</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <Shield className="h-6 w-6 mx-auto text-amber-500" />
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
            
            <div className="mt-4 text-center text-sm text-slate-400">
              <p>Secure authentication powered by Keycloak</p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-slate-100">Demo System</h3>
              <p className="text-sm text-slate-400">
                This is a demonstration of the Legal DMS with full Phase 1 and Phase 2 functionality including cross-firm collaboration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

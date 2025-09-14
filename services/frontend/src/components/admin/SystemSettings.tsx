import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Shield, Database, Mail, FileImage } from 'lucide-react';

interface SystemSettings {
  firm_name: string;
  default_retention_years: number;
  max_file_size_mb: number;
  enable_ocr: boolean;
  enable_legal_holds: boolean;
  enable_cross_firm_sharing: boolean;
  backup_config?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retention_days: number;
    enabled: boolean;
  };
  smtp_config?: {
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
  };
  watermark_config?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
  security_policy?: {
    session_timeout_minutes: number;
    require_mfa_for_admins: boolean;
    max_login_attempts: number;
    password_expiry_days: number;
  };
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/system-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage('Settings saved successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const updateNestedSettings = <T extends keyof SystemSettings>(
    key: T,
    updates: Partial<NonNullable<SystemSettings[T]>>
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: { ...(settings[key] || {} as any), ...updates },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading system settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Failed to load system settings</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            System Settings
          </h2>
          <p className="text-gray-600 mt-1">Configure system-wide settings and policies</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving} className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-md ${saveMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {saveMessage}
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firm_name">Firm Name</Label>
                <Input
                  id="firm_name"
                  value={settings.firm_name}
                  onChange={(e) => updateSettings({ firm_name: e.target.value })}
                  placeholder="Enter firm name"
                />
              </div>

              <div>
                <Label htmlFor="retention_years">Default Retention Period (Years)</Label>
                <Input
                  id="retention_years"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.default_retention_years}
                  onChange={(e) => updateSettings({ default_retention_years: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="max_file_size">Maximum File Size (MB)</Label>
                <Input
                  id="max_file_size"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.max_file_size_mb}
                  onChange={(e) => updateSettings({ max_file_size_mb: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_ocr"
                  checked={settings.enable_ocr}
                  onCheckedChange={(checked) => updateSettings({ enable_ocr: !!checked })}
                />
                <Label htmlFor="enable_ocr">Enable Automatic OCR Processing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_legal_holds"
                  checked={settings.enable_legal_holds}
                  onCheckedChange={(checked) => updateSettings({ enable_legal_holds: !!checked })}
                />
                <Label htmlFor="enable_legal_holds">Enable Legal Hold Workflows</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_cross_firm_sharing"
                  checked={settings.enable_cross_firm_sharing}
                  onCheckedChange={(checked) => updateSettings({ enable_cross_firm_sharing: !!checked })}
                />
                <Label htmlFor="enable_cross_firm_sharing">Enable Cross-Firm Sharing</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session_timeout">Session Timeout (Minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security_policy?.session_timeout_minutes || 60}
                  onChange={(e) => updateNestedSettings('security_policy', { 
                    session_timeout_minutes: parseInt(e.target.value) || 60 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="max_login_attempts">Maximum Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.security_policy?.max_login_attempts || 5}
                  onChange={(e) => updateNestedSettings('security_policy', { 
                    max_login_attempts: parseInt(e.target.value) || 5 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="password_expiry">Password Expiry (Days)</Label>
                <Input
                  id="password_expiry"
                  type="number"
                  min="30"
                  max="365"
                  value={settings.security_policy?.password_expiry_days || 90}
                  onChange={(e) => updateNestedSettings('security_policy', { 
                    password_expiry_days: parseInt(e.target.value) || 90 
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="require_mfa"
                  checked={settings.security_policy?.require_mfa_for_admins || false}
                  onCheckedChange={(checked) => updateNestedSettings('security_policy', { 
                    require_mfa_for_admins: !!checked 
                  })}
                />
                <Label htmlFor="require_mfa">Require MFA for Administrators</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Backup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="backup_enabled"
                  checked={settings.backup_config?.enabled || false}
                  onCheckedChange={(checked) => updateNestedSettings('backup_config', { enabled: !!checked })}
                />
                <Label htmlFor="backup_enabled">Enable Automatic Backups</Label>
              </div>

              <div>
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <Select
                  value={settings.backup_config?.frequency || 'daily'}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    updateNestedSettings('backup_config', { frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backup_retention">Backup Retention (Days)</Label>
                <Input
                  id="backup_retention"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.backup_config?.retention_days || 30}
                  onChange={(e) => updateNestedSettings('backup_config', { 
                    retention_days: parseInt(e.target.value) || 30 
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                SMTP Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smtp_enabled"
                  checked={settings.smtp_config?.enabled || false}
                  onCheckedChange={(checked) => updateNestedSettings('smtp_config', { enabled: !!checked })}
                />
                <Label htmlFor="smtp_enabled">Enable Email Notifications</Label>
              </div>

              <div>
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_config?.host || ''}
                  onChange={(e) => updateNestedSettings('smtp_config', { host: e.target.value })}
                  placeholder="smtp.example.com"
                />
              </div>

              <div>
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  min="1"
                  max="65535"
                  value={settings.smtp_config?.port || 587}
                  onChange={(e) => updateNestedSettings('smtp_config', { 
                    port: parseInt(e.target.value) || 587 
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smtp_secure"
                  checked={settings.smtp_config?.secure || false}
                  onCheckedChange={(checked) => updateNestedSettings('smtp_config', { secure: !!checked })}
                />
                <Label htmlFor="smtp_secure">Use Secure Connection (TLS/SSL)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Document Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="watermark_enabled"
                  checked={settings.watermark_config?.enabled || false}
                  onCheckedChange={(checked) => updateNestedSettings('watermark_config', { enabled: !!checked })}
                />
                <Label htmlFor="watermark_enabled">Enable Document Watermarks</Label>
              </div>

              <div>
                <Label htmlFor="watermark_text">Watermark Text</Label>
                <Input
                  id="watermark_text"
                  value={settings.watermark_config?.text || ''}
                  onChange={(e) => updateNestedSettings('watermark_config', { text: e.target.value })}
                  placeholder="CONFIDENTIAL - {firm_name}"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use {'{firm_name}'} to include the firm name in the watermark
                </p>
              </div>

              <div>
                <Label htmlFor="watermark_opacity">Watermark Opacity</Label>
                <Input
                  id="watermark_opacity"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.watermark_config?.opacity || 0.3}
                  onChange={(e) => updateNestedSettings('watermark_config', { 
                    opacity: parseFloat(e.target.value) || 0.3 
                  })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Value between 0.1 (very light) and 1.0 (opaque)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
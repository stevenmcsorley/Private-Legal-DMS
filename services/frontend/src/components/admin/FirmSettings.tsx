import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  Save,
  Loader2,
  Shield,
  FileText,
  Palette,
  Bell,
  Globe,
  Clock
} from 'lucide-react';

interface FirmSettingsData {
  document_management?: {
    default_retention_years: number;
    auto_classification: boolean;
    ocr_enabled: boolean;
    virus_scanning: boolean;
  };
  security?: {
    mfa_required: boolean;
    session_timeout_minutes: number;
    default_clearance_levels: Record<string, number>;
  };
  branding?: {
    logo_url?: string;
    primary_color?: string;
    firm_letterhead?: string;
  };
  features?: {
    client_portal_enabled: boolean;
    cross_firm_sharing: boolean;
    advanced_search: boolean;
  };
  notifications?: {
    slack_integration?: {
      webhook_url: string;
      enabled: boolean;
    };
    webhook_url?: string;
  };
}

interface FirmSettingsProps {
  firmId: string;
  firmName: string;
}

export const FirmSettings = ({ firmId, firmName }: FirmSettingsProps) => {
  const [settings, setSettings] = useState<FirmSettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [firmId]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/admin/firms/${firmId}/settings`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data || {});
      }
    } catch (error) {
      console.error('Error fetching firm settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/firms/${firmId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof FirmSettingsData, key: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Settings className="h-5 w-5 text-amber-500" />
            <span>{firmName} Settings</span>
          </h2>
          <p className="text-slate-400">Configure firm-specific preferences and policies</p>
        </div>
        
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Document Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retention-years">Default Retention Period (Years)</Label>
              <Input
                id="retention-years"
                type="number"
                min="1"
                max="50"
                value={settings.document_management?.default_retention_years || 7}
                onChange={(e) => updateSetting('document_management', 'default_retention_years', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-classification"
                  checked={settings.document_management?.auto_classification ?? true}
                  onCheckedChange={(checked) => updateSetting('document_management', 'auto_classification', checked)}
                />
                <Label htmlFor="auto-classification">Automatic document classification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ocr-enabled"
                  checked={settings.document_management?.ocr_enabled ?? true}
                  onCheckedChange={(checked) => updateSetting('document_management', 'ocr_enabled', checked)}
                />
                <Label htmlFor="ocr-enabled">OCR processing for scanned documents</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="virus-scanning"
                  checked={settings.document_management?.virus_scanning ?? true}
                  onCheckedChange={(checked) => updateSetting('document_management', 'virus_scanning', checked)}
                />
                <Label htmlFor="virus-scanning">Real-time virus scanning</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span>Security & Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="30"
                max="1440"
                value={settings.security?.session_timeout_minutes || 480}
                onChange={(e) => updateSetting('security', 'session_timeout_minutes', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mfa-required"
                checked={settings.security?.mfa_required ?? false}
                onCheckedChange={(checked) => updateSetting('security', 'mfa_required', checked)}
              />
              <Label htmlFor="mfa-required">Require multi-factor authentication</Label>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Default Clearance Levels by Role</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries({
                  'Super Admin': 10,
                  'Firm Admin': 8,
                  'Legal Manager': 7,
                  'Legal Professional': 5,
                  'Paralegal': 4,
                  'Support Staff': 3,
                  'Client User': 2,
                }).map(([role, level]) => (
                  <div key={role} className="flex justify-between">
                    <span className="text-slate-400">{role}:</span>
                    <span className="text-amber-400">Level {level}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-500" />
              <span>Features & Capabilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="client-portal"
                  checked={settings.features?.client_portal_enabled ?? true}
                  onCheckedChange={(checked) => updateSetting('features', 'client_portal_enabled', checked)}
                />
                <Label htmlFor="client-portal">Enable client portal access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cross-firm-sharing"
                  checked={settings.features?.cross_firm_sharing ?? true}
                  onCheckedChange={(checked) => updateSetting('features', 'cross_firm_sharing', checked)}
                />
                <Label htmlFor="cross-firm-sharing">Allow cross-firm matter sharing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advanced-search"
                  checked={settings.features?.advanced_search ?? true}
                  onCheckedChange={(checked) => updateSetting('features', 'advanced_search', checked)}
                />
                <Label htmlFor="advanced-search">Advanced search capabilities</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <span>Branding & Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                placeholder="https://example.com/logo.png"
                value={settings.branding?.logo_url || ''}
                onChange={(e) => updateSetting('branding', 'logo_url', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.branding?.primary_color || '#f59e0b'}
                  onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  placeholder="#f59e0b"
                  value={settings.branding?.primary_color || ''}
                  onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterhead">Firm Letterhead URL</Label>
              <Input
                id="letterhead"
                placeholder="https://example.com/letterhead.png"
                value={settings.branding?.firm_letterhead || ''}
                onChange={(e) => updateSetting('branding', 'firm_letterhead', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              <span>Notifications & Integrations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="slack-enabled"
                    checked={settings.notifications?.slack_integration?.enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'slack_integration', {
                      ...settings.notifications?.slack_integration,
                      enabled: checked
                    })}
                  />
                  <Label htmlFor="slack-enabled">Enable Slack notifications</Label>
                </div>
                
                {settings.notifications?.slack_integration?.enabled && (
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.notifications?.slack_integration?.webhook_url || ''}
                    onChange={(e) => updateSetting('notifications', 'slack_integration', {
                      ...settings.notifications?.slack_integration,
                      webhook_url: e.target.value
                    })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Custom Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-system.com/webhook"
                  value={settings.notifications?.webhook_url || ''}
                  onChange={(e) => updateSetting('notifications', 'webhook_url', e.target.value)}
                />
              </div>

              {/* TODO: Add email notifications when email system is implemented */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Email notifications will be available when the email system is configured</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
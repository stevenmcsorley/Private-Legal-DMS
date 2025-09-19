import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

interface CreateFirmFormData {
  name: string;
  external_ref: string;
  settings: {
    description: string;
    business_address: string;
    contact_phone: string;
    contact_email: string;
    primary_contact_name: string;
    timezone: string;
    billing_settings: {
      default_hourly_rate: number;
      currency: string;
      billing_increment: number;
    };
    security_settings: {
      require_mfa: boolean;
      password_expiry_days: number;
      max_login_attempts: number;
      session_timeout_minutes: number;
    };
    document_settings: {
      default_retention_years: number;
      enable_auto_ocr: boolean;
      require_document_approval: boolean;
      max_document_size_mb: number;
    };
  };
}

export const FirmCreate: React.FC = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateFirmFormData>({
    name: '',
    external_ref: '',
    settings: {
      description: '',
      business_address: '',
      contact_phone: '',
      contact_email: '',
      primary_contact_name: '',
      timezone: 'UTC',
      billing_settings: {
        default_hourly_rate: 350,
        currency: 'USD',
        billing_increment: 6,
      },
      security_settings: {
        require_mfa: false,
        password_expiry_days: 90,
        max_login_attempts: 5,
        session_timeout_minutes: 480,
      },
      document_settings: {
        default_retention_years: 7,
        enable_auto_ocr: true,
        require_document_approval: false,
        max_document_size_mb: 100,
      },
    },
  });

  const handleBackToFirms = () => {
    navigate('/admin?tab=firms');
  };

  const createFirm = async () => {
    if (!formData.name || !formData.settings.contact_email) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    
    try {
      const response = await fetch('/api/admin/firms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Firm created successfully!');
        navigate('/admin?tab=firms');
      } else {
        const error = await response.json();
        alert(`Failed to create firm: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating firm:', error);
      alert('Failed to create firm. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToFirms}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Firms
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Create New Firm</h1>
            <p className="text-slate-400">Add a new firm to the system with complete configuration</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToFirms}>
            Cancel
          </Button>
          <Button onClick={createFirm} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Firm
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Creation Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="billing">Billing & Finance</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="documents">Document Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Firm Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Legal Partners LLP"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_ref">External Reference</Label>
                  <Input
                    id="external_ref"
                    placeholder="ACME-001"
                    value={formData.external_ref}
                    onChange={(e) => setFormData({...formData, external_ref: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the firm's practice areas and specialties..."
                  value={formData.settings.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, description: e.target.value}
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address">Business Address</Label>
                <Textarea
                  id="business_address"
                  placeholder="123 Main Street, Suite 400, City, State 12345"
                  value={formData.settings.business_address}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, business_address: e.target.value}
                  })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contact@acmelegal.com"
                    value={formData.settings.contact_email}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {...formData.settings, contact_email: e.target.value}
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.settings.contact_phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {...formData.settings, contact_phone: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_name">Primary Contact Name</Label>
                  <Input
                    id="primary_contact_name"
                    placeholder="John Smith, Managing Partner"
                    value={formData.settings.primary_contact_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {...formData.settings, primary_contact_name: e.target.value}
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    placeholder="America/New_York"
                    value={formData.settings.timezone}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {...formData.settings, timezone: e.target.value}
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_hourly_rate">Default Hourly Rate</Label>
                  <Input
                    id="default_hourly_rate"
                    type="number"
                    min="0"
                    step="25"
                    value={formData.settings.billing_settings.default_hourly_rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        billing_settings: {
                          ...formData.settings.billing_settings,
                          default_hourly_rate: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    value={formData.settings.billing_settings.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        billing_settings: {
                          ...formData.settings.billing_settings,
                          currency: e.target.value
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_increment">Billing Increment (minutes)</Label>
                  <Input
                    id="billing_increment"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.settings.billing_settings.billing_increment}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        billing_settings: {
                          ...formData.settings.billing_settings,
                          billing_increment: parseInt(e.target.value) || 6
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_expiry_days">Password Expiry (days)</Label>
                  <Input
                    id="password_expiry_days"
                    type="number"
                    min="30"
                    max="365"
                    value={formData.settings.security_settings.password_expiry_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        security_settings: {
                          ...formData.settings.security_settings,
                          password_expiry_days: parseInt(e.target.value) || 90
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={formData.settings.security_settings.max_login_attempts}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        security_settings: {
                          ...formData.settings.security_settings,
                          max_login_attempts: parseInt(e.target.value) || 5
                        }
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout_minutes"
                  type="number"
                  min="15"
                  max="1440"
                  value={formData.settings.security_settings.session_timeout_minutes}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      security_settings: {
                        ...formData.settings.security_settings,
                        session_timeout_minutes: parseInt(e.target.value) || 480
                      }
                    }
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="require_mfa"
                  checked={formData.settings.security_settings.require_mfa}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      security_settings: {
                        ...formData.settings.security_settings,
                        require_mfa: e.target.checked
                      }
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="require_mfa">Require Multi-Factor Authentication</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_retention_years">Default Retention Period (years)</Label>
                  <Input
                    id="default_retention_years"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.settings.document_settings.default_retention_years}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        document_settings: {
                          ...formData.settings.document_settings,
                          default_retention_years: parseInt(e.target.value) || 7
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_document_size_mb">Max Document Size (MB)</Label>
                  <Input
                    id="max_document_size_mb"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.settings.document_settings.max_document_size_mb}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        document_settings: {
                          ...formData.settings.document_settings,
                          max_document_size_mb: parseInt(e.target.value) || 100
                        }
                      }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable_auto_ocr"
                    checked={formData.settings.document_settings.enable_auto_ocr}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        document_settings: {
                          ...formData.settings.document_settings,
                          enable_auto_ocr: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enable_auto_ocr">Enable automatic OCR processing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="require_document_approval"
                    checked={formData.settings.document_settings.require_document_approval}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        document_settings: {
                          ...formData.settings.document_settings,
                          require_document_approval: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="require_document_approval">Require approval for document uploads</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building, 
  User, 
  Settings, 
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Shield,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface FirmOnboardingData {
  // Firm Information
  name: string;
  external_ref: string;
  
  // Admin User Information
  admin_email: string;
  admin_display_name: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_job_title: string;
  
  // Initial Settings
  settings: {
    document_management?: {
      default_retention_years: number;
      auto_classification: boolean;
      ocr_enabled: boolean;
      virus_scanning: boolean;
    };
    security?: {
      mfa_required: boolean;
      session_timeout_minutes: number;
    };
    features?: {
      client_portal_enabled: boolean;
      cross_firm_sharing: boolean;
      advanced_search: boolean;
    };
  };
  initial_retention_classes: string[];
}

interface OnboardingResult {
  firm: {
    id: string;
    name: string;
    external_ref?: string;
    settings: Record<string, any>;
  };
  admin_user: {
    id: string;
    email: string;
    display_name: string;
    keycloak_id?: string;
  };
  setup_status: {
    firm_created: boolean;
    admin_created: boolean;
    retention_classes_created: boolean;
    keycloak_sync: boolean;
    next_steps: string[];
  };
}

export const FirmOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  
  const [formData, setFormData] = useState<FirmOnboardingData>({
    name: '',
    external_ref: '',
    admin_email: '',
    admin_display_name: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_job_title: '',
    settings: {
      document_management: {
        default_retention_years: 7,
        auto_classification: true,
        ocr_enabled: true,
        virus_scanning: true,
      },
      security: {
        mfa_required: false,
        session_timeout_minutes: 480,
      },
      features: {
        client_portal_enabled: true,
        cross_firm_sharing: true,
        advanced_search: true,
      },
    },
    initial_retention_classes: [
      'Standard Legal Documents',
      'Client Communications',
      'Financial Records',
      'Litigation Files',
      'Contracts and Agreements'
    ],
  });

  const updateFormData = (updates: Partial<FirmOnboardingData>) => {
    setFormData({ ...formData, ...updates });
  };

  const updateSettings = (section: string, updates: Record<string, any>) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [section]: {
          ...formData.settings[section as keyof typeof formData.settings],
          ...updates,
        },
      },
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.admin_email && formData.admin_display_name && 
                  formData.admin_first_name && formData.admin_last_name);
      case 2:
        return true; // Settings are optional
      case 3:
        return true; // Review step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/firms/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setOnboardingResult(result);
        setCurrentStep(4); // Success step
      } else {
        const error = await response.json();
        alert(`Onboarding failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Firm & Administrator Information</h3>
              <p className="text-slate-400">Set up your firm and create the first administrator</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Firm Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-amber-500" />
                  <span>Firm Details</span>
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="firm-name">Firm Name *</Label>
                  <Input
                    id="firm-name"
                    placeholder="Smith & Associates Law Firm"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external-ref">External Reference</Label>
                  <Input
                    id="external-ref"
                    placeholder="SA-LAW-001"
                    value={formData.external_ref}
                    onChange={(e) => updateFormData({ external_ref: e.target.value })}
                  />
                </div>
              </div>

              {/* Admin Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>Administrator Details</span>
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email Address *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@smithlaw.com"
                    value={formData.admin_email}
                    onChange={(e) => updateFormData({ admin_email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-display-name">Display Name *</Label>
                  <Input
                    id="admin-display-name"
                    placeholder="John Smith"
                    value={formData.admin_display_name}
                    onChange={(e) => updateFormData({ admin_display_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-first-name">First Name *</Label>
                    <Input
                      id="admin-first-name"
                      placeholder="John"
                      value={formData.admin_first_name}
                      onChange={(e) => updateFormData({ admin_first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-last-name">Last Name *</Label>
                    <Input
                      id="admin-last-name"
                      placeholder="Smith"
                      value={formData.admin_last_name}
                      onChange={(e) => updateFormData({ admin_last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-job-title">Job Title</Label>
                  <Input
                    id="admin-job-title"
                    placeholder="Managing Partner"
                    value={formData.admin_job_title}
                    onChange={(e) => updateFormData({ admin_job_title: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Initial Settings</h3>
              <p className="text-slate-400">Configure your firm's preferences (can be changed later)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Management */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Document Management</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="retention-years">Default Retention (Years)</Label>
                  <Input
                    id="retention-years"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.settings.document_management?.default_retention_years}
                    onChange={(e) => updateSettings('document_management', { 
                      default_retention_years: parseInt(e.target.value) 
                    })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-classification"
                      checked={formData.settings.document_management?.auto_classification}
                      onCheckedChange={(checked) => updateSettings('document_management', { 
                        auto_classification: checked 
                      })}
                    />
                    <Label htmlFor="auto-classification">Auto-classify documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ocr-enabled"
                      checked={formData.settings.document_management?.ocr_enabled}
                      onCheckedChange={(checked) => updateSettings('document_management', { 
                        ocr_enabled: checked 
                      })}
                    />
                    <Label htmlFor="ocr-enabled">Enable OCR processing</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="virus-scanning"
                      checked={formData.settings.document_management?.virus_scanning}
                      onCheckedChange={(checked) => updateSettings('document_management', { 
                        virus_scanning: checked 
                      })}
                    />
                    <Label htmlFor="virus-scanning">Enable virus scanning</Label>
                  </div>
                </div>
              </div>

              {/* Features & Security */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Features & Security</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="30"
                    max="1440"
                    value={formData.settings.security?.session_timeout_minutes}
                    onChange={(e) => updateSettings('security', { 
                      session_timeout_minutes: parseInt(e.target.value) 
                    })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="client-portal"
                      checked={formData.settings.features?.client_portal_enabled}
                      onCheckedChange={(checked) => updateSettings('features', { 
                        client_portal_enabled: checked 
                      })}
                    />
                    <Label htmlFor="client-portal">Enable client portal</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cross-firm-sharing"
                      checked={formData.settings.features?.cross_firm_sharing}
                      onCheckedChange={(checked) => updateSettings('features', { 
                        cross_firm_sharing: checked 
                      })}
                    />
                    <Label htmlFor="cross-firm-sharing">Enable cross-firm sharing</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advanced-search"
                      checked={formData.settings.features?.advanced_search}
                      onCheckedChange={(checked) => updateSettings('features', { 
                        advanced_search: checked 
                      })}
                    />
                    <Label htmlFor="advanced-search">Enable advanced search</Label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-3">Initial Retention Classes</h4>
              <Textarea
                placeholder="Enter retention classes (one per line)"
                value={formData.initial_retention_classes.join('\n')}
                onChange={(e) => updateFormData({ 
                  initial_retention_classes: e.target.value.split('\n').filter(line => line.trim()) 
                })}
                rows={5}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Review & Confirm</h3>
              <p className="text-slate-400">Please review the information before creating the firm</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Building className="h-4 w-4 text-amber-500" />
                    <span>Firm Information</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span>{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">External Ref:</span>
                      <span>{formData.external_ref || 'Not set'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Administrator</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span>{formData.admin_display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span>{formData.admin_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Title:</span>
                      <span>{formData.admin_job_title || 'Not set'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Configuration Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Retention:</span>
                    <span className="ml-2">{formData.settings.document_management?.default_retention_years} years</span>
                  </div>
                  <div>
                    <span className="text-slate-400">OCR:</span>
                    <span className="ml-2">{formData.settings.document_management?.ocr_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Client Portal:</span>
                    <span className="ml-2">{formData.settings.features?.client_portal_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Onboarding Complete!</h3>
              <p className="text-slate-400">Your firm has been successfully set up</p>
            </div>

            {onboardingResult && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-4">Setup Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Firm created: {onboardingResult.firm.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Admin user created: {onboardingResult.admin_user.display_name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Retention classes configured</span>
                      </div>
                      {onboardingResult.setup_status.keycloak_sync ? (
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Identity system synchronized</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-yellow-500" />
                          <span>Identity sync pending (manual setup required)</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-4">Next Steps</h4>
                    <ul className="space-y-2">
                      {onboardingResult.setup_status.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-300">{step}</span>
                        </li>
                      ))}
                      {/* TODO: Add when email system is implemented
                      <li className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm text-slate-300">Check email for setup instructions</span>
                      </li>
                      */}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Building className="h-4 w-4 mr-2" />
          Quick Firm Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firm Onboarding Wizard</DialogTitle>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-amber-500 text-white' 
                    : currentStep > step 
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`h-1 w-8 mx-2 ${
                    currentStep > step ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {renderStep()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && currentStep < 4 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {currentStep === 4 ? 'Close' : 'Cancel'}
            </Button>
            
            {currentStep < 3 && (
              <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Firm
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
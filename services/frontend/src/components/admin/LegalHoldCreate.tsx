import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

interface CreateLegalHoldFormData {
  name: string;
  description: string;
  reason: string;
  type: 'litigation' | 'investigation' | 'audit' | 'regulatory' | 'other';
  matter_id?: string;
  expiry_date?: string;
  auto_apply_to_new_documents: boolean;
  custodian_instructions?: string;
  notification_settings: {
    email_custodians: boolean;
    email_legal_team: boolean;
    reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
    escalation_days?: number;
  };
  search_criteria: {
    keywords: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    document_types: string[];
    custodians: string[];
    matters: string[];
  };
}

export const LegalHoldCreate: React.FC = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateLegalHoldFormData>({
    name: '',
    description: '',
    reason: '',
    type: 'litigation',
    matter_id: '',
    expiry_date: '',
    auto_apply_to_new_documents: true,
    custodian_instructions: '',
    notification_settings: {
      email_custodians: true,
      email_legal_team: true,
      reminder_frequency: 'monthly',
      escalation_days: 30,
    },
    search_criteria: {
      keywords: [],
      date_range: {},
      document_types: [],
      custodians: [],
      matters: [],
    },
  });

  const handleBackToHolds = () => {
    navigate('/admin?tab=legal-holds');
  };

  const createHold = async () => {
    if (!formData.name || !formData.description || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    
    try {
      const response = await fetch('/api/legal-holds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Legal hold created successfully!');
        navigate('/admin?tab=legal-holds');
      } else {
        const error = await response.json();
        alert(`Failed to create legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating legal hold:', error);
      alert('Failed to create legal hold. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToHolds}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Legal Holds
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Create New Legal Hold</h1>
            <p className="text-slate-400">Set up document preservation requirements</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToHolds}>
            Cancel
          </Button>
          <Button onClick={createHold} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Legal Hold
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Creation Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hold Name *</Label>
                  <Input
                    id="name"
                    placeholder="Smith v. Corporation - Document Preservation"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Hold Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the legal hold..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Reason for placing the legal hold..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custodian_instructions">Custodian Instructions</Label>
                <Textarea
                  id="custodian_instructions"
                  placeholder="Instructions for custodians regarding this hold..."
                  value={formData.custodian_instructions}
                  onChange={(e) => setFormData({...formData, custodian_instructions: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_apply"
                  checked={formData.auto_apply_to_new_documents}
                  onChange={(e) => setFormData({...formData, auto_apply_to_new_documents: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="auto_apply">Auto-apply to new documents matching criteria</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  placeholder="contract, agreement, email, financial"
                  value={formData.search_criteria.keywords.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    search_criteria: {
                      ...formData.search_criteria,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range Start</Label>
                  <Input
                    type="date"
                    value={formData.search_criteria.date_range?.start || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      search_criteria: {
                        ...formData.search_criteria,
                        date_range: {
                          ...formData.search_criteria.date_range,
                          start: e.target.value
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Range End</Label>
                  <Input
                    type="date"
                    value={formData.search_criteria.date_range?.end || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      search_criteria: {
                        ...formData.search_criteria,
                        date_range: {
                          ...formData.search_criteria.date_range,
                          end: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Document Types (comma-separated)</Label>
                <Input
                  placeholder="pdf, docx, email, contract"
                  value={formData.search_criteria.document_types.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    search_criteria: {
                      ...formData.search_criteria,
                      document_types: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email_custodians"
                    checked={formData.notification_settings.email_custodians}
                    onChange={(e) => setFormData({
                      ...formData,
                      notification_settings: {
                        ...formData.notification_settings,
                        email_custodians: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="email_custodians">Email custodians</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email_legal_team"
                    checked={formData.notification_settings.email_legal_team}
                    onChange={(e) => setFormData({
                      ...formData,
                      notification_settings: {
                        ...formData.notification_settings,
                        email_legal_team: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="email_legal_team">Email legal team</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reminder Frequency</Label>
                    <Select 
                      value={formData.notification_settings.reminder_frequency || 'monthly'} 
                      onValueChange={(value) => setFormData({
                        ...formData,
                        notification_settings: {
                          ...formData.notification_settings,
                          reminder_frequency: value as any
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Escalation Days</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.notification_settings.escalation_days || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        notification_settings: {
                          ...formData.notification_settings,
                          escalation_days: parseInt(e.target.value) || undefined
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
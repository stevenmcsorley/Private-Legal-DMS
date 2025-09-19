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

interface CreateRetentionPolicyFormData {
  name: string;
  description: string;
  retention_period_years: number;
  action_on_expiry: 'delete' | 'archive' | 'review' | 'notify';
  auto_apply: boolean;
  legal_basis: string;
  business_justification: string;
  approval_required: boolean;
  notify_before_days: number;
  conditions: {
    document_types: string[];
    matter_types: string[];
    client_types: string[];
    minimum_age_days: number;
    maximum_age_days?: number;
  };
  metadata: {
    created_by_department: string;
    compliance_notes: string;
    review_frequency: 'annual' | 'biannual' | 'triennial';
    last_reviewed?: string;
  };
}

export const RetentionPolicyCreate: React.FC = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateRetentionPolicyFormData>({
    name: '',
    description: '',
    retention_period_years: 7,
    action_on_expiry: 'review',
    auto_apply: false,
    legal_basis: '',
    business_justification: '',
    approval_required: true,
    notify_before_days: 30,
    conditions: {
      document_types: [],
      matter_types: [],
      client_types: [],
      minimum_age_days: 0,
      maximum_age_days: undefined,
    },
    metadata: {
      created_by_department: '',
      compliance_notes: '',
      review_frequency: 'annual',
      last_reviewed: undefined,
    },
  });

  const handleBackToRetention = () => {
    navigate('/admin?tab=retention');
  };

  const createPolicy = async () => {
    if (!formData.name || !formData.description || !formData.legal_basis) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    
    try {
      const response = await fetch('/api/retention-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Retention policy created successfully!');
        navigate('/admin?tab=retention');
      } else {
        const error = await response.json();
        alert(`Failed to create retention policy: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating retention policy:', error);
      alert('Failed to create retention policy. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToRetention}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Retention Policies
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Create New Retention Policy</h1>
            <p className="text-slate-400">Define document retention rules and compliance requirements</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToRetention}>
            Cancel
          </Button>
          <Button onClick={createPolicy} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Policy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Creation Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="conditions">Conditions & Rules</TabsTrigger>
          <TabsTrigger value="compliance">Compliance & Metadata</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Policy Name *</Label>
                  <Input
                    id="name"
                    placeholder="General Document Retention Policy"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention_period">Retention Period (Years) *</Label>
                  <Input
                    id="retention_period"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.retention_period_years}
                    onChange={(e) => setFormData({...formData, retention_period_years: parseInt(e.target.value) || 7})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the retention policy..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action_on_expiry">Action on Expiry</Label>
                  <Select 
                    value={formData.action_on_expiry} 
                    onValueChange={(value) => setFormData({...formData, action_on_expiry: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review">Review Required</SelectItem>
                      <SelectItem value="archive">Auto Archive</SelectItem>
                      <SelectItem value="delete">Auto Delete</SelectItem>
                      <SelectItem value="notify">Notify Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notify_before_days">Notify Before (Days)</Label>
                  <Input
                    id="notify_before_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.notify_before_days}
                    onChange={(e) => setFormData({...formData, notify_before_days: parseInt(e.target.value) || 30})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_basis">Legal Basis *</Label>
                <Textarea
                  id="legal_basis"
                  placeholder="Legal requirements or regulations that mandate this retention policy..."
                  value={formData.legal_basis}
                  onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_justification">Business Justification</Label>
                <Textarea
                  id="business_justification"
                  placeholder="Business reasons for this retention policy..."
                  value={formData.business_justification}
                  onChange={(e) => setFormData({...formData, business_justification: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_apply"
                    checked={formData.auto_apply}
                    onChange={(e) => setFormData({...formData, auto_apply: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_apply">Auto-apply to matching documents</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="approval_required"
                    checked={formData.approval_required}
                    onChange={(e) => setFormData({...formData, approval_required: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="approval_required">Approval required for actions</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Document Types (comma-separated)</Label>
                <Input
                  placeholder="contract, agreement, email, financial"
                  value={formData.conditions.document_types.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      document_types: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Matter Types (comma-separated)</Label>
                <Input
                  placeholder="litigation, corporate, employment, real estate"
                  value={formData.conditions.matter_types.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      matter_types: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Client Types (comma-separated)</Label>
                <Input
                  placeholder="individual, corporation, government, non-profit"
                  value={formData.conditions.client_types.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      client_types: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Age (Days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.conditions.minimum_age_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      conditions: {
                        ...formData.conditions,
                        minimum_age_days: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maximum Age (Days, Optional)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.conditions.maximum_age_days || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      conditions: {
                        ...formData.conditions,
                        maximum_age_days: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="created_by_department">Created by Department</Label>
                <Input
                  id="created_by_department"
                  placeholder="Legal, Compliance, IT"
                  value={formData.metadata.created_by_department}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      created_by_department: e.target.value
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_frequency">Review Frequency</Label>
                <Select 
                  value={formData.metadata.review_frequency} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      review_frequency: value as any
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="biannual">Biannual</SelectItem>
                    <SelectItem value="triennial">Triennial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compliance_notes">Compliance Notes</Label>
                <Textarea
                  id="compliance_notes"
                  placeholder="Additional compliance requirements, exceptions, or special instructions..."
                  value={formData.metadata.compliance_notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      compliance_notes: e.target.value
                    }
                  })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
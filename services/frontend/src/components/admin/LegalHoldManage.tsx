import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Shield,
  Save,
  Ban,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface LegalHold {
  id: string;
  name: string;
  description: string;
  reason: string;
  type: 'litigation' | 'investigation' | 'audit' | 'regulatory' | 'other';
  status: 'active' | 'released' | 'expired';
  matter_id?: string;
  matter?: {
    id: string;
    title: string;
    matter_number: string;
    status: string;
  };
  firm_id: string;
  firm?: {
    id: string;
    name: string;
  };
  created_by: string;
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };
  released_by?: string;
  released_at?: string;
  release_reason?: string;
  expiry_date?: string;
  auto_apply_to_new_documents: boolean;
  custodian_instructions?: string;
  notification_settings?: {
    email_custodians?: boolean;
    email_legal_team?: boolean;
    reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
    escalation_days?: number;
  };
  search_criteria?: {
    keywords?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    document_types?: string[];
    custodians?: string[];
    matters?: string[];
  };
  documents_count: number;
  custodians_count: number;
  last_notification_sent?: string;
  created_at: string;
  updated_at: string;
}

interface UpdateHoldData {
  name: string;
  description: string;
  reason: string;
  type: 'litigation' | 'investigation' | 'audit' | 'regulatory' | 'other';
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

export const LegalHoldManage: React.FC = () => {
  const { holdId } = useParams<{ holdId: string }>();
  const navigate = useNavigate();
  
  const [hold, setHold] = useState<LegalHold | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReleaseSection, setShowReleaseSection] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');

  const [formData, setFormData] = useState<UpdateHoldData>({
    name: '',
    description: '',
    reason: '',
    type: 'litigation',
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

  useEffect(() => {
    if (holdId) {
      fetchHoldDetails();
    }
  }, [holdId]);

  const fetchHoldDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/legal-holds/${holdId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const holdData = await response.json();
        setHold(holdData);
        
        // Populate form data
        setFormData({
          name: holdData.name || '',
          description: holdData.description || '',
          reason: holdData.reason || '',
          type: holdData.type || 'litigation',
          expiry_date: holdData.expiry_date ? holdData.expiry_date.split('T')[0] : '',
          auto_apply_to_new_documents: holdData.auto_apply_to_new_documents ?? true,
          custodian_instructions: holdData.custodian_instructions || '',
          notification_settings: {
            email_custodians: holdData.notification_settings?.email_custodians ?? true,
            email_legal_team: holdData.notification_settings?.email_legal_team ?? true,
            reminder_frequency: holdData.notification_settings?.reminder_frequency || 'monthly',
            escalation_days: holdData.notification_settings?.escalation_days || 30,
          },
          search_criteria: {
            keywords: holdData.search_criteria?.keywords || [],
            date_range: holdData.search_criteria?.date_range || {},
            document_types: holdData.search_criteria?.document_types || [],
            custodians: holdData.search_criteria?.custodians || [],
            matters: holdData.search_criteria?.matters || [],
          },
        });
      }
    } catch (error) {
      console.error('Error fetching hold details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    navigate(`/admin/legal-holds/${holdId}`);
  };

  const handleBackToHolds = () => {
    navigate('/admin?tab=legal-holds');
  };

  const saveHold = async () => {
    if (!formData.name || !formData.description || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/legal-holds/${holdId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Legal hold updated successfully!');
        await fetchHoldDetails();
      } else {
        const error = await response.json();
        alert(`Failed to update legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating legal hold:', error);
      alert('Failed to update legal hold. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const releaseHold = async () => {
    if (!releaseReason) {
      alert('Please provide a reason for releasing the hold');
      return;
    }

    setReleasing(true);
    
    try {
      const response = await fetch(`/api/legal-holds/${holdId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: releaseReason }),
      });

      if (response.ok) {
        alert('Legal hold released successfully!');
        navigate('/admin?tab=legal-holds');
      } else {
        const error = await response.json();
        alert(`Failed to release legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error releasing legal hold:', error);
      alert('Failed to release legal hold. Please try again.');
    } finally {
      setReleasing(false);
    }
  };

  const deleteHold = async () => {
    if (!confirm('Are you sure you want to delete this legal hold? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    
    try {
      const response = await fetch(`/api/legal-holds/${holdId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Legal hold deleted successfully!');
        navigate('/admin?tab=legal-holds');
      } else {
        const error = await response.json();
        alert(`Failed to delete legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting legal hold:', error);
      alert('Failed to delete legal hold. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'released': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Shield className="h-3 w-3" />;
      case 'released': return <CheckCircle className="h-3 w-3" />;
      case 'expired': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading legal hold details...</p>
        </div>
      </div>
    );
  }

  if (!hold) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-100 mb-2">Legal hold not found</h3>
        <Button onClick={handleBackToHolds}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Legal Holds
        </Button>
      </div>
    );
  }

  if (hold.status !== 'active') {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-100 mb-2">Cannot manage inactive hold</h3>
        <p className="text-slate-400 mb-4">This legal hold is {hold.status} and cannot be modified.</p>
        <div className="space-x-2">
          <Button onClick={handleBackToDetails}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <Button variant="outline" onClick={handleBackToHolds}>
            Back to Legal Holds
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToDetails}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Manage Legal Hold</h1>
            <p className="text-slate-400">{hold.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(hold.status)} text-white border-none`}
          >
            <div className="flex items-center space-x-1">
              {getStatusIcon(hold.status)}
              <span className="capitalize">{hold.status}</span>
            </div>
          </Badge>
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hold Name *</Label>
                  <Input
                    id="name"
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button onClick={saveHold} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button onClick={saveHold} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button onClick={saveHold} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Release Hold Section */}
                <div className="border border-orange-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Ban className="h-5 w-5 text-orange-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-orange-400">Release Legal Hold</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Release this legal hold to remove preservation requirements from all {hold.documents_count} documents.
                      </p>
                      
                      {!showReleaseSection ? (
                        <Button
                          variant="outline"
                          className="mt-3 border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                          onClick={() => setShowReleaseSection(true)}
                        >
                          Release Hold
                        </Button>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="release_reason">Reason for Release *</Label>
                            <Textarea
                              id="release_reason"
                              placeholder="Provide a detailed reason for releasing this legal hold..."
                              value={releaseReason}
                              onChange={(e) => setReleaseReason(e.target.value)}
                              rows={3}
                              required
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowReleaseSection(false);
                                setReleaseReason('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={releaseHold}
                              disabled={releasing || !releaseReason}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              {releasing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Releasing...
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Confirm Release
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Hold Section */}
                <div className="border border-red-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-5 w-5 text-red-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-400">Delete Legal Hold</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Permanently delete this legal hold. This action cannot be undone and will remove all associated data.
                      </p>
                      <div className="bg-red-900/20 p-3 rounded-md mt-3">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-400">
                            Warning: This will affect {hold.documents_count} documents and {hold.custodians_count} custodians.
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-3 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={deleteHold}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Hold
                          </>
                        )}
                      </Button>
                    </div>
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
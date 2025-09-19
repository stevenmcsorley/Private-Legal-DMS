import React, { useState, useEffect } from 'react';
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
  Search,
} from 'lucide-react';

interface Matter {
  id: string;
  title: string;
  matter_number: string;
  client: {
    name: string;
  };
}

interface Firm {
  id: string;
  name: string;
  domain: string;
}

interface CreateShareFormData {
  matter_id: string;
  target_firm_id: string;
  role: 'viewer' | 'editor' | 'collaborator' | 'partner_lead';
  expires_at?: string;
  permissions: {
    can_view_documents: boolean;
    can_download_documents: boolean;
    can_upload_documents: boolean;
    can_edit_documents: boolean;
    can_view_matter_details: boolean;
    can_view_financial_data: boolean;
    can_invite_others: boolean;
  };
  restrictions: {
    ip_whitelist: string[];
    require_2fa: boolean;
    watermark_documents: boolean;
    disable_printing: boolean;
    disable_copying: boolean;
  };
  invitation_message?: string;
}

export const ShareCreate: React.FC = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [firmSearch, setFirmSearch] = useState('');
  const [loadingFirms, setLoadingFirms] = useState(false);

  const [formData, setFormData] = useState<CreateShareFormData>({
    matter_id: '',
    target_firm_id: '',
    role: 'viewer',
    expires_at: '',
    permissions: {
      can_view_documents: true,
      can_download_documents: false,
      can_upload_documents: false,
      can_edit_documents: false,
      can_view_matter_details: true,
      can_view_financial_data: false,
      can_invite_others: false,
    },
    restrictions: {
      ip_whitelist: [],
      require_2fa: false,
      watermark_documents: true,
      disable_printing: true,
      disable_copying: true,
    },
    invitation_message: '',
  });

  useEffect(() => {
    fetchMatters();
  }, []);

  useEffect(() => {
    if (firmSearch.length >= 2) {
      searchFirms();
    } else {
      setFirms([]);
    }
  }, [firmSearch]);

  const fetchMatters = async () => {
    try {
      const response = await fetch('/api/matters?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMatters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
    }
  };

  const searchFirms = async () => {
    if (!firmSearch) return;
    
    setLoadingFirms(true);
    try {
      const response = await fetch(`/api/shares/firms/search?q=${encodeURIComponent(firmSearch)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFirms(data || []);
      }
    } catch (error) {
      console.error('Error searching firms:', error);
    } finally {
      setLoadingFirms(false);
    }
  };

  const handleBackToShares = () => {
    navigate('/admin?tab=shares');
  };

  const createShare = async () => {
    if (!formData.matter_id || !formData.target_firm_id || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Share created successfully!');
        navigate('/admin?tab=shares');
      } else {
        const error = await response.json();
        alert(`Failed to create share: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating share:', error);
      alert('Failed to create share. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const updatePermissionsForRole = (role: string) => {
    let permissions = { ...formData.permissions };
    
    switch (role) {
      case 'viewer':
        permissions = {
          can_view_documents: true,
          can_download_documents: false,
          can_upload_documents: false,
          can_edit_documents: false,
          can_view_matter_details: true,
          can_view_financial_data: false,
          can_invite_others: false,
        };
        break;
      case 'editor':
        permissions = {
          can_view_documents: true,
          can_download_documents: true,
          can_upload_documents: true,
          can_edit_documents: false,
          can_view_matter_details: true,
          can_view_financial_data: false,
          can_invite_others: false,
        };
        break;
      case 'collaborator':
        permissions = {
          can_view_documents: true,
          can_download_documents: true,
          can_upload_documents: true,
          can_edit_documents: true,
          can_view_matter_details: true,
          can_view_financial_data: false,
          can_invite_others: false,
        };
        break;
      case 'partner_lead':
        permissions = {
          can_view_documents: true,
          can_download_documents: true,
          can_upload_documents: true,
          can_edit_documents: true,
          can_view_matter_details: true,
          can_view_financial_data: true,
          can_invite_others: true,
        };
        break;
    }
    
    setFormData({ ...formData, role: role as any, permissions });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToShares}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shares
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Create New Share</h1>
            <p className="text-slate-400">Share a matter with another firm</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToShares}>
            Cancel
          </Button>
          <Button onClick={createShare} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Share
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Creation Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="security">Security & Restrictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matter">Matter to Share *</Label>
                <Select 
                  value={formData.matter_id} 
                  onValueChange={(value) => setFormData({...formData, matter_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a matter to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {matters.map((matter) => (
                      <SelectItem key={matter.id} value={matter.id}>
                        {matter.title} ({matter.matter_number}) - {matter.client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firm_search">Search Target Firm *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="firm_search"
                    placeholder="Search by firm name..."
                    value={firmSearch}
                    onChange={(e) => setFirmSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {loadingFirms && (
                  <p className="text-sm text-slate-400">Searching firms...</p>
                )}
                {firms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Firm:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {firms.map((firm) => (
                        <div
                          key={firm.id}
                          className={`p-2 rounded cursor-pointer border ${
                            formData.target_firm_id === firm.id 
                              ? 'border-blue-500 bg-blue-900/20' 
                              : 'border-slate-600 hover:bg-slate-800'
                          }`}
                          onClick={() => setFormData({...formData, target_firm_id: firm.id})}
                        >
                          <p className="font-medium text-slate-100">{firm.name}</p>
                          <p className="text-sm text-slate-400">{firm.domain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Share Role *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={updatePermissionsForRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                    <SelectItem value="editor">Editor - Can upload documents</SelectItem>
                    <SelectItem value="collaborator">Collaborator - Can edit documents</SelectItem>
                    <SelectItem value="partner_lead">Partner Lead - Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation_message">Invitation Message (Optional)</Label>
                <Textarea
                  id="invitation_message"
                  placeholder="Add a personal message to the invitation..."
                  value={formData.invitation_message}
                  onChange={(e) => setFormData({...formData, invitation_message: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-100">Document Permissions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_view_documents"
                      checked={formData.permissions.can_view_documents}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_view_documents: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_view_documents">View documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_download_documents"
                      checked={formData.permissions.can_download_documents}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_download_documents: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_download_documents">Download documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_upload_documents"
                      checked={formData.permissions.can_upload_documents}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_upload_documents: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_upload_documents">Upload documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_edit_documents"
                      checked={formData.permissions.can_edit_documents}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_edit_documents: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_edit_documents">Edit documents</Label>
                  </div>
                </div>

                <h3 className="font-medium text-slate-100 mt-6">Matter Permissions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_view_matter_details"
                      checked={formData.permissions.can_view_matter_details}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_view_matter_details: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_view_matter_details">View matter details</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_view_financial_data"
                      checked={formData.permissions.can_view_financial_data}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_view_financial_data: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_view_financial_data">View financial data</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_invite_others"
                      checked={formData.permissions.can_invite_others}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, can_invite_others: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="can_invite_others">Invite other users</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-100">Security Restrictions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_2fa"
                      checked={formData.restrictions.require_2fa}
                      onChange={(e) => setFormData({
                        ...formData,
                        restrictions: { ...formData.restrictions, require_2fa: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="require_2fa">Require two-factor authentication</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="watermark_documents"
                      checked={formData.restrictions.watermark_documents}
                      onChange={(e) => setFormData({
                        ...formData,
                        restrictions: { ...formData.restrictions, watermark_documents: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="watermark_documents">Watermark documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="disable_printing"
                      checked={formData.restrictions.disable_printing}
                      onChange={(e) => setFormData({
                        ...formData,
                        restrictions: { ...formData.restrictions, disable_printing: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="disable_printing">Disable printing</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="disable_copying"
                      checked={formData.restrictions.disable_copying}
                      onChange={(e) => setFormData({
                        ...formData,
                        restrictions: { ...formData.restrictions, disable_copying: e.target.checked }
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="disable_copying">Disable copying</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>IP Whitelist (comma-separated)</Label>
                  <Input
                    placeholder="192.168.1.1, 10.0.0.0/24"
                    value={formData.restrictions.ip_whitelist.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      restrictions: {
                        ...formData.restrictions,
                        ip_whitelist: e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip)
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
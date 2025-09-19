import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle,
  Shield,
  Building,
  Users,
  Settings,
  Lock,
  Eye
} from 'lucide-react';

interface ShareManageData {
  id: string;
  matter: {
    id: string;
    title: string;
    matter_number: string;
    client: { name: string };
  };
  shared_with_firm_name: string;
  shared_by: { display_name: string };
  role: string;
  status: string;
  expires_at?: string;
  created_at: string;
  permissions: {
    can_view: boolean;
    can_download: boolean;
    can_comment: boolean;
    can_share_documents: boolean;
    can_invite_others: boolean;
  };
  restrictions: {
    ip_restrictions: string[];
    download_limit?: number;
    watermark_required: boolean;
    audit_all_access: boolean;
  };
  invitation_message?: string;
}

export const ShareManage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [share, setShare] = useState<ShareManageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    role: '',
    expires_at: '',
    permissions: {
      can_view: true,
      can_download: true,
      can_comment: false,
      can_share_documents: false,
      can_invite_others: false,
    },
    restrictions: {
      ip_restrictions: [] as string[],
      download_limit: undefined as number | undefined,
      watermark_required: false,
      audit_all_access: true,
    },
    invitation_message: '',
  });

  useEffect(() => {
    fetchShareDetails();
  }, [shareId]);

  const fetchShareDetails = async () => {
    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setShare(data);
        setFormData({
          role: data.role,
          expires_at: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : '',
          permissions: { ...data.permissions },
          restrictions: { ...data.restrictions },
          invitation_message: data.invitation_message || '',
        });
      } else {
        setError('Failed to load share details');
      }
    } catch (error) {
      console.error('Error fetching share details:', error);
      setError('Failed to load share details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update share permissions
      const permissionsResponse = await fetch(`/api/shares/${shareId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          permissions: formData.permissions,
          restrictions: formData.restrictions,
          role: formData.role,
          expires_at: formData.expires_at || null,
        }),
      });

      if (permissionsResponse.ok) {
        setSuccessMessage('Share updated successfully!');
        setTimeout(() => {
          navigate('/admin?tab=shares');
        }, 2000);
      } else {
        setError('Failed to update share');
      }
    } catch (error) {
      console.error('Error updating share:', error);
      setError('Failed to update share');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!confirm('Are you sure you want to revoke this share? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/shares/${shareId}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccessMessage('Share revoked successfully!');
        setTimeout(() => {
          navigate('/admin?tab=shares');
        }, 2000);
      } else {
        setError('Failed to revoke share');
      }
    } catch (error) {
      console.error('Error revoking share:', error);
      setError('Failed to revoke share');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading share details...</p>
        </div>
      </div>
    );
  }

  if (error && !share) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Error Loading Share</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <Button 
          onClick={() => navigate('/admin?tab=shares')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shares
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin?tab=shares')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shares
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Share</h1>
            <p className="text-slate-400">Edit permissions and settings for this cross-firm share</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => navigate(`/admin/shares/${shareId}`)}
            variant="secondary"
            className="bg-slate-600 hover:bg-slate-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            onClick={handleRevokeShare}
            variant="destructive"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            Revoke Share
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-600 text-white p-4 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {share && (
        <>
          {/* Share Info */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Share Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Matter</Label>
                  <p className="text-white font-medium">{share.matter.title}</p>
                  <p className="text-slate-400 text-sm">{share.matter.matter_number}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Shared With</Label>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="text-white">{share.shared_with_firm_name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Shared By</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="text-white">{share.shared_by.display_name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Expiration */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Role and Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role" className="text-slate-300">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                      <SelectItem value="partner_lead">Partner Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expires_at" className="text-slate-300">Expiration Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Can View Documents</Label>
                      <p className="text-slate-400 text-sm">Allow viewing shared documents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_view}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          permissions: { ...formData.permissions, can_view: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Can Download Documents</Label>
                      <p className="text-slate-400 text-sm">Allow downloading shared documents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_download}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          permissions: { ...formData.permissions, can_download: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Can Comment</Label>
                      <p className="text-slate-400 text-sm">Allow adding comments to documents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_comment}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          permissions: { ...formData.permissions, can_comment: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Can Share Documents</Label>
                      <p className="text-slate-400 text-sm">Allow sharing documents with others</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_share_documents}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          permissions: { ...formData.permissions, can_share_documents: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Can Invite Others</Label>
                      <p className="text-slate-400 text-sm">Allow inviting additional users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_invite_others}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          permissions: { ...formData.permissions, can_invite_others: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Restrictions */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Watermark Required</Label>
                      <p className="text-slate-400 text-sm">Apply watermarks to viewed/downloaded documents</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.restrictions.watermark_required}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          restrictions: { ...formData.restrictions, watermark_required: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Audit All Access</Label>
                      <p className="text-slate-400 text-sm">Log all document access and downloads</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.restrictions.audit_all_access}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          restrictions: { ...formData.restrictions, audit_all_access: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="download_limit" className="text-slate-300">Download Limit (Optional)</Label>
                    <Input
                      id="download_limit"
                      type="number"
                      min="0"
                      value={formData.restrictions.download_limit || ''}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          restrictions: { 
                            ...formData.restrictions, 
                            download_limit: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })
                      }
                      placeholder="Unlimited"
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                    <p className="text-slate-400 text-sm mt-1">Maximum number of downloads allowed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin?tab=shares')}
              className="bg-slate-600 hover:bg-slate-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </>
      )}
    </div>
  );
};
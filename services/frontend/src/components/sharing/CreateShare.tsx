import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  ArrowLeft,
  Building,
  FileText,
  User,
  Calendar,
  Search,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Users,
  Eye,
  Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Matter {
  id: string;
  title: string;
  matter_number?: string;
  status: string;
  client?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface Firm {
  id: string;
  name: string;
  domain?: string;
  city?: string;
  state?: string;
}

interface CreateShareFormData {
  matter_id: string;
  target_firm_id: string;
  role: 'viewer' | 'editor' | 'collaborator' | 'partner_lead';
  expires_at?: string;
  invitation_message?: string;
  watermark_documents: boolean;
}

const ROLE_OPTIONS = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view documents and matter information',
    icon: Eye,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'editor',
    label: 'Editor', 
    description: 'Can view and edit documents',
    icon: Edit,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    value: 'collaborator',
    label: 'Collaborator',
    description: 'Can view, edit, and add documents',
    icon: Users,
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'partner_lead',
    label: 'Partner Lead',
    description: 'Full access with management permissions',
    icon: Shield,
    color: 'bg-orange-100 text-orange-800'
  }
];

export const CreateShare = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [matters, setMatters] = useState<Matter[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(false);
  const [firmSearchTerm, setFirmSearchTerm] = useState('');
  const [matterSearchTerm, setMatterSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<CreateShareFormData>({
    matter_id: '',
    target_firm_id: '',
    role: 'viewer',
    watermark_documents: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMatters();
  }, [matterSearchTerm]);

  useEffect(() => {
    if (firmSearchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchFirms(firmSearchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setFirms([]);
    }
  }, [firmSearchTerm]);

  const fetchMatters = async () => {
    try {
      const searchParams = new URLSearchParams({
        limit: '50',
        ...(matterSearchTerm && { search: matterSearchTerm }),
      });
      
      const response = await fetch(`/api/matters?${searchParams}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatters(data.matters || []);
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load matters. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const searchFirms = async (query: string) => {
    try {
      const response = await fetch(`/api/shares/firms/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setFirms(data);
      }
    } catch (error) {
      console.error('Error searching firms:', error);
      toast({
        title: 'Error',
        description: 'Failed to search firms. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.matter_id) {
      newErrors.matter_id = 'Please select a matter to share';
    }

    if (!formData.target_firm_id) {
      newErrors.target_firm_id = 'Please select a firm to share with';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (formData.expires_at) {
      const expiryDate = new Date(formData.expires_at);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expires_at = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          matter_id: formData.matter_id,
          target_firm_id: formData.target_firm_id,
          role: formData.role,
          expires_at: formData.expires_at || undefined,
          invitation_message: formData.invitation_message || undefined,
          permissions: {
            watermark_documents: formData.watermark_documents,
          }
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Share created successfully!',
        });
        navigate('/sharing');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create share');
      }
    } catch (error) {
      console.error('Error creating share:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create share. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMatter = matters.find(m => m.id === formData.matter_id);
  const selectedFirm = firms.find(f => f.id === formData.target_firm_id);
  const selectedRoleConfig = ROLE_OPTIONS.find(r => r.value === formData.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/sharing')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shares
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Share2 className="h-6 w-6 mr-3 text-orange-500" />
              Create New Share
            </h1>
            <p className="text-slate-400">Share a matter with another law firm</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matter Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Select Matter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="matter-search" className="text-slate-300">Search Matters</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="matter-search"
                    placeholder="Search by matter title or number..."
                    value={matterSearchTerm}
                    onChange={(e) => setMatterSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {matters.map((matter) => (
                  <div
                    key={matter.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.matter_id === matter.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                    onClick={() => setFormData({ ...formData, matter_id: matter.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{matter.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                          {matter.matter_number && (
                            <span>#{matter.matter_number}</span>
                          )}
                          {matter.client && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {matter.client.name}
                            </span>
                          )}
                          <Badge variant="outline">{matter.status}</Badge>
                        </div>
                      </div>
                      {formData.matter_id === matter.id && (
                        <Check className="h-5 w-5 text-orange-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))}

                {matters.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                    <p>No matters found</p>
                    {matterSearchTerm && (
                      <p className="text-sm">Try a different search term</p>
                    )}
                  </div>
                )}
              </div>

              {errors.matter_id && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.matter_id}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Firm Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Building className="h-5 w-5 mr-2 text-orange-500" />
                Select Firm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firm-search" className="text-slate-300">Search Firms</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="firm-search"
                    placeholder="Search by firm name..."
                    value={firmSearchTerm}
                    onChange={(e) => setFirmSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {firms.map((firm) => (
                  <div
                    key={firm.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.target_firm_id === firm.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                    onClick={() => setFormData({ ...formData, target_firm_id: firm.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{firm.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                          {firm.city && firm.state && (
                            <span>{firm.city}, {firm.state}</span>
                          )}
                          {firm.domain && (
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {firm.domain}
                            </span>
                          )}
                        </div>
                      </div>
                      {formData.target_firm_id === firm.id && (
                        <Check className="h-5 w-5 text-orange-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))}

                {firmSearchTerm && firms.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Building className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                    <p>No firms found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}

                {!firmSearchTerm && (
                  <div className="text-center py-8 text-slate-400">
                    <Search className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                    <p>Start typing to search for firms</p>
                  </div>
                )}
              </div>

              {errors.target_firm_id && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.target_firm_id}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Share Configuration */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Share Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-slate-300">Access Role</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        formData.role === role.value
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                      onClick={() => setFormData({ ...formData, role: role.value as any })}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5 text-slate-400" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-white">{role.label}</h4>
                            {formData.role === role.value && (
                              <Check className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expires-at" className="text-slate-300">
                Expiry Date (Optional)
                <span className="text-slate-500 text-sm ml-1">- Leave blank for no expiry</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={formData.expires_at || ''}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              {errors.expires_at && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.expires_at}
                </p>
              )}
            </div>

            {/* Invitation Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">Invitation Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation..."
                value={formData.invitation_message || ''}
                onChange={(e) => setFormData({ ...formData, invitation_message: e.target.value })}
                rows={3}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Watermark Option */}
            <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg">
              <input
                type="checkbox"
                id="watermark"
                checked={formData.watermark_documents}
                onChange={(e) => setFormData({ ...formData, watermark_documents: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <Label htmlFor="watermark" className="font-medium text-white">
                  Apply watermarks to shared documents
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Documents will be watermarked with sharing information for security
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {(selectedMatter || selectedFirm || selectedRoleConfig) && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Share Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedMatter && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-300">Matter:</span>
                    <span className="text-white">{selectedMatter.title}</span>
                    {selectedMatter.client && (
                      <span className="text-slate-400">({selectedMatter.client.name})</span>
                    )}
                  </div>
                )}

                {selectedFirm && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-300">Sharing with:</span>
                    <span className="text-white">{selectedFirm.name}</span>
                  </div>
                )}

                {selectedRoleConfig && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-300">Role:</span>
                    <Badge className={selectedRoleConfig.color}>
                      {selectedRoleConfig.label}
                    </Badge>
                  </div>
                )}

                {formData.expires_at && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-300">Expires:</span>
                    <span className="text-white">{new Date(formData.expires_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sharing')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Create Share
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
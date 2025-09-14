import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  client_type: string;
  status: string;
  notes: string;
  tax_id: string;
  billing_address: string;
  preferred_communication: string;
}

interface Client {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: any;
  metadata?: {
    contact_person?: string;
    client_type?: string;
    status?: string;
    notes?: string;
    tax_id?: string;
    billing_address?: string;
    preferred_communication?: string;
  };
  external_ref?: string;
  created_at: string;
  updated_at: string;
  firm_id: string;
}

export const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    client_type: '',
    status: 'active',
    notes: '',
    tax_id: '',
    billing_address: '',
    preferred_communication: 'email',
  });

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/clients/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setClient(data);
        
        // Transform backend data to form data
        setFormData({
          name: data.name || '',
          email: data.contact_email || '',
          phone: data.contact_phone || '',
          address: typeof data.address === 'string' ? data.address : (data.address?.street || ''),
          contact_person: data.metadata?.contact_person || '',
          client_type: data.metadata?.client_type || 'individual',
          status: data.metadata?.status || 'active',
          notes: data.metadata?.notes || '',
          tax_id: data.metadata?.tax_id || '',
          billing_address: data.metadata?.billing_address || '',
          preferred_communication: data.metadata?.preferred_communication || 'email',
        });
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform frontend form data to backend API format
      const apiData = {
        name: formData.name,
        contact_email: formData.email || undefined,
        contact_phone: formData.phone || undefined,
        address: formData.address ? {
          street: formData.address,
        } : undefined,
        metadata: {
          contact_person: formData.contact_person,
          client_type: formData.client_type,
          status: formData.status,
          notes: formData.notes,
          tax_id: formData.tax_id,
          billing_address: formData.billing_address,
          preferred_communication: formData.preferred_communication,
        }
      };

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const client = await response.json();
        navigate(`/clients/${client.id}`);
      } else {
        const error = await response.json();
        console.error('Error updating client:', error);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Client not found</h2>
        <p className="text-gray-600 mt-2">The client you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/clients/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-gray-600">Update client information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Enter primary contact person"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_type">Client Type</Label>
                <Select
                  value={formData.client_type}
                  onValueChange={(value) => handleInputChange('client_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address & Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Address & Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter physical address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => handleInputChange('billing_address', e.target.value)}
                  placeholder="Enter billing address (if different from physical)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID / EIN</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  placeholder="Enter tax ID or EIN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_communication">Preferred Communication</Label>
                <Select
                  value={formData.preferred_communication}
                  onValueChange={(value) => handleInputChange('preferred_communication', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred communication" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Client Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the client"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link to={`/clients/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Client
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
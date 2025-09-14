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

interface Client {
  id: string;
  name: string;
  contact_email?: string;
}

interface MatterFormData {
  title: string;
  description: string;
  client_id: string;
  status: string;
  security_class: number;
}

export const EditMatter = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMatter, setLoadingMatter] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<MatterFormData>({
    title: '',
    description: '',
    client_id: '',
    status: 'active',
    security_class: 1,
  });

  useEffect(() => {
    if (id) {
      fetchMatter();
      fetchClients();
    }
  }, [id]);

  const fetchMatter = async () => {
    try {
      const response = await fetch(`/api/matters/${id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const matter = await response.json();
        setFormData({
          title: matter.title || '',
          description: matter.description || '',
          client_id: matter.client_id || '',
          status: matter.status || 'active',
          security_class: matter.security_class || 1,
        });
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
    } finally {
      setLoadingMatter(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data) ? data : data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const handleInputChange = (field: keyof MatterFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate(`/matters/${id}`);
      } else {
        const error = await response.json();
        console.error('Error updating matter:', error);
      }
    } catch (error) {
      console.error('Error updating matter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMatter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading matter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/matters/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matter
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Matter</h1>
          <p className="text-gray-600">Update matter information</p>
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
                <Label htmlFor="title">Matter Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter matter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter matter description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleInputChange('client_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(clients) && clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.contact_email ? `(${client.contact_email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_class">Security Level *</Label>
                <Select
                  value={formData.security_class.toString()}
                  onValueChange={(value) => handleInputChange('security_class', parseInt(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Public</SelectItem>
                    <SelectItem value="2">Level 2 - Internal</SelectItem>
                    <SelectItem value="3">Level 3 - Confidential</SelectItem>
                    <SelectItem value="4">Level 4 - Restricted</SelectItem>
                    <SelectItem value="5">Level 5 - Top Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Matter Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Matter Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link to={`/matters/${id}`}>Cancel</Link>
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
                Update Matter
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
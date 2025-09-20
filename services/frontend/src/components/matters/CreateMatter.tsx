import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const CreateMatter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<MatterFormData>({
    title: '',
    description: '',
    client_id: '',
    status: 'active',
    security_class: 1,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Clients API response:', data);
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
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const matter = await response.json();
        navigate(`/matters/${matter.id}`);
      } else {
        const error = await response.json();
        console.error('Error creating matter:', error);
      }
    } catch (error) {
      console.error('Error creating matter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/matters">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matters
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Matter</h1>
          <p className="text-gray-600">Add a new legal matter to the system</p>
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
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleInputChange('client_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-slate-300 text-xs">
                          ?
                        </div>
                        <div>
                          <div className="font-medium">No Client</div>
                          <div className="text-sm text-slate-400">Assign client later</div>
                        </div>
                      </div>
                    </SelectItem>
                    {Array.isArray(clients) && clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.contact_email ? `(${client.contact_email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Client assignment is optional. You can create matters and assign clients later.
                </p>
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
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>



            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/matters">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Matter
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

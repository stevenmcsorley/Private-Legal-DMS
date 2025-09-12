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
  email: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface MatterFormData {
  title: string;
  description: string;
  client_id: string;
  matter_type: string;
  status: string;
  priority: string;
  assigned_lawyer_id: string;
  retention_years: number;
}

export const CreateMatter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [formData, setFormData] = useState<MatterFormData>({
    title: '',
    description: '',
    client_id: '',
    matter_type: '',
    status: 'active',
    priority: 'medium',
    assigned_lawyer_id: '',
    retention_years: 7,
  });

  useEffect(() => {
    fetchClients();
    fetchLawyers();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchLawyers = async () => {
    try {
      const response = await fetch('/api/admin/users?roles=legal_professional,legal_manager,firm_admin', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLawyers(data);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Matter</h1>
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
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matter_type">Matter Type *</Label>
                <Select
                  value={formData.matter_type}
                  onValueChange={(value) => handleInputChange('matter_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="litigation">Litigation</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="immigration">Immigration</SelectItem>
                    <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="tax">Tax</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_lawyer">Assigned Lawyer</Label>
                <Select
                  value={formData.assigned_lawyer_id}
                  onValueChange={(value) => handleInputChange('assigned_lawyer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lawyer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {lawyers.map((lawyer) => (
                      <SelectItem key={lawyer.id} value={lawyer.id}>
                        {lawyer.display_name} ({lawyer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention_years">Retention Period (Years)</Label>
                <Input
                  id="retention_years"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.retention_years}
                  onChange={(e) => handleInputChange('retention_years', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">
                  Number of years to retain documents after matter closure
                </p>
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
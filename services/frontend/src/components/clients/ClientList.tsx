import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter,
  Building,
  User,
  FileText,
  Mail,
  Phone,
  Clock,
  Archive
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  client_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  matter_count: number;
  document_count: number;
  last_activity?: string;
  firm_id: string;
}

export const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact_person && client.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage client relationships and information</p>
        </div>
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="former">Former</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="non_profit">Non-Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-gray-600">
        <Filter className="h-4 w-4 mr-2" />
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    <Link 
                      to={`/clients/${client.id}`}
                      className="hover:text-blue-600 transition-colors flex items-center"
                    >
                      <Building className="h-5 w-5 mr-2 flex-shrink-0" />
                      {client.name}
                    </Link>
                  </CardTitle>
                  {client.contact_person && (
                    <p className="text-sm text-gray-600 mt-1">
                      Contact: {client.contact_person}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">
                  Active
                </Badge>
                <Badge variant="secondary">
                  Client
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <Archive className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-lg font-semibold text-gray-900">
                        {client.matter_count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Matters</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-lg font-semibold text-gray-900">
                        {client.document_count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Documents</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      Created {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {client.last_activity && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>
                        Active {new Date(client.last_activity).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first client.'}
            </p>
            <Button asChild>
              <Link to="/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

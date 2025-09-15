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
      (client.contact_email && client.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.metadata?.contact_person && client.metadata.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || client.metadata?.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.metadata?.client_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-slate-400">Manage client relationships and information</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
          <Link to="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
      <div className="flex items-center text-sm text-slate-300">
        <Filter className="h-4 w-4 mr-2 text-orange-400" />
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    <Link 
                      to={`/clients/${client.id}`}
                      className="text-white hover:text-orange-400 transition-colors flex items-center"
                    >
                      <Building className="h-5 w-5 mr-2 flex-shrink-0 text-orange-400" />
                      {client.name}
                    </Link>
                  </CardTitle>
                  {client.metadata?.contact_person && (
                    <p className="text-sm text-slate-400 mt-1">
                      Contact: {client.metadata.contact_person}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-green-600 text-white border-green-500 px-3 py-1 rounded-full">
                  ACTIVE
                </Badge>
                <Badge variant="outline" className="border-slate-500 text-slate-300">
                  Client
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {client.contact_email && (
                  <div className="flex items-center text-sm text-slate-300">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-orange-400" />
                    <span className="truncate">{client.contact_email}</span>
                  </div>
                )}
                
                {client.contact_phone && (
                  <div className="flex items-center text-sm text-slate-300">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-orange-400" />
                    <span>{client.contact_phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start text-sm text-slate-300">
                    <Building className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-orange-400" />
                    <span className="line-clamp-2">{typeof client.address === 'string' ? client.address : client.address.street}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <Archive className="h-4 w-4 text-orange-400 mr-1" />
                      <span className="text-lg font-semibold text-white">
                        {client.matter_count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Matters</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 text-orange-400 mr-1" />
                      <span className="text-lg font-semibold text-white">
                        {client.document_count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Documents</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-slate-500" />
                    <span>
                      Created {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {client.last_activity && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-slate-500" />
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
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first client.'}
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
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

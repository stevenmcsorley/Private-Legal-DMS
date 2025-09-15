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
  FileText,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Matter {
  id: string;
  firm_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  security_class: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    contact_email?: string;
  };
  created_by_user?: {
    id: string;
    display_name: string;
    email?: string;
  };
  documents?: any[];
}

export const MatterList = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchMatters();
  }, []);

  const fetchMatters = async () => {
    try {
      const response = await fetch('/api/matters', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMatters(data.matters || []);
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatters = matters.filter((matter) => {
    const matchesSearch = 
      matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (matter.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      matter.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || matter.status === statusFilter;
    const matchesType = typeFilter === 'all'; // No matter_type in current API
    const matchesPriority = priorityFilter === 'all'; // No priority in current API

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white border-green-500';
      case 'closed': return 'bg-slate-600 text-white border-slate-500';
      case 'on_hold': return 'bg-yellow-600 text-white border-yellow-500';
      case 'cancelled': return 'bg-red-600 text-white border-red-500';
      default: return 'bg-slate-600 text-white border-slate-500';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading matters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Matters</h1>
          <p className="text-slate-400">Manage legal matters and cases</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
          <Link to="/matters/new">
            <Plus className="h-4 w-4 mr-2" />
            New Matter
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search matters..."
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
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="litigation">Litigation</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="immigration">Immigration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-slate-300">
        <Filter className="h-4 w-4 mr-2 text-orange-400" />
        Showing {filteredMatters.length} of {matters.length} matters
      </div>

      {/* Matters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatters.map((matter) => (
          <Card key={matter.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    <Link 
                      to={`/matters/${matter.id}`}
                      className="text-white hover:text-orange-400 transition-colors"
                    >
                      {matter.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-slate-400 font-mono">
                    {matter.id.slice(0, 8)}...
                  </p>
                </div>
                {matter.security_class > 2 && (
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 ml-2" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={`${getStatusColor(matter.status)} px-3 py-1 rounded-full`}>
                  {matter.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-slate-500 text-slate-300">
                  Security Level {matter.security_class}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {matter.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {matter.description}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-slate-300">
                  <User className="h-4 w-4 mr-2 text-orange-400" />
                  <span className="truncate">{matter.client?.name || 'Unknown Client'}</span>
                </div>
                
                {matter.created_by_user && (
                  <div className="flex items-center text-sm text-slate-300">
                    <User className="h-4 w-4 mr-2 text-orange-400" />
                    <span className="truncate">
                      Created by: {matter.created_by_user.display_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-slate-500" />
                    <span>Documents</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-slate-500" />
                    <span>{new Date(matter.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatters.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No matters found</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first matter.'}
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
              <Link to="/matters/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Matter
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

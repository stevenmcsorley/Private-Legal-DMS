import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Building,
  AlertTriangle,
  User,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  contact_email?: string;
  type: string;
  status: string;
}

interface Matter {
  id: string;
  title: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
  };
}

export const MatterChangeClient: React.FC = () => {
  const { id: matterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    if (matterId) {
      fetchMatter();
      fetchClients();
    }
  }, [matterId]);

  const fetchMatter = async () => {
    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatter(data);
        setSelectedClientId(data.client_id || '');
      } else {
        setError('Failed to fetch matter details');
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
      setError('Failed to fetch matter details');
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        setError('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMatter = () => {
    navigate(`/matters/${matterId}?tab=overview`);
  };

  const updateClient = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          client_id: selectedClientId || null,
        }),
      });

      if (response.ok) {
        alert('Client assignment updated successfully!');
        navigate(`/matters/${matterId}?tab=overview`);
      } else {
        const error = await response.json();
        alert(`Failed to update client: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedClient = clients.find(client => client.id === selectedClientId);
  const currentClient = matter?.client;
  const hasChanges = selectedClientId !== (matter?.client_id || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToMatter}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matter
          </Button>
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Error Loading Matter</h3>
            <p className="text-slate-400">{error || 'Matter not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToMatter}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matter
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Change Client</h1>
            <p className="text-slate-400">Update client assignment for: {matter.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToMatter}>
            Cancel
          </Button>
          <Button onClick={updateClient} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      </div>

      {/* Current Client Info */}
      {currentClient && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Current Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                {currentClient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-100">{currentClient.name}</h3>
                <p className="text-sm text-slate-400">ID: {currentClient.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentClient && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-amber-200 font-medium">No Client Assigned</p>
                <p className="text-amber-300/80 text-sm">This matter currently has no client assigned.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Client Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Building className="h-5 w-5 mr-2 text-orange-500" />
            Select New Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-slate-300">Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select a client (leave empty for no client)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="" className="text-slate-300 hover:bg-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-slate-300 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">No Client</div>
                      <div className="text-sm text-slate-500">Work on matter without assigned client</div>
                    </div>
                  </div>
                </SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-slate-100 hover:bg-slate-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-slate-400">{client.contact_email || client.type}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              You can work on matters without a client assigned. Assign a client when ready.
            </p>
          </div>

          {/* Selected Client Preview */}
          {selectedClient && (
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-6">
                <h4 className="text-slate-100 font-medium mb-4">New Client Assignment</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-100 font-medium">{selectedClient.name}</p>
                    <p className="text-sm text-slate-400">
                      {selectedClient.contact_email || `${selectedClient.type} • ${selectedClient.status}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedClientId === '' && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-amber-200 font-medium">No Client Mode</p>
                    <p className="text-amber-300/80 text-sm">
                      The matter will have no assigned client. Team members can work on it without client constraints.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="pt-6">
                <h4 className="text-blue-200 font-medium mb-2">Pending Changes</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-300/80">From:</span>
                    <span className="text-blue-100">{currentClient?.name || 'No Client'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300/80">To:</span>
                    <span className="text-blue-100">{selectedClient?.name || 'No Client'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
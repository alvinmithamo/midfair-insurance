import { useState, useEffect } from "react";  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";  
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";  
import { Badge } from "@/components/ui/badge";  
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";  
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";  
import { Label } from "@/components/ui/label";  
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  
import { Textarea } from "@/components/ui/textarea";  
import { Plus, Search, Filter, Users, Phone, Mail, MapPin, Calendar, Car, FileText, MoreHorizontal, Edit, Trash2 } from "lucide-react";  
import { supabase } from "@/integrations/supabase/client";  
import { useToast } from "@/hooks/use-toast";  
import { format, parseISO } from "date-fns";  
  
interface Client {  
  id: string;  
  first_name: string;  
  last_name: string;  
  email: string | null;  
  phone: string;  
  id_number: string | null;  
  address: string | null;  
  city: string | null;  
  postal_code: string | null;  
  date_of_birth: string | null;  
  gender: string | null;  
  status: string;  
  created_at: string;  
  updated_at: string;  
  vehicles?: Array<{  
    id: string;  
    make: string;  
    model: string;  
    registration_number: string;  
    status: string;  
  }>;  
  policies?: Array<{  
    id: string;  
    policy_number: string;  
    policy_type: string;  
    status: string;  
    premium_amount: number;  
  }>;  
}  
  
interface ClientStats {  
  totalClients: number;  
  activeClients: number;  
  inactiveClients: number;  
  newThisMonth: number;  
  clientsWithVehicles: number;  
  clientsWithPolicies: number;  
}  
  
const ClientManagement = () => {  
  const [clients, setClients] = useState<Client[]>([]);  
  const [stats, setStats] = useState<ClientStats | null>(null);  
  const [searchTerm, setSearchTerm] = useState("");  
  const [statusFilter, setStatusFilter] = useState("all");  
  const [loading, setLoading] = useState(true);  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);  
  const { toast } = useToast();  
  
  // Form state for new/edit client  
  const [clientForm, setClientForm] = useState({  
    first_name: "",  
    last_name: "",  
    email: "",  
    phone: "",  
    id_number: "",  
    address: "",  
    city: "",  
    postal_code: "",  
    date_of_birth: "",  
    gender: "",  
    status: "active"  
  });  
  
  useEffect(() => {  
    fetchClients();  
  }, []);  
  
  const fetchClients = async () => {  
    try {  
      setLoading(true);  
        
      // Fetch clients with related vehicles and policies  
      const { data: clientsData, error: clientsError } = await supabase  
        .from('clients')  
        .select(`  
          *,  
          vehicles (  
            id,  
            make,  
            model,  
            registration_number,  
            status  
          ),  
          policies (  
            id,  
            policy_number,  
            policy_type,  
            status,  
            premium_amount  
          )  
        `)  
        .order('created_at', { ascending: false });  
  
      if (clientsError) throw clientsError;  
  
      const clients = clientsData || [];  
      setClients(clients);  
  
      // Calculate statistics  
      const now = new Date();  
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);  
        
      const stats: ClientStats = {  
        totalClients: clients.length,  
        activeClients: clients.filter(c => c.status === 'active').length,  
        inactiveClients: clients.filter(c => c.status === 'inactive').length,  
        newThisMonth: clients.filter(c => new Date(c.created_at) >= startOfMonth).length,  
        clientsWithVehicles: clients.filter(c => c.vehicles && c.vehicles.length > 0).length,  
        clientsWithPolicies: clients.filter(c => c.policies && c.policies.length > 0).length  
      };  
  
      setStats(stats);  
    } catch (error) {  
      toast({  
        title: "Error",  
        description: "Failed to fetch clients",  
        variant: "destructive",  
      });  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const handleAddClient = async () => {  
    try {  
      const { error } = await supabase  
        .from('clients')  
        .insert([{  
          ...clientForm,  
          email: clientForm.email || null,  
          id_number: clientForm.id_number || null,  
          address: clientForm.address || null,  
          city: clientForm.city || null,  
          postal_code: clientForm.postal_code || null,  
          date_of_birth: clientForm.date_of_birth || null,  
          gender: clientForm.gender || null  
        }]);  
  
      if (error) throw error;  
  
      toast({  
        title: "Success",  
        description: "Client added successfully",  
      });  
  
      setIsAddDialogOpen(false);  
      resetForm();  
      fetchClients();  
    } catch (error) {  
      toast({  
        title: "Error",  
        description: "Failed to add client",  
        variant: "destructive",  
      });  
    }  
  };  
  
  const handleEditClient = async () => {  
    if (!selectedClient) return;  
  
    try {  
      const { error } = await supabase  
        .from('clients')  
        .update({  
          ...clientForm,  
          email: clientForm.email || null,  
          id_number: clientForm.id_number || null,  
          address: clientForm.address || null,  
          city: clientForm.city || null,  
          postal_code: clientForm.postal_code || null,  
          date_of_birth: clientForm.date_of_birth || null,  
          gender: clientForm.gender || null,  
          updated_at: new Date().toISOString()  
        })  
        .eq('id', selectedClient.id);  
  
      if (error) throw error;  
  
      toast({  
        title: "Success",  
        description: "Client updated successfully",  
      });  
  
      setIsEditDialogOpen(false);  
      setSelectedClient(null);  
      resetForm();  
      fetchClients();  
    } catch (error) {  
      toast({  
        title: "Error",  
        description: "Failed to update client",  
        variant: "destructive",  
      });  
    }  
  };  
  
  const handleDeleteClient = async (clientId: string) => {  
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {  
      return;  
    }  
  
    try {  
      const { error } = await supabase  
        .from('clients')  
        .delete()  
        .eq('id', clientId);  
  
      if (error) throw error;  
  
      toast({  
        title: "Success",  
        description: "Client deleted successfully",  
      });  
  
      fetchClients();  
    } catch (error) {  
      toast({  
        title: "Error",  
        description: "Failed to delete client",  
        variant: "destructive",  
      });  
    }  
  };  
  
  const openEditDialog = (client: Client) => {  
    setSelectedClient(client);  
    setClientForm({  
      first_name: client.first_name,  
      last_name: client.last_name,  
      email: client.email || "",  
      phone: client.phone,  
      id_number: client.id_number || "",  
      address: client.address || "",  
      city: client.city || "",  
      postal_code: client.postal_code || "",  
      date_of_birth: client.date_of_birth || "",  
      gender: client.gender || "",  
      status: client.status  
    });  
    setIsEditDialogOpen(true);  
  };  
  
  const resetForm = () => {  
    setClientForm({  
      first_name: "",  
      last_name: "",  
      email: "",  
      phone: "",  
      id_number: "",  
      address: "",  
      city: "",  
      postal_code: "",  
      date_of_birth: "",  
      gender: "",  
      status: "active"  
    });  
  };  
  
  const filteredClients = clients.filter(client => {  
    const matchesSearch =   
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      client.phone.includes(searchTerm) ||  
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||  
      (client.id_number && client.id_number.includes(searchTerm));  
      
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;  
      
    return matchesSearch && matchesStatus;  
  });  
  
  const getStatusColor = (status: string) => {  
    switch (status) {  
      case 'active': return 'bg-green-100 text-green-800';  
      case 'inactive': return 'bg-gray-100 text-gray-800';  
      case 'suspended': return 'bg-red-100 text-red-800';  
      default: return 'bg-gray-100 text-gray-800';  
    }  
  };  
  
  if (loading || !stats) {  
    return (  
      <div className="container mx-auto p-6">  
        <div className="flex items-center justify-center h-64">  
          <div className="text-center">  
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>  
            <p className="mt-4 text-muted-foreground">Loading clients...</p>  
          </div>  
        </div>  
      </div>  
    );  
  }  
  
  const statisticsCards = [  
    {  
      title: "Total Clients",  
      value: stats.totalClients.toString(),  
      icon: Users,  
      trend: "+12.5%",  
      description: "registered clients",  
      color: "text-blue-600"  
    },  
    {  
      title: "Active Clients",  
      value: stats.activeClients.toString(),  
      icon: Users,  
      trend: "+8.2%",  
      description: "currently active",  
      color: "text-green-600"  
    },  
    {  
      title: "New This Month",  
      value: stats.newThisMonth.toString(),  
      icon: Calendar,  
      trend: "+15.3%",  
      description: "new registrations",  
      color: "text-purple-600"  
    },  
    {  
      title: "With Policies",  
      value: stats.clientsWithPolicies.toString(),  
      icon: FileText,  
      trend: "+5.1%",  
      description: "have active policies",  
      color: "text-orange-600"  
    }  
  ];  
  
  return (  
    <div className="container mx-auto p-6 space-y-6">  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">  
        <div>  
          <h1 className="text-3xl font-bold">Client Management</h1>  
          <p className="text-muted-foreground">Manage customer information and relationships</p>  
        </div>  
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>  
          <DialogTrigger asChild>  
            <Button>  
              <Plus className="h-4 w-4 mr-2" />  
              Add Client  
            </Button>  
          </DialogTrigger>  
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">  
            <DialogHeader>  
              <DialogTitle>Add New Client</DialogTitle>  
              <DialogDescription>  
                Enter the client details to create a new customer profile.  
              </DialogDescription>  
            </DialogHeader>  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">  
              <div className="space-y-2">  
                <Label htmlFor="first_name">First Name *</Label>  
                <Input  
                  id="first_name"  
                  value={clientForm.first_name}  
                  onChange={(e) => setClientForm({...clientForm, first_name: e.target.value})}  
                  placeholder="John"  
                  required  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="last_name">Last Name *</Label>  
                <Input  
                  id="last_name"  
                  value={clientForm.last_name}  
                  onChange={(e) => setClientForm({...clientForm, last_name: e.target.value})}  
                  placeholder="Doe"  
                  required  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="phone">Phone Number *</Label>  
                <Input  
                  id="phone"  
                  value={clientForm.phone}  
                  onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}  
                  placeholder="+254 700 000 000"  
                  required  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="email">Email</Label>  
                <Input  
                  id="email"  
                  type="email"  
                  value={clientForm.email}  
                  onChange={(e) => setClientForm({...clientForm, email: e.target.value})}  
                  placeholder="john.doe@example.com"  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="id_number">ID Number</Label>  
                <Input  
                  id="id_number"  
                  value={clientForm.id_number}  
                  onChange={(e) => setClientForm({...clientForm, id_number: e.target.value})}  
                  placeholder="12345678"  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="date_of_birth">Date of Birth</Label>  
                <Input  
                  id="date_of_birth"  
                  type="date"  
                  value={clientForm.date_of_birth}  
                  onChange={(e) => setClientForm({...clientForm, date_of_birth: e.target.value})}  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="gender">Gender</Label>  
                <Select value={clientForm.gender} onValueChange={(value) => setClientForm({...clientForm, gender: value})}>  
                  <SelectTrigger>  
                    <SelectValue placeholder="Select gender" />  
                  </SelectTrigger>  
                  <SelectContent>  
                    <SelectItem value="male">Male</SelectItem>  
                    <SelectItem value="female">Female</SelectItem>  
                    <SelectItem value="other">Other</SelectItem>  
                  </SelectContent>  
                </Select>  
              </div>  
              <div className="space-y-2"> 
                     <Label htmlFor="status">Status</Label>  
                <Select value={clientForm.status} onValueChange={(value) => setClientForm({...clientForm, status: value})}>  
                  <SelectTrigger>  
                    <SelectValue placeholder="Select status" />  
                  </SelectTrigger>  
                  <SelectContent>  
                    <SelectItem value="active">Active</SelectItem>  
                    <SelectItem value="inactive">Inactive</SelectItem>  
                    <SelectItem value="suspended">Suspended</SelectItem>  
                  </SelectContent>  
                </Select>  
              </div>  
              <div className="space-y-2 md:col-span-2">  
                <Label htmlFor="address">Address</Label>  
                <Textarea  
                  id="address"  
                  value={clientForm.address}  
                  onChange={(e) => setClientForm({...clientForm, address: e.target.value})}  
                  placeholder="Street address"  
                  rows={2}  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="city">City</Label>  
                <Input  
                  id="city"  
                  value={clientForm.city}  
                  onChange={(e) => setClientForm({...clientForm, city: e.target.value})}  
                  placeholder="Nairobi"  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="postal_code">Postal Code</Label>  
                <Input  
                  id="postal_code"  
                  value={clientForm.postal_code}  
                  onChange={(e) => setClientForm({...clientForm, postal_code: e.target.value})}  
                  placeholder="00100"  
                />  
              </div>  
            </div>  
            <div className="flex justify-end gap-2 pt-4">  
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>  
                Cancel  
              </Button>  
              <Button onClick={handleAddClient} disabled={!clientForm.first_name || !clientForm.last_name || !clientForm.phone}>  
                Add Client  
              </Button>  
            </div>  
          </DialogContent>  
        </Dialog>  
      </div>  
  
      {/* Statistics Cards */}  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">  
        {statisticsCards.map((stat, index) => (  
          <Card key={index} className="hover:shadow-lg transition-shadow">  
            <CardContent className="p-6">  
              <div className="flex items-center justify-between">  
                <div>  
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>  
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>  
                  <p className="text-xs text-gray-500 mt-1">  
                    <span className="text-green-600">{stat.trend}</span> {stat.description}  
                  </p>  
                </div>  
                <stat.icon className={`h-8 w-8 ${stat.color}`} />  
              </div>  
            </CardContent>  
          </Card>  
        ))}  
      </div>  
  
      {/* Search and Filters */}  
      <Card>  
        <CardContent className="p-6">  
          <div className="flex flex-col sm:flex-row gap-4">  
            <div className="relative flex-1">  
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />  
              <Input  
                placeholder="Search clients by name, phone, email, or ID..."  
                value={searchTerm}  
                onChange={(e) => setSearchTerm(e.target.value)}  
                className="pl-10"  
              />  
            </div>  
            <Select value={statusFilter} onValueChange={setStatusFilter}>  
              <SelectTrigger className="w-full sm:w-48">  
                <SelectValue placeholder="Filter by status" />  
              </SelectTrigger>  
              <SelectContent>  
                <SelectItem value="all">All Statuses</SelectItem>  
                <SelectItem value="active">Active</SelectItem>  
                <SelectItem value="inactive">Inactive</SelectItem>  
                <SelectItem value="suspended">Suspended</SelectItem>  
              </SelectContent>  
            </Select>  
          </div>  
        </CardContent>  
      </Card>  
  
      {/* Client Tabs */}  
      <Tabs defaultValue="all" className="space-y-4">  
        <TabsList className="grid w-full grid-cols-4">  
          <TabsTrigger value="all">All Clients ({filteredClients.length})</TabsTrigger>  
          <TabsTrigger value="active">Active ({stats.activeClients})</TabsTrigger>  
          <TabsTrigger value="inactive">Inactive ({stats.inactiveClients})</TabsTrigger>  
          <TabsTrigger value="with-policies">With Policies ({stats.clientsWithPolicies})</TabsTrigger>  
        </TabsList>  
  
        <TabsContent value="all" className="space-y-4">  
          {filteredClients.length === 0 ? (  
            <Card>  
              <CardContent className="p-8 text-center">  
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />  
                <p className="text-gray-500">No clients found matching your search criteria</p>  
              </CardContent>  
            </Card>  
          ) : (  
            <div className="grid gap-4">  
              {filteredClients.map((client) => (  
                <Card key={client.id} className="hover:shadow-lg transition-shadow">  
                  <CardContent className="p-6">  
                    <div className="flex items-start justify-between">  
                      <div className="flex items-start space-x-4 flex-1">  
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">  
                          <Users className="h-6 w-6 text-white" />  
                        </div>  
                          
                        <div className="space-y-2 flex-1">  
                          <div>  
                            <h3 className="font-semibold text-lg">  
                              {client.first_name} {client.last_name}  
                            </h3>  
                            {client.id_number && (  
                              <p className="text-sm text-muted-foreground">ID: {client.id_number}</p>  
                            )}  
                          </div>  
                            
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">  
                            <div className="flex items-center gap-2">  
                              <Phone className="h-4 w-4 text-muted-foreground" />  
                              <span>{client.phone}</span>  
                            </div>  
                            {client.email && (  
                              <div className="flex items-center gap-2">  
                                <Mail className="h-4 w-4 text-muted-foreground" />  
                                <span className="truncate">{client.email}</span>  
                              </div>  
                            )}  
                            {client.city && (  
                              <div className="flex items-center gap-2">  
                                <MapPin className="h-4 w-4 text-muted-foreground" />  
                                <span>{client.city}</span>  
                              </div>  
                            )}  
                            <div className="flex items-center gap-2">  
                              <Car className="h-4 w-4 text-muted-foreground" />  
                              <span>{client.vehicles?.length || 0} Vehicle{(client.vehicles?.length || 0) !== 1 ? 's' : ''}</span>  
                            </div>  
                            <div className="flex items-center gap-2">  
                              <FileText className="h-4 w-4 text-muted-foreground" />  
                              <span>{client.policies?.length || 0} Polic{(client.policies?.length || 0) !== 1 ? 'ies' : 'y'}</span>  
                            </div>  
                            <div className="flex items-center gap-2">  
                              <Calendar className="h-4 w-4 text-muted-foreground" />  
                              <span>Joined {format(parseISO(client.created_at), 'MMM dd, yyyy')}</span>  
                            </div>  
                          </div>  
                        </div>  
                      </div>  
  
                      <div className="flex items-center space-x-3">  
                        <Badge className={getStatusColor(client.status)}>  
                          {client.status}  
                        </Badge>  
                          
                        <div className="flex space-x-2">  
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(client)}>  
                            <Edit className="h-4 w-4" />  
                          </Button>  
                          <Button   
                            size="sm"   
                            variant="outline"   
                            onClick={() => handleDeleteClient(client.id)}  
                            className="text-red-600 hover:text-red-700"  
                          >  
                            <Trash2 className="h-4 w-4" />  
                          </Button>  
                        </div>  
                      </div>  
                    </div>  
  
                    {/* Vehicle and Policy Summary */}  
                    {(client.vehicles && client.vehicles.length > 0) || (client.policies && client.policies.length > 0) ? (  
                      <div className="mt-4 pt-4 border-t">  
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">  
                          {client.vehicles && client.vehicles.length > 0 && (  
                            <div>  
                              <p className="font-medium text-gray-700 mb-2">Vehicles:</p>  
                              <div className="space-y-1">  
                                {client.vehicles.slice(0, 2).map((vehicle) => (  
                                  <p key={vehicle.id} className="text-gray-600">  
                                    {vehicle.make} {vehicle.model} ({vehicle.registration_number})  
                                  </p>  
                                ))}  
                                {client.vehicles.length > 2 && (  
                                  <p className="text-gray-500">+{client.vehicles.length - 2} more</p>  
                                )}  
                              </div>  
                            </div>  
                          )}  
                          {client.policies && client.policies.length > 0 && (  
                            <div>  
                              <p className="font-medium text-gray-700 mb-2">Policies:</p>  
                              <div className="space-y-1">  
                                {client.policies.slice(0, 2).map((policy) => (  
                                  <p key={policy.id} className="text-gray-600">  
                                    {policy.policy_number} - KES {policy.premium_amount.toLocaleString()}  
                                  </p>  
                                ))}  
                                {client.policies.length > 2 && (  
                                  <p className="text-gray-500">+{client.policies.length - 2} more</p>  
                                )}  
                              </div>  
                            </div>  
                          )}  
                        </div>  
                      </div>  
                    ) : null}  
                  </CardContent>  
                </Card>  
              ))}  
            </div>  
          )}  
        </TabsContent>  
  
        <TabsContent value="active">  
          <div className="grid gap-4">  
            {filteredClients.filter(c => c.status === 'active').map((client) => (  
              <Card key={client.id} className="hover:shadow-lg transition-shadow">  
                <CardContent className="p-6">  
                  <div className="flex items-center justify-between">  
                    <div>  
                      <h3 className="font-semibold">{client.first_name} {client.last_name}</h3>  
                      <p className="text-sm text-muted-foreground">{client.phone}</p>  
                    </div>  
                    <Badge className={getStatusColor(client.status)}>  
                      {client.status}  
                    </Badge>  
                  </div>  
                </CardContent>  
              </Card>  
            ))}  
          </div>  
        </TabsContent>  
  
        <TabsContent value="inactive">  
          <div className="grid gap-4">  
            {filteredClients.filter(c => c.status === 'inactive').map((client) => (  
              <Card key={client.id} className="hover:shadow-lg transition-shadow">  
                <CardContent className="p-6">  
                  <div className="flex items-center justify-between">  
                    <div>  
                      <h3 className="font-semibold">{client.first_name} {client.last_name}</h3>  
                      <p className="text-sm text-muted-foreground">{client.phone}</p>  
                    </div>  
                    <Badge className={getStatusColor(client.status)}>  
                      {client.status}  
                    </Badge>  
                  </div>  
                </CardContent>  
              </Card>  
            ))}  
          </div>  
        </TabsContent>  
  
        <TabsContent value="with-policies">  
          <div className="grid gap-4">  
            {filteredClients.filter(c => c.policies && c.policies.length > 0).map((client) => (  
              <Card key={client.id} className="hover:shadow-lg transition-shadow">  
                <CardContent className="p-6">  
                  <div className="flex items-center justify-between">  
                    <div>  
                      <h3 className="font-semibold">{client.first_name} {client.last_name}</h3>  
                      <p className="text-sm text-muted-foreground">  
                        {client.policies?.length} active polic{(client.policies?.length || 0) !== 1 ? 'ies' : 'y'}  
                      </p>  
                    </div>  
                    <Badge className={getStatusColor(client.status)}>  
                      {client.status}  
                    </Badge>  
                  </div>  
                </CardContent>  
              </Card>  
            ))}  
          </div>  
        </TabsContent>  
      </Tabs>  
  
      {/* Edit Client Dialog */}  
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>  
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">  
          <DialogHeader>  
            <DialogTitle>Edit Client</DialogTitle>  
            <DialogDescription>  
              Update the client information below.  
            </DialogDescription>  
          </DialogHeader>  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">  
            <div className="space-y-2">  
              <Label htmlFor="edit_first_name">First Name *</Label>  
              <Input  
                id="edit_first_name"  
                value={clientForm.first_name}  
                onChange={(e) => setClientForm({...clientForm, first_name: e.target.value})}  
                placeholder="John"  
                required  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_last_name">Last Name *</Label>  
              <Input  
                id="edit_last_name"  
                value={clientForm.last_name}  
                onChange={(e) => setClientForm({...clientForm,  
                 last_name: e.target.value})}  
                placeholder="Doe"  
                required  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_phone">Phone Number *</Label>  
              <Input  
                id="edit_phone"  
                value={clientForm.phone}  
                onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}  
                placeholder="+254 700 000 000"  
                required  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_email">Email</Label>  
              <Input  
                id="edit_email"  
                type="email"  
                value={clientForm.email}  
                onChange={(e) => setClientForm({...clientForm, email: e.target.value})}  
                placeholder="john.doe@example.com"  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_id_number">ID Number</Label>  
              <Input  
                id="edit_id_number"  
                value={clientForm.id_number}  
                onChange={(e) => setClientForm({...clientForm, id_number: e.target.value})}  
                placeholder="12345678"  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_date_of_birth">Date of Birth</Label>  
              <Input  
                id="edit_date_of_birth"  
                type="date"  
                value={clientForm.date_of_birth}  
                onChange={(e) => setClientForm({...clientForm, date_of_birth: e.target.value})}  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_gender">Gender</Label>  
              <Select value={clientForm.gender} onValueChange={(value) => setClientForm({...clientForm, gender: value})}>  
                <SelectTrigger>  
                  <SelectValue placeholder="Select gender" />  
                </SelectTrigger>  
                <SelectContent>  
                  <SelectItem value="male">Male</SelectItem>  
                  <SelectItem value="female">Female</SelectItem>  
                  <SelectItem value="other">Other</SelectItem>  
                </SelectContent>  
              </Select>  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_status">Status</Label>  
              <Select value={clientForm.status} onValueChange={(value) => setClientForm({...clientForm, status: value})}>  
                <SelectTrigger>  
                  <SelectValue placeholder="Select status" />  
                </SelectTrigger>  
                <SelectContent>  
                  <SelectItem value="active">Active</SelectItem>  
                  <SelectItem value="inactive">Inactive</SelectItem>  
                  <SelectItem value="suspended">Suspended</SelectItem>  
                </SelectContent>  
              </Select>  
            </div>  
            <div className="space-y-2 md:col-span-2">  
              <Label htmlFor="edit_address">Address</Label>  
              <Textarea  
                id="edit_address"  
                value={clientForm.address}  
                onChange={(e) => setClientForm({...clientForm, address: e.target.value})}  
                placeholder="Street address"  
                rows={2}  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_city">City</Label>  
              <Input  
                id="edit_city"  
                value={clientForm.city}  
                onChange={(e) => setClientForm({...clientForm, city: e.target.value})}  
                placeholder="Nairobi"  
              />  
            </div>  
            <div className="space-y-2">  
              <Label htmlFor="edit_postal_code">Postal Code</Label>  
              <Input  
                id="edit_postal_code"  
                value={clientForm.postal_code}  
                onChange={(e) => setClientForm({...clientForm, postal_code: e.target.value})}  
                placeholder="00100"  
              />  
            </div>  
          </div>  
          <div className="flex justify-end gap-2 pt-4">  
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>  
              Cancel  
            </Button>  
            <Button onClick={handleEditClient} disabled={!clientForm.first_name || !clientForm.last_name || !clientForm.phone}>  
              Update Client  
            </Button>  
          </div>  
        </DialogContent>  
      </Dialog>  
    </div>  
  );  
};  
  
export default ClientManagement;
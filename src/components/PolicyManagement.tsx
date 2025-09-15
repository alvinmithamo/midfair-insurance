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
import { Plus, Search, Filter, FileText, Calendar, AlertTriangle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";

interface Policy {
  id: string;
  client_id: string;
  vehicle_id: string;
  policy_number: string;
  policy_type: string;
  start_date: string;
  end_date: string;
  premium_amount: number;
  excess_amount: number;
  sum_insured: number;
  status: string;
  renewal_date?: string;
  agent_commission: number;
  notes?: string;
  created_at: string;
  clients: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  vehicles: {
    make: string;
    model: string;
    registration_number: string;
  };
}

const PolicyManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const { toast } = useToast();

  // Form state for new policy
  const [newPolicy, setNewPolicy] = useState({
    client_id: "",
    vehicle_id: "",
    policy_number: "",
    policy_type: "comprehensive",
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
    premium_amount: 0,
    excess_amount: 0,
    sum_insured: 0,
    agent_commission: 0,
    notes: "",
  });

  const [clients, setClients] = useState<Array<{id: string, first_name: string, last_name: string}>>([]);
  const [vehicles, setVehicles] = useState<Array<{id: string, make: string, model: string, registration_number: string, client_id: string}>>([]);

  useEffect(() => {
    fetchPolicies();
    fetchClients();
    fetchVehicles();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          *,
          clients (
            first_name,
            last_name,
            phone
          ),
          vehicles (
            make,
            model,
            registration_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch policies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, registration_number, client_id')
        .eq('status', 'active')
        .order('make');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleAddPolicy = async () => {
    try {
      const { error } = await supabase
        .from('policies')
        .insert([newPolicy]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy created successfully",
      });

      setIsAddDialogOpen(false);
      setNewPolicy({
        client_id: "",
        vehicle_id: "",
        policy_number: "",
        policy_type: "comprehensive",
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
        premium_amount: 0,
        excess_amount: 0,
        sum_insured: 0,
        agent_commission: 0,
        notes: "",
      });
      fetchPolicies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    }
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePolicy = async () => {
    if (!editingPolicy) return;

    try {
      const { error } = await supabase
        .from('policies')
        .update({
          client_id: editingPolicy.client_id,
          vehicle_id: editingPolicy.vehicle_id,
          policy_type: editingPolicy.policy_type,
          start_date: editingPolicy.start_date,
          end_date: editingPolicy.end_date,
          premium_amount: editingPolicy.premium_amount,
          excess_amount: editingPolicy.excess_amount,
          sum_insured: editingPolicy.sum_insured,
          status: editingPolicy.status,
          renewal_date: editingPolicy.renewal_date,
          agent_commission: editingPolicy.agent_commission,
          notes: editingPolicy.notes,
        })
        .eq('id', editingPolicy.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingPolicy(null);
      fetchPolicies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy deleted successfully",
      });

      fetchPolicies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete policy",
        variant: "destructive",
      });
    }
  };

  const generatePolicyNumber = () => {
    const prefix = "POL";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  };

  const filteredPolicies = policies.filter(policy =>
    policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${policy.clients?.first_name} ${policy.clients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.vehicles?.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExpiringPolicies = () => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return policies.filter(policy => 
      policy.status === 'active' && 
      isBefore(parseISO(policy.end_date), thirtyDaysFromNow) &&
      isAfter(parseISO(policy.end_date), new Date())
    );
  };

  const stats = [
    {
      title: "Total Policies",
      value: policies.length.toString(),
      icon: FileText,
      trend: "+8.2%",
      description: "vs last month"
    },
    {
      title: "Active Policies",
      value: policies.filter(p => p.status === 'active').length.toString(),
      icon: FileText,
      trend: "+3.1%",
      description: "currently active"
    },
    {
      title: "Expiring Soon",
      value: getExpiringPolicies().length.toString(),
      icon: AlertTriangle,
      trend: "+12%",
      description: "next 30 days"
    },
    {
      title: "Total Premium",
      value: `KES ${Math.round(policies.reduce((sum, p) => sum + Number(p.premium_amount), 0)).toLocaleString()}`,
      icon: FileText,
      trend: "+15.3%",
      description: "annual value"
    }
  ];

  const clientVehicles = vehicles.filter(v => v.client_id === newPolicy.client_id);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading policies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">Manage insurance policies and renewals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Enter the policy details to create a new insurance policy.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={newPolicy.client_id} onValueChange={(value) => setNewPolicy({...newPolicy, client_id: value, vehicle_id: ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={newPolicy.vehicle_id} onValueChange={(value) => setNewPolicy({...newPolicy, vehicle_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} - {vehicle.registration_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy_number">Policy Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="policy_number"
                    value={newPolicy.policy_number}
                    onChange={(e) => setNewPolicy({...newPolicy, policy_number: e.target.value})}
                    placeholder="POL20240001"
                  />
                  <Button type="button" variant="outline" onClick={() => setNewPolicy({...newPolicy, policy_number: generatePolicyNumber()})}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy_type">Policy Type</Label>
                <Select value={newPolicy.policy_type} onValueChange={(value) => setNewPolicy({...newPolicy, policy_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="third_party">Third Party</SelectItem>
                    <SelectItem value="third_party_fire_theft">Third Party Fire & Theft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newPolicy.start_date}
                  onChange={(e) => setNewPolicy({...newPolicy, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newPolicy.end_date}
                  onChange={(e) => setNewPolicy({...newPolicy, end_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_amount">Premium Amount (KES)</Label>
                <Input
                  id="premium_amount"
                  type="number"
                  value={newPolicy.premium_amount}
                  onChange={(e) => setNewPolicy({...newPolicy, premium_amount: parseFloat(e.target.value)})}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sum_insured">Sum Insured (KES)</Label>
                <Input
                  id="sum_insured"
                  type="number"
                  value={newPolicy.sum_insured}
                  onChange={(e) => setNewPolicy({...newPolicy, sum_insured: parseFloat(e.target.value)})}
                  placeholder="1500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excess_amount">Excess Amount (KES)</Label>
                <Input
                  id="excess_amount"
                  type="number"
                  value={newPolicy.excess_amount}
                  onChange={(e) => setNewPolicy({...newPolicy, excess_amount: parseFloat(e.target.value)})}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_commission">Agent Commission (%)</Label>
                <Input
                  id="agent_commission"
                  type="number"
                  step="0.1"
                  value={newPolicy.agent_commission}
                  onChange={(e) => setNewPolicy({...newPolicy, agent_commission: parseFloat(e.target.value)})}
                  placeholder="10.5"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPolicy.notes}
                  onChange={(e) => setNewPolicy({...newPolicy, notes: e.target.value})}
                  placeholder="Additional policy notes..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPolicy}>Create Policy</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Policy Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Policy</DialogTitle>
              <DialogDescription>
                Update the policy details.
              </DialogDescription>
            </DialogHeader>
            {editingPolicy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client</Label>
                  <Select value={editingPolicy.client_id} onValueChange={(value) => setEditingPolicy({...editingPolicy, client_id: value, vehicle_id: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle">Vehicle</Label>
                  <Select value={editingPolicy.vehicle_id} onValueChange={(value) => setEditingPolicy({...editingPolicy, vehicle_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.filter(v => v.client_id === editingPolicy.client_id).map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.registration_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-policy_type">Policy Type</Label>
                  <Select value={editingPolicy.policy_type} onValueChange={(value) => setEditingPolicy({...editingPolicy, policy_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="third_party">Third Party</SelectItem>
                      <SelectItem value="third_party_fire_theft">Third Party Fire & Theft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-start_date">Start Date</Label>
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={editingPolicy.start_date}
                    onChange={(e) => setEditingPolicy({...editingPolicy, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end_date">End Date</Label>
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={editingPolicy.end_date}
                    onChange={(e) => setEditingPolicy({...editingPolicy, end_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-premium_amount">Premium Amount (KES)</Label>
                  <Input
                    id="edit-premium_amount"
                    type="number"
                    value={editingPolicy.premium_amount}
                    onChange={(e) => setEditingPolicy({...editingPolicy, premium_amount: parseFloat(e.target.value)})}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sum_insured">Sum Insured (KES)</Label>
                  <Input
                    id="edit-sum_insured"
                    type="number"
                    value={editingPolicy.sum_insured}
                    onChange={(e) => setEditingPolicy({...editingPolicy, sum_insured: parseFloat(e.target.value)})}
                    placeholder="1500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingPolicy.status} onValueChange={(value) => setEditingPolicy({...editingPolicy, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingPolicy.notes || ''}
                    onChange={(e) => setEditingPolicy({...editingPolicy, notes: e.target.value})}
                    placeholder="Additional policy notes..."
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePolicy}>Update Policy</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-emerald-600">{stat.trend}</span> {stat.description}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search policies by number, client, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Policies Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({policies.filter(p => p.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon ({getExpiringPolicies().length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({policies.filter(p => p.status === 'expired').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.policy_number}</CardTitle>
                      <CardDescription className="capitalize">{policy.policy_type.replace('_', ' ')}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={policy.status === 'active' ? 'default' : policy.status === 'expired' ? 'destructive' : 'secondary'}>
                        {policy.status}
                      </Badge>
                      {getExpiringPolicies().includes(policy) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{policy.clients?.first_name} {policy.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{policy.vehicles?.make} {policy.vehicles?.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registration:</span>
                      <span>{policy.vehicles?.registration_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium:</span>
                      <span>KES {Number(policy.premium_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sum Insured:</span>
                      <span>KES {Number(policy.sum_insured).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span>{format(parseISO(policy.end_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Policy
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Renew
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePolicy(policy.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tab contents would filter by status */}
        <TabsContent value="expiring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getExpiringPolicies().map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow border-orange-200">
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyManagement;










// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Search, Filter, FileText, Calendar, AlertTriangle, MoreHorizontal } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";

// interface Policy {
//   id: string;
//   client_id: string;
//   vehicle_id: string;
//   policy_number: string;
//   policy_type: string;
//   start_date: string;
//   end_date: string;
//   premium_amount: number;
//   excess_amount: number;
//   sum_insured: number;
//   status: string;
//   renewal_date?: string;
//   agent_commission: number;
//   notes?: string;
//   created_at: string;
//   clients: {
//     first_name: string;
//     last_name: string;
//     phone: string;
//   };
//   vehicles: {
//     make: string;
//     model: string;
//     registration_number: string;
//   };
// }

// const PolicyManagement = () => {
//   const [policies, setPolicies] = useState<Policy[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const { toast } = useToast();

//   // Form state for new policy
//   const [newPolicy, setNewPolicy] = useState({
//     client_id: "",
//     vehicle_id: "",
//     policy_number: "",
//     policy_type: "comprehensive",
//     start_date: format(new Date(), 'yyyy-MM-dd'),
//     end_date: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
//     premium_amount: 0,
//     excess_amount: 0,
//     sum_insured: 0,
//     agent_commission: 0,
//     notes: "",
//   });

//   const [clients, setClients] = useState<Array<{id: string, first_name: string, last_name: string}>>([]);
//   const [vehicles, setVehicles] = useState<Array<{id: string, make: string, model: string, registration_number: string, client_id: string}>>([]);

//   useEffect(() => {
//     fetchPolicies();
//     fetchClients();
//     fetchVehicles();
//   }, []);

//   const fetchPolicies = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('policies')
//         .select(`
//           *,
//           clients (
//             first_name,
//             last_name,
//             phone
//           ),
//           vehicles (
//             make,
//             model,
//             registration_number
//           )
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setPolicies(data || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch policies",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('clients')
//         .select('id, first_name, last_name')
//         .eq('status', 'active')
//         .order('first_name');

//       if (error) throw error;
//       setClients(data || []);
//     } catch (error) {
//       console.error('Error fetching clients:', error);
//     }
//   };

//   const fetchVehicles = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('vehicles')
//         .select('id, make, model, registration_number, client_id')
//         .eq('status', 'active')
//         .order('make');

//       if (error) throw error;
//       setVehicles(data || []);
//     } catch (error) {
//       console.error('Error fetching vehicles:', error);
//     }
//   };

//   const handleAddPolicy = async () => {
//     try {
//       const { error } = await supabase
//         .from('policies')
//         .insert([newPolicy]);

//       if (error) throw error;

//       toast({
//         title: "Success",
//         description: "Policy created successfully",
//       });

//       setIsAddDialogOpen(false);
//       setNewPolicy({
//         client_id: "",
//         vehicle_id: "",
//         policy_number: "",
//         policy_type: "comprehensive",
//         start_date: format(new Date(), 'yyyy-MM-dd'),
//         end_date: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
//         premium_amount: 0,
//         excess_amount: 0,
//         sum_insured: 0,
//         agent_commission: 0,
//         notes: "",
//       });
//       fetchPolicies();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create policy",
//         variant: "destructive",
//       });
//     }
//   };

//   const generatePolicyNumber = () => {
//     const prefix = "POL";
//     const year = new Date().getFullYear();
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     return `${prefix}${year}${random}`;
//   };

//   const filteredPolicies = policies.filter(policy =>
//     policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     `${policy.clients?.first_name} ${policy.clients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     policy.vehicles?.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getExpiringPolicies = () => {
//     const thirtyDaysFromNow = addDays(new Date(), 30);
//     return policies.filter(policy => 
//       policy.status === 'active' && 
//       isBefore(parseISO(policy.end_date), thirtyDaysFromNow) &&
//       isAfter(parseISO(policy.end_date), new Date())
//     );
//   };

//   const stats = [
//     {
//       title: "Total Policies",
//       value: policies.length.toString(),
//       icon: FileText,
//       trend: "+8.2%",
//       description: "vs last month"
//     },
//     {
//       title: "Active Policies",
//       value: policies.filter(p => p.status === 'active').length.toString(),
//       icon: FileText,
//       trend: "+3.1%",
//       description: "currently active"
//     },
//     {
//       title: "Expiring Soon",
//       value: getExpiringPolicies().length.toString(),
//       icon: AlertTriangle,
//       trend: "+12%",
//       description: "next 30 days"
//     },
//     {
//       title: "Total Premium",
//       value: `KES ${Math.round(policies.reduce((sum, p) => sum + Number(p.premium_amount), 0)).toLocaleString()}`,
//       icon: FileText,
//       trend: "+15.3%",
//       description: "annual value"
//     }
//   ];

//   const clientVehicles = vehicles.filter(v => v.client_id === newPolicy.client_id);

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//             <p className="mt-4 text-muted-foreground">Loading policies...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Policy Management</h1>
//           <p className="text-muted-foreground">Manage insurance policies and renewals</p>
//         </div>
//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               Create Policy
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Create New Policy</DialogTitle>
//               <DialogDescription>
//                 Enter the policy details to create a new insurance policy.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="client">Client</Label>
//                 <Select value={newPolicy.client_id} onValueChange={(value) => setNewPolicy({...newPolicy, client_id: value, vehicle_id: ""})}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select client" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {clients.map((client) => (
//                       <SelectItem key={client.id} value={client.id}>
//                         {client.first_name} {client.last_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="vehicle">Vehicle</Label>
//                 <Select value={newPolicy.vehicle_id} onValueChange={(value) => setNewPolicy({...newPolicy, vehicle_id: value})}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select vehicle" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {clientVehicles.map((vehicle) => (
//                       <SelectItem key={vehicle.id} value={vehicle.id}>
//                         {vehicle.make} {vehicle.model} - {vehicle.registration_number}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="policy_number">Policy Number</Label>
//                 <div className="flex gap-2">
//                   <Input
//                     id="policy_number"
//                     value={newPolicy.policy_number}
//                     onChange={(e) => setNewPolicy({...newPolicy, policy_number: e.target.value})}
//                     placeholder="POL20240001"
//                   />
//                   <Button type="button" variant="outline" onClick={() => setNewPolicy({...newPolicy, policy_number: generatePolicyNumber()})}>
//                     Generate
//                   </Button>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="policy_type">Policy Type</Label>
//                 <Select value={newPolicy.policy_type} onValueChange={(value) => setNewPolicy({...newPolicy, policy_type: value})}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="comprehensive">Comprehensive</SelectItem>
//                     <SelectItem value="third_party">Third Party</SelectItem>
//                     <SelectItem value="third_party_fire_theft">Third Party Fire & Theft</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="start_date">Start Date</Label>
//                 <Input
//                   id="start_date"
//                   type="date"
//                   value={newPolicy.start_date}
//                   onChange={(e) => setNewPolicy({...newPolicy, start_date: e.target.value})}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="end_date">End Date</Label>
//                 <Input
//                   id="end_date"
//                   type="date"
//                   value={newPolicy.end_date}
//                   onChange={(e) => setNewPolicy({...newPolicy, end_date: e.target.value})}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="premium_amount">Premium Amount (KES)</Label>
//                 <Input
//                   id="premium_amount"
//                   type="number"
//                   value={newPolicy.premium_amount}
//                   onChange={(e) => setNewPolicy({...newPolicy, premium_amount: parseFloat(e.target.value)})}
//                   placeholder="50000"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="sum_insured">Sum Insured (KES)</Label>
//                 <Input
//                   id="sum_insured"
//                   type="number"
//                   value={newPolicy.sum_insured}
//                   onChange={(e) => setNewPolicy({...newPolicy, sum_insured: parseFloat(e.target.value)})}
//                   placeholder="1500000"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="excess_amount">Excess Amount (KES)</Label>
//                 <Input
//                   id="excess_amount"
//                   type="number"
//                   value={newPolicy.excess_amount}
//                   onChange={(e) => setNewPolicy({...newPolicy, excess_amount: parseFloat(e.target.value)})}
//                   placeholder="10000"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="agent_commission">Agent Commission (%)</Label>
//                 <Input
//                   id="agent_commission"
//                   type="number"
//                   step="0.1"
//                   value={newPolicy.agent_commission}
//                   onChange={(e) => setNewPolicy({...newPolicy, agent_commission: parseFloat(e.target.value)})}
//                   placeholder="10.5"
//                 />
//               </div>
//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="notes">Notes</Label>
//                 <Textarea
//                   id="notes"
//                   value={newPolicy.notes}
//                   onChange={(e) => setNewPolicy({...newPolicy, notes: e.target.value})}
//                   placeholder="Additional policy notes..."
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddPolicy}>Create Policy</Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <Card key={index}>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                   <p className="text-2xl font-bold">{stat.value}</p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     <span className="text-emerald-600">{stat.trend}</span> {stat.description}
//                   </p>
//                 </div>
//                 <stat.icon className="h-8 w-8 text-muted-foreground" />
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Search and Filter */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input
//             placeholder="Search policies by number, client, or vehicle..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Button variant="outline">
//           <Filter className="h-4 w-4 mr-2" />
//           Filter
//         </Button>
//       </div>

//       {/* Policies Tabs */}
//       <Tabs defaultValue="all" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="all">All Policies ({policies.length})</TabsTrigger>
//           <TabsTrigger value="active">Active ({policies.filter(p => p.status === 'active').length})</TabsTrigger>
//           <TabsTrigger value="expiring">Expiring Soon ({getExpiringPolicies().length})</TabsTrigger>
//           <TabsTrigger value="expired">Expired ({policies.filter(p => p.status === 'expired').length})</TabsTrigger>
//         </TabsList>

//         <TabsContent value="all" className="space-y-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {filteredPolicies.map((policy) => (
//               <Card key={policy.id} className="hover:shadow-md transition-shadow">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <CardTitle className="text-lg">{policy.policy_number}</CardTitle>
//                       <CardDescription className="capitalize">{policy.policy_type.replace('_', ' ')}</CardDescription>
//                     </div>
//                     <div className="flex flex-col items-end gap-2">
//                       <Badge variant={policy.status === 'active' ? 'default' : policy.status === 'expired' ? 'destructive' : 'secondary'}>
//                         {policy.status}
//                       </Badge>
//                       {getExpiringPolicies().includes(policy) && (
//                         <Badge variant="outline" className="text-orange-600 border-orange-600">
//                           <AlertTriangle className="h-3 w-3 mr-1" />
//                           Expiring Soon
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Client:</span>
//                       <span>{policy.clients?.first_name} {policy.clients?.last_name}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Vehicle:</span>
//                       <span>{policy.vehicles?.make} {policy.vehicles?.model}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Registration:</span>
//                       <span>{policy.vehicles?.registration_number}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Premium:</span>
//                       <span>KES {Number(policy.premium_amount).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Sum Insured:</span>
//                       <span>KES {Number(policy.sum_insured).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Valid Until:</span>
//                       <span>{format(parseISO(policy.end_date), 'MMM dd, yyyy')}</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex justify-between pt-2">
//                     <Button variant="outline" size="sm">
//                       <FileText className="h-4 w-4 mr-2" />
//                       View Policy
//                     </Button>
//                     <div className="flex gap-2">
//                       <Button variant="outline" size="sm">
//                         <Calendar className="h-4 w-4 mr-2" />
//                         Renew
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         {/* Other tab contents would filter by status */}
//         <TabsContent value="expiring" className="space-y-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {getExpiringPolicies().map((policy) => (
//               <Card key={policy.id} className="hover:shadow-md transition-shadow border-orange-200">
//                 {/* Same card content as above */}
//               </Card>
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default PolicyManagement;

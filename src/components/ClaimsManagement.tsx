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
import { Plus, Search, Filter, AlertCircle, CheckCircle, Clock, X, FileText, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface Claim {
  id: string;
  policy_id: string;
  claim_number: string;
  incident_date: string;
  reported_date: string;
  claim_type: string;
  description: string;
  location_of_incident?: string;
  police_report_number?: string;
  status: string;
  claim_amount?: number;
  settled_amount?: number;
  settlement_date?: string;
  assessor_name?: string;
  assessor_contact?: string;
  garage_name?: string;
  garage_contact?: string;
  notes?: string;
  created_at: string;
  policies: {
    policy_number: string;
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
  };
}

const ClaimsManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const { toast } = useToast();

  // Form state for new claim
  const [newClaim, setNewClaim] = useState({
    policy_id: "",
    claim_number: "",
    incident_date: format(new Date(), 'yyyy-MM-dd'),
    claim_type: "accident",
    description: "",
    location_of_incident: "",
    police_report_number: "",
    claim_amount: 0,
    assessor_name: "",
    assessor_contact: "",
    garage_name: "",
    garage_contact: "",
    notes: "",
  });

  const [policies, setPolicies] = useState<Array<{
    id: string;
    policy_number: string;
    clients: { first_name: string; last_name: string };
    vehicles: { make: string; model: string; registration_number: string };
  }>>([]);

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          policies (
            policy_number,
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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch claims",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          id,
          policy_number,
          clients (
            first_name,
            last_name
          ),
          vehicles (
            make,
            model,
            registration_number
          )
        `)
        .eq('status', 'active')
        .order('policy_number');

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const generateClaimNumber = () => {
    const prefix = "CLM";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  };

  const handleAddClaim = async () => {
    try {
      const { error } = await supabase
        .from('claims')
        .insert([newClaim]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim filed successfully",
      });

      setIsAddDialogOpen(false);
      setNewClaim({
        policy_id: "",
        claim_number: "",
        incident_date: format(new Date(), 'yyyy-MM-dd'),
        claim_type: "accident",
        description: "",
        location_of_incident: "",
        police_report_number: "",
        claim_amount: 0,
        assessor_name: "",
        assessor_contact: "",
        garage_name: "",
        garage_contact: "",
        notes: "",
      });
      fetchClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to file claim",
        variant: "destructive",
      });
    }
  };

  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClaim = async () => {
    if (!editingClaim) return;

    try {
      const { error } = await supabase
        .from('claims')
        .update({
          policy_id: editingClaim.policy_id,
          claim_type: editingClaim.claim_type,
          description: editingClaim.description,
          location_of_incident: editingClaim.location_of_incident,
          police_report_number: editingClaim.police_report_number,
          status: editingClaim.status,
          claim_amount: editingClaim.claim_amount,
          settled_amount: editingClaim.settled_amount,
          settlement_date: editingClaim.settlement_date,
          assessor_name: editingClaim.assessor_name,
          assessor_contact: editingClaim.assessor_contact,
          garage_name: editingClaim.garage_name,
          garage_contact: editingClaim.garage_contact,
          notes: editingClaim.notes,
        })
        .eq('id', editingClaim.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingClaim(null);
      fetchClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update claim",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Are you sure you want to delete this claim?')) return;

    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', claimId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim deleted successfully",
      });

      fetchClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete claim",
        variant: "destructive",
      });
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string, settledAmount?: number) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'settled' && settledAmount) {
        updateData.settled_amount = settledAmount;
        updateData.settlement_date = format(new Date(), 'yyyy-MM-dd');
      }

      const { error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', claimId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim status updated successfully",
      });

      fetchClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update claim status",
        variant: "destructive",
      });
    }
  };

  const filteredClaims = claims.filter(claim =>
    claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policies?.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${claim.policies?.clients?.first_name} ${claim.policies?.clients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policies?.vehicles?.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'investigating': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'settled': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'closed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'investigating': return 'outline';
      case 'approved': return 'success';
      case 'settled': return 'success';
      case 'rejected': return 'destructive';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const stats = [
    {
      title: "Total Claims",
      value: claims.length.toString(),
      icon: AlertCircle,
      trend: "+4.2%",
      description: "vs last month"
    },
    {
      title: "Pending Claims",
      value: claims.filter(c => c.status === 'pending').length.toString(),
      icon: Clock,
      trend: "-2.1%",
      description: "awaiting review"
    },
    {
      title: "Settled Claims",
      value: claims.filter(c => c.status === 'settled').length.toString(),
      icon: CheckCircle,
      trend: "+8.5%",
      description: "completed"
    },
    {
      title: "Total Payouts",
      value: `KES ${Math.round(claims.filter(c => c.settled_amount).reduce((sum, c) => sum + Number(c.settled_amount), 0)).toLocaleString()}`,
      icon: FileText,
      trend: "+12.3%",
      description: "settled amount"
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Claims Management</h1>
          <p className="text-muted-foreground">Manage insurance claims and settlements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>File New Claim</DialogTitle>
              <DialogDescription>
                Enter the claim details to file a new insurance claim.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="policy">Policy</Label>
                <Select value={newClaim.policy_id} onValueChange={(value) => setNewClaim({...newClaim, policy_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.policy_number} - {policy.clients?.first_name} {policy.clients?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_number">Claim Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="claim_number"
                    value={newClaim.claim_number}
                    onChange={(e) => setNewClaim({...newClaim, claim_number: e.target.value})}
                    placeholder="CLM20240001"
                  />
                  <Button type="button" variant="outline" onClick={() => setNewClaim({...newClaim, claim_number: generateClaimNumber()})}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_date">Incident Date</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={newClaim.incident_date}
                  onChange={(e) => setNewClaim({...newClaim, incident_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_type">Claim Type</Label>
                <Select value={newClaim.claim_type} onValueChange={(value) => setNewClaim({...newClaim, claim_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location of Incident</Label>
                <Input
                  id="location"
                  value={newClaim.location_of_incident}
                  onChange={(e) => setNewClaim({...newClaim, location_of_incident: e.target.value})}
                  placeholder="Nairobi CBD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="police_report">Police Report Number</Label>
                <Input
                  id="police_report"
                  value={newClaim.police_report_number}
                  onChange={(e) => setNewClaim({...newClaim, police_report_number: e.target.value})}
                  placeholder="OB/123/2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claim_amount">Estimated Claim Amount (KES)</Label>
                <Input
                  id="claim_amount"
                  type="number"
                  value={newClaim.claim_amount}
                  onChange={(e) => setNewClaim({...newClaim, claim_amount: parseFloat(e.target.value)})}
                  placeholder="150000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessor_name">Assessor Name</Label>
                <Input
                  id="assessor_name"
                  value={newClaim.assessor_name}
                  onChange={(e) => setNewClaim({...newClaim, assessor_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessor_contact">Assessor Contact</Label>
                <Input
                  id="assessor_contact"
                  value={newClaim.assessor_contact}
                  onChange={(e) => setNewClaim({...newClaim, assessor_contact: e.target.value})}
                  placeholder="+254700000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="garage_name">Repair Garage</Label>
                <Input
                  id="garage_name"
                  value={newClaim.garage_name}
                  onChange={(e) => setNewClaim({...newClaim, garage_name: e.target.value})}
                  placeholder="ABC Motors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({...newClaim, description: e.target.value})}
                  placeholder="Detailed description of the incident..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newClaim.notes}
                  onChange={(e) => setNewClaim({...newClaim, notes: e.target.value})}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClaim}>File Claim</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Claim Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Claim</DialogTitle>
              <DialogDescription>
                Update the claim details.
              </DialogDescription>
            </DialogHeader>
            {editingClaim && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-policy">Policy</Label>
                  <Select value={editingClaim.policy_id} onValueChange={(value) => setEditingClaim({...editingClaim, policy_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {policies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.policy_number} - {policy.clients.first_name} {policy.clients.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-claim_type">Claim Type</Label>
                  <Select value={editingClaim.claim_type} onValueChange={(value) => setEditingClaim({...editingClaim, claim_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-incident_date">Incident Date</Label>
                  <Input
                    id="edit-incident_date"
                    type="date"
                    value={editingClaim.incident_date}
                    onChange={(e) => setEditingClaim({...editingClaim, incident_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-claim_amount">Claim Amount (KES)</Label>
                  <Input
                    id="edit-claim_amount"
                    type="number"
                    value={editingClaim.claim_amount || 0}
                    onChange={(e) => setEditingClaim({...editingClaim, claim_amount: parseFloat(e.target.value)})}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location of Incident</Label>
                  <Input
                    id="edit-location"
                    value={editingClaim.location_of_incident || ''}
                    onChange={(e) => setEditingClaim({...editingClaim, location_of_incident: e.target.value})}
                    placeholder="Location where incident occurred"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingClaim.status} onValueChange={(value) => setEditingClaim({...editingClaim, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingClaim.description}
                    onChange={(e) => setEditingClaim({...editingClaim, description: e.target.value})}
                    placeholder="Describe what happened..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingClaim.notes || ''}
                    onChange={(e) => setEditingClaim({...editingClaim, notes: e.target.value})}
                    placeholder="Any additional information..."
                    rows={2}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClaim}>Update Claim</Button>
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
            placeholder="Search claims by number, policy, client, or vehicle..."
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

      {/* Claims Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({claims.filter(c => c.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="investigating">Investigating ({claims.filter(c => c.status === 'investigating').length})</TabsTrigger>
          <TabsTrigger value="settled">Settled ({claims.filter(c => c.status === 'settled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{claim.claim_number}</CardTitle>
                      <CardDescription className="capitalize">{claim.claim_type.replace('_', ' ')}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(claim.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(claim.status)}
                      {claim.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Policy:</span>
                      <span>{claim.policies?.policy_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{claim.policies?.clients?.first_name} {claim.policies?.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{claim.policies?.vehicles?.make} {claim.policies?.vehicles?.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Incident Date:</span>
                      <span>{format(parseISO(claim.incident_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {claim.claim_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Claim Amount:</span>
                        <span>KES {Number(claim.claim_amount).toLocaleString()}</span>
                      </div>
                    )}
                    {claim.settled_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Settled Amount:</span>
                        <span className="font-medium text-green-600">KES {Number(claim.settled_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {claim.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm line-clamp-2">{claim.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      {claim.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'investigating')}
                        >
                          Start Investigation
                        </Button>
                      )}
                      {claim.status === 'investigating' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                      {claim.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'settled', claim.claim_amount)}
                        >
                          Settle
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEditClaim(claim)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClaim(claim.id)}>
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
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.filter(c => c.status === 'pending').map((claim) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{claim.claim_number}</CardTitle>
                      <CardDescription className="capitalize">{claim.claim_type.replace('_', ' ')}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(claim.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(claim.status)}
                      {claim.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Policy:</span>
                      <span>{claim.policies?.policy_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{claim.policies?.clients?.first_name} {claim.policies?.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{claim.policies?.vehicles?.make} {claim.policies?.vehicles?.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Incident Date:</span>
                      <span>{format(parseISO(claim.incident_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {claim.claim_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Claim Amount:</span>
                        <span>KES {Number(claim.claim_amount).toLocaleString()}</span>
                      </div>
                    )}
                    {claim.settled_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Settled Amount:</span>
                        <span className="font-medium text-green-600">KES {Number(claim.settled_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {claim.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm line-clamp-2">{claim.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      {claim.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'investigating')}
                        >
                          Start Investigation
                        </Button>
                      )}
                      {claim.status === 'investigating' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                      {claim.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateClaimStatus(claim.id, 'settled', claim.claim_amount)}
                        >
                          Settle
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEditClaim(claim)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClaim(claim.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimsManagement;

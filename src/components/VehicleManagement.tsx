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
import { Plus, Search, Filter, Car, Settings, FileText, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  client_id: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  chassis_number?: string;
  engine_number?: string;
  vehicle_value: number;
  color?: string;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  seating_capacity?: number;
  engine_capacity?: string;
  status: string;
  created_at: string;
  clients: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  // Form state for new vehicle
  const [newVehicle, setNewVehicle] = useState({
    client_id: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registration_number: "",
    chassis_number: "",
    engine_number: "",
    vehicle_value: 0,
    color: "",
    fuel_type: "petrol",
    transmission: "manual",
    body_type: "",
    seating_capacity: 5,
    engine_capacity: "",
  });

  const [clients, setClients] = useState<Array<{id: string, first_name: string, last_name: string}>>([]);

  useEffect(() => {
    fetchVehicles();
    fetchClients();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          clients (
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
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

  const handleAddVehicle = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([newVehicle]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      setIsAddDialogOpen(false);
      setNewVehicle({
        client_id: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        registration_number: "",
        chassis_number: "",
        engine_number: "",
        vehicle_value: 0,
        color: "",
        fuel_type: "petrol",
        transmission: "manual",
        body_type: "",
        seating_capacity: 5,
        engine_capacity: "",
      });
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          client_id: editingVehicle.client_id,
          make: editingVehicle.make,
          model: editingVehicle.model,
          year: editingVehicle.year,
          registration_number: editingVehicle.registration_number,
          chassis_number: editingVehicle.chassis_number,
          engine_number: editingVehicle.engine_number,
          vehicle_value: editingVehicle.vehicle_value,
          color: editingVehicle.color,
          fuel_type: editingVehicle.fuel_type,
          transmission: editingVehicle.transmission,
          body_type: editingVehicle.body_type,
          seating_capacity: editingVehicle.seating_capacity,
          engine_capacity: editingVehicle.engine_capacity,
          status: editingVehicle.status,
        })
        .eq('id', editingVehicle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${vehicle.clients?.first_name} ${vehicle.clients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total Vehicles",
      value: vehicles.length.toString(),
      icon: Car,
      trend: "+2.5%",
      description: "vs last month"
    },
    {
      title: "Active Vehicles",
      value: vehicles.filter(v => v.status === 'active').length.toString(),
      icon: Car,
      trend: "+1.2%",
      description: "currently insured"
    },
    {
      title: "Avg Vehicle Value",
      value: `KES ${Math.round(vehicles.reduce((sum, v) => sum + Number(v.vehicle_value), 0) / vehicles.length || 0).toLocaleString()}`,
      icon: Car,
      trend: "+5.1%",
      description: "portfolio value"
    },
    {
      title: "Written Off",
      value: vehicles.filter(v => v.status === 'written_off').length.toString(),
      icon: Car,
      trend: "-0.5%",
      description: "total losses"
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage client vehicles and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the vehicle details to add a new vehicle to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={newVehicle.client_id} onValueChange={(value) => setNewVehicle({...newVehicle, client_id: value})}>
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
                <Label htmlFor="registration">Registration Number</Label>
                <Input
                  id="registration"
                  value={newVehicle.registration_number}
                  onChange={(e) => setNewVehicle({...newVehicle, registration_number: e.target.value})}
                  placeholder="KXX 123A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                  placeholder="Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  placeholder="Camry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                  min="1950"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Vehicle Value (KES)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newVehicle.vehicle_value}
                  onChange={(e) => setNewVehicle({...newVehicle, vehicle_value: parseFloat(e.target.value)})}
                  placeholder="1500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                  placeholder="White"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select value={newVehicle.fuel_type} onValueChange={(value) => setNewVehicle({...newVehicle, fuel_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select value={newVehicle.transmission} onValueChange={(value) => setNewVehicle({...newVehicle, transmission: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seating">Seating Capacity</Label>
                <Input
                  id="seating"
                  type="number"
                  value={newVehicle.seating_capacity}
                  onChange={(e) => setNewVehicle({...newVehicle, seating_capacity: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="chassis">Chassis Number</Label>
                <Input
                  id="chassis"
                  value={newVehicle.chassis_number}
                  onChange={(e) => setNewVehicle({...newVehicle, chassis_number: e.target.value})}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVehicle}>Add Vehicle</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>
                Update the vehicle details.
              </DialogDescription>
            </DialogHeader>
            {editingVehicle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client</Label>
                  <Select value={editingVehicle.client_id} onValueChange={(value) => setEditingVehicle({...editingVehicle, client_id: value})}>
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
                  <Label htmlFor="edit-registration">Registration Number</Label>
                  <Input
                    id="edit-registration"
                    value={editingVehicle.registration_number}
                    onChange={(e) => setEditingVehicle({...editingVehicle, registration_number: e.target.value})}
                    placeholder="KXX 123A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make</Label>
                  <Input
                    id="edit-make"
                    value={editingVehicle.make}
                    onChange={(e) => setEditingVehicle({...editingVehicle, make: e.target.value})}
                    placeholder="Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input
                    id="edit-model"
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                    placeholder="Camry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    value={editingVehicle.year}
                    onChange={(e) => setEditingVehicle({...editingVehicle, year: parseInt(e.target.value)})}
                    min="1950"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Vehicle Value (KES)</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    value={editingVehicle.vehicle_value}
                    onChange={(e) => setEditingVehicle({...editingVehicle, vehicle_value: parseFloat(e.target.value)})}
                    placeholder="1500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input
                    id="edit-color"
                    value={editingVehicle.color || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, color: e.target.value})}
                    placeholder="White"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fuel_type">Fuel Type</Label>
                  <Select value={editingVehicle.fuel_type || 'petrol'} onValueChange={(value) => setEditingVehicle({...editingVehicle, fuel_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingVehicle.status} onValueChange={(value) => setEditingVehicle({...editingVehicle, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="written_off">Written Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-seating">Seating Capacity</Label>
                  <Input
                    id="edit-seating"
                    type="number"
                    value={editingVehicle.seating_capacity || 5}
                    onChange={(e) => setEditingVehicle({...editingVehicle, seating_capacity: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVehicle}>Update Vehicle</Button>
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
            placeholder="Search vehicles by make, model, registration, or owner..."
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

      {/* Vehicles Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Vehicles ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({vehicles.filter(v => v.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({vehicles.filter(v => v.status === 'inactive').length})</TabsTrigger>
          <TabsTrigger value="written_off">Written Off ({vehicles.filter(v => v.status === 'written_off').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                      <CardDescription>{vehicle.year} • {vehicle.registration_number}</CardDescription>
                    </div>
                    <Badge variant={vehicle.status === 'active' ? 'default' : vehicle.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {vehicle.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{vehicle.clients?.first_name} {vehicle.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Value:</span>
                      <span>KES {Number(vehicle.vehicle_value).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fuel Type:</span>
                      <span className="capitalize">{vehicle.fuel_type}</span>
                    </div>
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Color:</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
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
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.filter(v => v.status === 'active').map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                      <CardDescription>{vehicle.year} • {vehicle.registration_number}</CardDescription>
                    </div>
                    <Badge variant={vehicle.status === 'active' ? 'default' : vehicle.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {vehicle.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{vehicle.clients?.first_name} {vehicle.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Value:</span>
                      <span>KES {Number(vehicle.vehicle_value).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fuel Type:</span>
                      <span className="capitalize">{vehicle.fuel_type}</span>
                    </div>
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Color:</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
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

export default VehicleManagement;

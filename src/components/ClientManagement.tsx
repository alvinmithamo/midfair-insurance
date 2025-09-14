import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  FileText, 
  Eye,
  Edit,
  MoreVertical,
  Filter
} from "lucide-react";

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const clients = [
    {
      id: "CL-001",
      name: "John Muturi Kimani",
      phone: "+254 712 345 678",
      email: "john.muturi@email.com",
      idNumber: "12345678",
      location: "Nairobi, Westlands",
      vehicles: 2,
      policies: 2,
      totalPremium: "KSh 67,500",
      status: "Active",
      joinDate: "2023-01-15",
      lastContact: "2 days ago"
    },
    {
      id: "CL-002", 
      name: "Mary Wanjiku Njeri",
      phone: "+254 723 456 789",
      email: "mary.wanjiku@email.com",
      idNumber: "87654321",
      location: "Kiambu, Thika Road",
      vehicles: 1,
      policies: 1,
      totalPremium: "KSh 45,000",
      status: "Active",
      joinDate: "2023-03-22",
      lastContact: "1 week ago"
    },
    {
      id: "CL-003",
      name: "Peter Kimani Mwangi",
      phone: "+254 734 567 890",
      email: "peter.kimani@email.com",
      idNumber: "11223344",
      location: "Nakuru, Milimani",
      vehicles: 3,
      policies: 3,
      totalPremium: "KSh 125,000",
      status: "Renewal Due",
      joinDate: "2022-11-10",
      lastContact: "3 days ago"
    },
    {
      id: "CL-004",
      name: "Grace Njeri Kamau",
      phone: "+254 745 678 901",
      email: "grace.njeri@email.com",
      idNumber: "55667788",
      location: "Mombasa, Nyali",
      vehicles: 1,
      policies: 1,
      totalPremium: "KSh 38,000",
      status: "Inactive",
      joinDate: "2023-07-08",
      lastContact: "2 months ago"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Clients", value: "1,523", change: "+8%", color: "text-primary" },
    { label: "Active Policies", value: "2,847", change: "+12%", color: "text-success" },
    { label: "Due Renewals", value: "47", change: "-5%", color: "text-warning" },
    { label: "Premium Revenue", value: "KSh 12.5M", change: "+18%", color: "text-secondary" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Manage your insurance clients and their policies</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <p className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="due">Renewals Due</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Client Info */}
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {client.idNumber}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{client.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{client.vehicles} Vehicle{client.vehicles > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right space-y-1">
                        <div className="font-semibold">{client.totalPremium}</div>
                        <Badge
                          variant={
                            client.status === 'Active' ? 'default' :
                            client.status === 'Renewal Due' ? 'destructive' :
                            'secondary'
                          }
                          className={
                            client.status === 'Active' ? 'bg-success text-success-foreground' :
                            client.status === 'Renewal Due' ? 'bg-warning text-warning-foreground' :
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {client.status}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span>Joined: {client.joinDate}</span>
                    <span>Last Contact: {client.lastContact}</span>
                    <span>{client.policies} Active Policies</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tab contents would be similar with filtered data */}
        <TabsContent value="active">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Active clients view - filtered list would show here</p>
          </div>
        </TabsContent>

        <TabsContent value="due">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Clients with renewals due - filtered list would show here</p>
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Inactive clients - filtered list would show here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManagement;

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Car, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Phone, 
  Plus,
  Eye,
  Edit,
  CreditCard,
  Clock,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isBefore, parseISO, isAfter } from "date-fns";

interface DashboardData {
  totalClients: number;
  totalVehicles: number;
  activePolicies: number;
  pendingClaims: number;
  totalRevenue: number;
  recentClaims: Array<{
    id: string;
    claim_number: string;
    claim_type: string;
    status: string;
    claim_amount: number;
    incident_date: string;
    policies: {
      policy_number: string;
      clients: {
        first_name: string;
        last_name: string;
      };
      vehicles: {
        make: string;
        model: string;
        registration_number: string;
      };
    };
  }>;
  expiringPolicies: Array<{
    id: string;
    policy_number: string;
    end_date: string;
    premium_amount: number;
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
  }>;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data in parallel
      const [clientsRes, vehiclesRes, policiesRes, claimsRes, paymentsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('policies').select(`
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
        `),
        supabase.from('claims').select(`
          *,
          policies (
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
          )
        `).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('status', 'completed')
      ]);

      if (clientsRes.error || vehiclesRes.error || policiesRes.error || claimsRes.error || paymentsRes.error) {
        throw new Error('Failed to fetch dashboard data');
      }

      const clients = clientsRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const policies = policiesRes.data || [];
      const claims = claimsRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate statistics
      const activePolicies = policies.filter(p => p.status === 'active').length;
      const pendingClaims = claims.filter(c => c.status === 'pending').length;
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Get recent claims (last 5)
      const recentClaims = claims.slice(0, 5);

      // Calculate expiring policies (next 30 days)
      const thirtyDaysFromNow = addDays(new Date(), 30);
      const expiringPolicies = policies.filter(policy => {
        if (policy.status !== 'active') return false;
        const endDate = parseISO(policy.end_date);
        return isBefore(endDate, thirtyDaysFromNow) && isAfter(endDate, new Date());
      }).slice(0, 5);

      const dashboardData: DashboardData = {
        totalClients: clients.length,
        totalVehicles: vehicles.length,
        activePolicies,
        pendingClaims,
        totalRevenue,
        recentClaims,
        expiringPolicies
      };

      setDashboardData(dashboardData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statistics = [
    {
      title: "Active Policies",
      value: dashboardData.activePolicies.toString(),
      icon: FileText,
      trend: "+8.2%",
      description: "vs last month",
      color: "text-blue-600"
    },
    {
      title: "Total Clients",
      value: dashboardData.totalClients.toString(),
      icon: Users,
      trend: "+12.5%",
      description: "registered clients",
      color: "text-green-600"
    },
    {
      title: "Vehicles Insured",
      value: dashboardData.totalVehicles.toString(),
      icon: Car,
      trend: "+5.3%",
      description: "under coverage",
      color: "text-purple-600"
    },
    {
      title: "Pending Claims",
      value: dashboardData.pendingClaims.toString(),
      icon: AlertTriangle,
      trend: "-2.1%",
      description: "awaiting review",
      color: "text-orange-600"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'settled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimTypeColor = (type: string) => {
    switch (type) {
      case 'accident': return 'bg-red-100 text-red-800';
      case 'theft': return 'bg-purple-100 text-purple-800';
      case 'fire': return 'bg-orange-100 text-orange-800';
      case 'vandalism': return 'bg-yellow-100 text-yellow-800';
      case 'natural_disaster': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">InsuranceMax Dashboard</h1>
              <p className="text-blue-100">Comprehensive Vehicle Insurance Management System</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="flex items-center gap-2 text-blue-100">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Emergency: +254 700 000 000</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">24/7 Claims Support Available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statistics.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Claims
              </CardTitle>
              <CardDescription>Latest insurance claims requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentClaims.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent claims</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{claim.claim_number}</span>
                          <Badge className={getClaimTypeColor(claim.claim_type)}>
                            {claim.claim_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {claim.policies?.clients?.first_name} {claim.policies?.clients?.last_name} - 
                          {claim.policies?.vehicles?.make} {claim.policies?.vehicles?.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(claim.incident_date), 'MMM dd, yyyy')} • 
                          KES {claim.claim_amount.toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Expiring Policies
              </CardTitle>
              <CardDescription>Policies expiring in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.expiringPolicies.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No policies expiring soon</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.expiringPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{policy.policy_number}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Expires {format(new Date(policy.end_date), 'MMM dd')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {policy.clients?.first_name} {policy.clients?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {policy.vehicles?.make} {policy.vehicles?.model} ({policy.vehicles?.registration_number}) • 
                          KES {policy.premium_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{policy.clients?.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Revenue Summary
            </CardTitle>
            <CardDescription>Total revenue from completed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  KES {dashboardData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total revenue from payments</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+15.2% this month</span>  
                </div>  
                <p className="text-xs text-gray-500">Compared to last month</p>  
              </div>  
            </div>  
          </CardContent>  
        </Card>  
  
        {/* Quick Actions */}  
        <Card>  
          <CardHeader>  
            <CardTitle>Quick Actions</CardTitle>  
            <CardDescription>Common tasks and shortcuts</CardDescription>  
          </CardHeader>  
          <CardContent>  
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  
              <Button className="h-20 flex flex-col items-center justify-center gap-2">  
                <Users className="h-6 w-6" />  
                <span className="text-sm">New Client</span>  
              </Button>  
              <Button variant="secondary" className="h-20 flex flex-col items-center justify-center gap-2">  
                <FileText className="h-6 w-6" />  
                <span className="text-sm">New Policy</span>  
              </Button>  
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">  
                <AlertTriangle className="h-6 w-6" />  
                <span className="text-sm">File Claim</span>  
              </Button>  
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">  
                <TrendingUp className="h-6 w-6" />  
                <span className="text-sm">View Reports</span>  
              </Button>  
            </div>  
          </CardContent>  
        </Card>  
      </div>  
    </div>  
  );  
};  
  
export default Dashboard;











// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Users, Car, FileText, AlertTriangle, TrendingUp, Clock, Phone, MapPin } from "lucide-react";

// const Dashboard = () => {
//   const stats = [
//     {
//       title: "Active Policies",
//       value: "2,847",
//       icon: FileText,
//       trend: "+12%",
//       description: "This month"
//     },
//     {
//       title: "Total Clients",
//       value: "1,523",
//       icon: Users,
//       trend: "+8%",
//       description: "Active clients"
//     },
//     {
//       title: "Vehicles Insured",
//       value: "3,245",
//       icon: Car,
//       trend: "+15%",
//       description: "All vehicles"
//     },
//     {
//       title: "Pending Claims",
//       value: "47",
//       icon: AlertTriangle,
//       trend: "-5%",
//       description: "Requires attention"
//     }
//   ];

//   const recentClaims = [
//     { id: "CLM-001", client: "John Muturi", vehicle: "KCA 123A", type: "Accident", status: "Processing", amount: "KSh 125,000" },
//     { id: "CLM-002", client: "Mary Wanjiku", vehicle: "KBZ 456B", type: "Theft", status: "Approved", amount: "KSh 850,000" },
//     { id: "CLM-003", client: "Peter Kimani", vehicle: "KCB 789C", type: "Vandalism", status: "Investigation", amount: "KSh 45,000" }
//   ];

//   const expiringPolicies = [
//     { client: "Grace Njeri", policy: "POL-2024-001", vehicle: "KCA 987Z", expires: "3 days", premium: "KSh 45,000" },
//     { client: "David Ochieng", policy: "POL-2024-002", vehicle: "KBX 654Y", expires: "5 days", premium: "KSh 32,000" },
//     { client: "Sarah Muthoni", policy: "POL-2024-003", vehicle: "KCZ 321X", expires: "7 days", premium: "KSh 67,000" }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="bg-gradient-hero shadow-elevated">
//         <div className="container mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-white">Insurance Management System</h1>
//               <p className="text-white/80 flex items-center gap-2 mt-1">
//                 <MapPin className="h-4 w-4" />
//                 Nairobi, Kenya
//               </p>
//             </div>
//             <div className="flex items-center gap-4">
//               <Button variant="secondary" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
//                 <Phone className="h-4 w-4 mr-2" />
//                 Emergency: +254 700 123 456
//               </Button>
//               <div className="text-white text-sm">
//                 <div className="font-medium">Agent: James Kiprotich</div>
//                 <div className="text-white/70">Online</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {stats.map((stat) => (
//             <Card key={stat.title} className="shadow-card bg-gradient-card border-0">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   {stat.title}
//                 </CardTitle>
//                 <stat.icon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stat.value}</div>
//                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                   <span className={stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}>
//                     {stat.trend}
//                   </span>
//                   <span>{stat.description}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Recent Claims */}
//           <Card className="shadow-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-warning" />
//                 Recent Claims
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {recentClaims.map((claim) => (
//                   <div key={claim.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
//                     <div>
//                       <div className="font-medium">{claim.client}</div>
//                       <div className="text-sm text-muted-foreground">{claim.vehicle} • {claim.type}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-medium">{claim.amount}</div>
//                       <Badge 
//                         variant={claim.status === 'Approved' ? 'default' : claim.status === 'Processing' ? 'secondary' : 'destructive'}
//                         className={
//                           claim.status === 'Approved' ? 'bg-success text-success-foreground' :
//                           claim.status === 'Processing' ? 'bg-warning text-warning-foreground' :
//                           'bg-destructive text-destructive-foreground'
//                         }
//                       >
//                         {claim.status}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <Button className="w-full mt-4" variant="outline">
//                 View All Claims
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Expiring Policies */}
//           <Card className="shadow-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Clock className="h-5 w-5 text-primary" />
//                 Expiring Policies
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {expiringPolicies.map((policy) => (
//                   <div key={policy.policy} className="flex items-center justify-between p-3 bg-muted rounded-lg">
//                     <div>
//                       <div className="font-medium">{policy.client}</div>
//                       <div className="text-sm text-muted-foreground">{policy.vehicle} • {policy.policy}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-medium">{policy.premium}</div>
//                       <Badge variant="destructive" className="bg-warning text-warning-foreground">
//                         {policy.expires}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <Button className="flex-1" variant="default">
//                   Send Reminders
//                 </Button>
//                 <Button className="flex-1" variant="outline">
//                   Process Renewals
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Quick Actions */}
//         <Card className="mt-8 shadow-elevated">
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <Button className="h-20 bg-primary hover:bg-primary-hover">
//                 <div className="text-center">
//                   <Users className="h-6 w-6 mx-auto mb-2" />
//                   <div>New Client</div>
//                 </div>
//               </Button>
//               <Button variant="secondary" className="h-20 bg-secondary hover:bg-secondary-hover">
//                 <div className="text-center">
//                   <FileText className="h-6 w-6 mx-auto mb-2" />
//                   <div>New Policy</div>
//                 </div>
//               </Button>
//               <Button variant="outline" className="h-20">
//                 <div className="text-center">
//                   <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
//                   <div>File Claim</div>
//                 </div>
//               </Button>
//               <Button variant="outline" className="h-20">
//                 <div className="text-center">
//                   <TrendingUp className="h-6 w-6 mx-auto mb-2" />
//                   <div>Reports</div>
//                 </div>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
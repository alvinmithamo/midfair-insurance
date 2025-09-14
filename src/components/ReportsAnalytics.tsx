import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { TrendingUp, Users, Car, FileText, CreditCard, AlertTriangle, Download, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface AnalyticsData {
  totalClients: number;
  totalVehicles: number;
  totalPolicies: number;
  totalClaims: number;
  totalPayments: number;
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number; policies: number }>;
  claimsByType: Array<{ type: string; count: number; value: number }>;
  policyTypes: Array<{ type: string; count: number; percentage: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  topClients: Array<{ name: string; policies: number; premium: number }>;
  expiringPolicies: number;
  pendingClaims: number;
}

const ReportsAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("12months");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [clientsRes, vehiclesRes, policiesRes, claimsRes, paymentsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('policies').select('*, clients(first_name, last_name)'),
        supabase.from('claims').select('*'),
        supabase.from('payments').select('*').eq('status', 'completed')
      ]);

      if (clientsRes.error || vehiclesRes.error || policiesRes.error || claimsRes.error || paymentsRes.error) {
        throw new Error('Failed to fetch data');
      }

      const clients = clientsRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const policies = policiesRes.data || [];
      const claims = claimsRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate monthly revenue for the past 12 months
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(monthStart);
        
        const monthPayments = payments.filter(p => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        });
        
        const monthPolicies = policies.filter(p => {
          const createdDate = new Date(p.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        });

        monthlyRevenue.push({
          month: format(monthStart, 'MMM yyyy'),
          revenue: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
          policies: monthPolicies.length
        });
      }

      // Claims by type
      const claimsByType = claims.reduce((acc, claim) => {
        const existing = acc.find(item => item.type === claim.claim_type);
        if (existing) {
          existing.count++;
          existing.value += Number(claim.settled_amount || claim.claim_amount || 0);
        } else {
          acc.push({
            type: claim.claim_type.replace('_', ' '),
            count: 1,
            value: Number(claim.settled_amount || claim.claim_amount || 0)
          });
        }
        return acc;
      }, [] as Array<{ type: string; count: number; value: number }>);

      // Policy types distribution
      const policyTypeCounts = policies.reduce((acc, policy) => {
        acc[policy.policy_type] = (acc[policy.policy_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const policyTypes = Object.entries(policyTypeCounts).map(([type, count]) => ({
        type: type.replace('_', ' '),
        count,
        percentage: Math.round((count / policies.length) * 100)
      }));

      // Payment methods
      const paymentMethodData = payments.reduce((acc, payment) => {
        const existing = acc.find(item => item.method === payment.payment_method);
        if (existing) {
          existing.count++;
          existing.amount += Number(payment.amount);
        } else {
          acc.push({
            method: payment.payment_method.replace('_', ' '),
            count: 1,
            amount: Number(payment.amount)
          });
        }
        return acc;
      }, [] as Array<{ method: string; count: number; amount: number }>);

      // Top clients by premium
      const clientPremiums = policies.reduce((acc, policy) => {
        const clientName = `${policy.clients?.first_name} ${policy.clients?.last_name}`;
        if (acc[clientName]) {
          acc[clientName].policies++;
          acc[clientName].premium += Number(policy.premium_amount);
        } else {
          acc[clientName] = {
            policies: 1,
            premium: Number(policy.premium_amount)
          };
        }
        return acc;
      }, {} as Record<string, { policies: number; premium: number }>);

      const topClients = Object.entries(clientPremiums)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.premium - a.premium)
        .slice(0, 10);

      // Expiring policies (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringPolicies = policies.filter(policy => {
        const endDate = new Date(policy.end_date);
        return policy.status === 'active' && endDate <= thirtyDaysFromNow && endDate > new Date();
      }).length;

      const pendingClaims = claims.filter(claim => claim.status === 'pending').length;

      const analytics: AnalyticsData = {
        totalClients: clients.length,
        totalVehicles: vehicles.length,
        totalPolicies: policies.length,
        totalClaims: claims.length,
        totalPayments: payments.length,
        totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        monthlyRevenue,
        claimsByType,
        policyTypes,
        paymentMethods: paymentMethodData,
        topClients,
        expiringPolicies,
        pendingClaims
      };

      setAnalyticsData(analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading || !analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: "Total Clients",
      value: analyticsData.totalClients.toString(),
      icon: Users,
      trend: "+12.5%",
      description: "active clients"
    },
    {
      title: "Active Policies",
      value: analyticsData.totalPolicies.toString(),
      icon: FileText,
      trend: "+8.2%",
      description: "insurance policies"
    },
    {
      title: "Total Revenue",
      value: `KES ${Math.round(analyticsData.totalRevenue).toLocaleString()}`,
      icon: CreditCard,
      trend: "+15.3%",
      description: "this year"
    },
    {
      title: "Pending Claims",
      value: analyticsData.pendingClaims.toString(),
      icon: AlertTriangle,
      trend: "-5.1%",
      description: "awaiting review"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and reporting</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="24months">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
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

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and policy creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number, name: string) => [
                      name === 'revenue' ? `KES ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'New Policies'
                    ]} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Bar dataKey="policies" fill="#3B82F6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) => `${method} (${Math.round((percentage || 0) * 100)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Premium</CardTitle>
                <CardDescription>Highest premium paying clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topClients.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.policies} policies</p>
                      </div>
                      <p className="font-semibold">KES {client.premium.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Types */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Types Distribution</CardTitle>
                <CardDescription>Breakdown by policy type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.policyTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Policy Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Statistics</CardTitle>
                <CardDescription>Key policy metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{analyticsData.totalPolicies}</p>
                    <p className="text-sm text-muted-foreground">Total Policies</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{analyticsData.expiringPolicies}</p>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {analyticsData.policyTypes.map((type, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="capitalize">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{type.count}</span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claims by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Claims by Type</CardTitle>
                <CardDescription>Distribution of claim types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.claimsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value: number, name: string) => [
                      name === 'value' ? `KES ${value.toLocaleString()}` : value,
                      name === 'value' ? 'Total Value' : 'Count'
                    ]} />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Claims Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Claims Summary</CardTitle>
                <CardDescription>Overview of claims data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{analyticsData.totalClaims}</p>
                    <p className="text-sm text-muted-foreground">Total Claims</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{analyticsData.pendingClaims}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {analyticsData.claimsByType.map((claim, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="capitalize">{claim.type}</span>
                      <div className="text-right">
                        <p className="font-medium">{claim.count} claims</p>
                        <p className="text-sm text-muted-foreground">KES {claim.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Growth */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Clients by Premium Value</CardTitle>
                <CardDescription>Clients generating highest premium revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topClients.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Premium']} />
                    <Bar dataKey="premium" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
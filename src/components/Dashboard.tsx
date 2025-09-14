import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Car, FileText, AlertTriangle, TrendingUp, Clock, Phone, MapPin } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Policies",
      value: "2,847",
      icon: FileText,
      trend: "+12%",
      description: "This month"
    },
    {
      title: "Total Clients",
      value: "1,523",
      icon: Users,
      trend: "+8%",
      description: "Active clients"
    },
    {
      title: "Vehicles Insured",
      value: "3,245",
      icon: Car,
      trend: "+15%",
      description: "All vehicles"
    },
    {
      title: "Pending Claims",
      value: "47",
      icon: AlertTriangle,
      trend: "-5%",
      description: "Requires attention"
    }
  ];

  const recentClaims = [
    { id: "CLM-001", client: "John Muturi", vehicle: "KCA 123A", type: "Accident", status: "Processing", amount: "KSh 125,000" },
    { id: "CLM-002", client: "Mary Wanjiku", vehicle: "KBZ 456B", type: "Theft", status: "Approved", amount: "KSh 850,000" },
    { id: "CLM-003", client: "Peter Kimani", vehicle: "KCB 789C", type: "Vandalism", status: "Investigation", amount: "KSh 45,000" }
  ];

  const expiringPolicies = [
    { client: "Grace Njeri", policy: "POL-2024-001", vehicle: "KCA 987Z", expires: "3 days", premium: "KSh 45,000" },
    { client: "David Ochieng", policy: "POL-2024-002", vehicle: "KBX 654Y", expires: "5 days", premium: "KSh 32,000" },
    { client: "Sarah Muthoni", policy: "POL-2024-003", vehicle: "KCZ 321X", expires: "7 days", premium: "KSh 67,000" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elevated">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Insurance Management System</h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                Nairobi, Kenya
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="h-4 w-4 mr-2" />
                Emergency: +254 700 123 456
              </Button>
              <div className="text-white text-sm">
                <div className="font-medium">Agent: James Kiprotich</div>
                <div className="text-white/70">Online</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card bg-gradient-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}>
                    {stat.trend}
                  </span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Claims */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Recent Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{claim.client}</div>
                      <div className="text-sm text-muted-foreground">{claim.vehicle} • {claim.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{claim.amount}</div>
                      <Badge 
                        variant={claim.status === 'Approved' ? 'default' : claim.status === 'Processing' ? 'secondary' : 'destructive'}
                        className={
                          claim.status === 'Approved' ? 'bg-success text-success-foreground' :
                          claim.status === 'Processing' ? 'bg-warning text-warning-foreground' :
                          'bg-destructive text-destructive-foreground'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Claims
              </Button>
            </CardContent>
          </Card>

          {/* Expiring Policies */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Expiring Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiringPolicies.map((policy) => (
                  <div key={policy.policy} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{policy.client}</div>
                      <div className="text-sm text-muted-foreground">{policy.vehicle} • {policy.policy}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{policy.premium}</div>
                      <Badge variant="destructive" className="bg-warning text-warning-foreground">
                        {policy.expires}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" variant="default">
                  Send Reminders
                </Button>
                <Button className="flex-1" variant="outline">
                  Process Renewals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 shadow-elevated">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 bg-primary hover:bg-primary-hover">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <div>New Client</div>
                </div>
              </Button>
              <Button variant="secondary" className="h-20 bg-secondary hover:bg-secondary-hover">
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div>New Policy</div>
                </div>
              </Button>
              <Button variant="outline" className="h-20">
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                  <div>File Claim</div>
                </div>
              </Button>
              <Button variant="outline" className="h-20">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <div>Reports</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
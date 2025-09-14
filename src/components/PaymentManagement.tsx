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
import { Plus, Search, Filter, CreditCard, CheckCircle, Clock, X, Smartphone, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface Payment {
  id: string;
  policy_id: string;
  client_id: string;
  amount: number;
  payment_method: string;
  payment_reference?: string;
  mpesa_transaction_id?: string;
  payment_date: string;
  due_date?: string;
  status: string;
  payment_type: string;
  description?: string;
  receipt_number?: string;
  created_at: string;
  clients: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  policies: {
    policy_number: string;
    vehicles: {
      make: string;
      model: string;
      registration_number: string;
    };
  };
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state for new payment
  const [newPayment, setNewPayment] = useState({
    client_id: "",
    policy_id: "",
    amount: 0,
    payment_method: "mpesa",
    payment_reference: "",
    mpesa_transaction_id: "",
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: "",
    payment_type: "premium",
    description: "",
    receipt_number: "",
  });

  const [clients, setClients] = useState<Array<{id: string, first_name: string, last_name: string}>>([]);
  const [policies, setPolicies] = useState<Array<{
    id: string;
    policy_number: string;
    client_id: string;
    vehicles: { make: string; model: string; registration_number: string };
  }>>([]);

  useEffect(() => {
    fetchPayments();
    fetchClients();
    fetchPolicies();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            first_name,
            last_name,
            phone
          ),
          policies (
            policy_number,
            vehicles (
              make,
              model,
              registration_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments",
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

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          id,
          policy_number,
          client_id,
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

  const generateReceiptNumber = () => {
    const prefix = "RCP";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  };

  const handleAddPayment = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert([newPayment]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setIsAddDialogOpen(false);
      setNewPayment({
        client_id: "",
        policy_id: "",
        amount: 0,
        payment_method: "mpesa",
        payment_reference: "",
        mpesa_transaction_id: "",
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: "",
        payment_type: "premium",
        description: "",
        receipt_number: "",
      });
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.policies?.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${payment.clients?.first_name} ${payment.clients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.mpesa_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      case 'reversed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'reversed': return 'destructive';
      default: return 'secondary';
    }
  };

  const clientPolicies = policies.filter(p => p.client_id === newPayment.client_id);

  const stats = [
    {
      title: "Total Payments",
      value: payments.length.toString(),
      icon: CreditCard,
      trend: "+12.5%",
      description: "vs last month"
    },
    {
      title: "Completed",
      value: payments.filter(p => p.status === 'completed').length.toString(),
      icon: CheckCircle,
      trend: "+8.1%",
      description: "successful payments"
    },
    {
      title: "Pending",
      value: payments.filter(p => p.status === 'pending').length.toString(),
      icon: Clock,
      trend: "-5.2%",
      description: "awaiting confirmation"
    },
    {
      title: "Total Revenue",
      value: `KES ${Math.round(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0)).toLocaleString()}`,
      icon: CreditCard,
      trend: "+18.7%",
      description: "collected amount"
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Track and manage client payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Enter the payment details to record a new payment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={newPayment.client_id} onValueChange={(value) => setNewPayment({...newPayment, client_id: value, policy_id: ""})}>
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
                <Label htmlFor="policy">Policy</Label>
                <Select value={newPayment.policy_id} onValueChange={(value) => setNewPayment({...newPayment, policy_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientPolicies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.policy_number} - {policy.vehicles?.make} {policy.vehicles?.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={newPayment.payment_method} onValueChange={(value) => setNewPayment({...newPayment, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({...newPayment, payment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                    <SelectItem value="claim_settlement">Claim Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
                />
              </div>
              {newPayment.payment_method === 'mpesa' && (
                <div className="space-y-2">
                  <Label htmlFor="mpesa_transaction_id">M-Pesa Transaction ID</Label>
                  <Input
                    id="mpesa_transaction_id"
                    value={newPayment.mpesa_transaction_id}
                    onChange={(e) => setNewPayment({...newPayment, mpesa_transaction_id: e.target.value})}
                    placeholder="QFX1234567"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="payment_reference">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  value={newPayment.payment_reference}
                  onChange={(e) => setNewPayment({...newPayment, payment_reference: e.target.value})}
                  placeholder="Reference number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="receipt_number"
                    value={newPayment.receipt_number}
                    onChange={(e) => setNewPayment({...newPayment, receipt_number: e.target.value})}
                    placeholder="RCP20240001"
                  />
                  <Button type="button" variant="outline" onClick={() => setNewPayment({...newPayment, receipt_number: generateReceiptNumber()})}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newPayment.due_date}
                  onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  placeholder="Payment description..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>Record Payment</Button>
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
            placeholder="Search payments by receipt, policy, client, or transaction ID..."
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

      {/* Payments Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({payments.filter(p => p.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({payments.filter(p => p.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({payments.filter(p => p.status === 'failed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                        {payment.receipt_number || `Payment #${payment.id.slice(0, 8)}`}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {payment.payment_type.replace('_', ' ')} • {payment.payment_method.replace('_', ' ')}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(payment.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{payment.clients?.first_name} {payment.clients?.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Policy:</span>
                      <span>{payment.policies?.policy_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{payment.policies?.vehicles?.make} {payment.policies?.vehicles?.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">KES {Number(payment.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{format(parseISO(payment.payment_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {payment.mpesa_transaction_id && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">M-Pesa ID:</span>
                        <span className="font-mono text-xs">{payment.mpesa_transaction_id}</span>
                      </div>
                    )}
                    {payment.payment_reference && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reference:</span>
                        <span className="font-mono text-xs">{payment.payment_reference}</span>
                      </div>
                    )}
                  </div>
                  
                  {payment.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm line-clamp-2">{payment.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, 'failed')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Mark Failed
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
        </TabsContent>

        {/* Other tab contents would filter by status */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPayments.filter(p => p.status === 'completed').map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;

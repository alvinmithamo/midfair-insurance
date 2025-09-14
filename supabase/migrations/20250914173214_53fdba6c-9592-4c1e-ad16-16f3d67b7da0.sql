-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  id_number TEXT UNIQUE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  chassis_number TEXT UNIQUE,
  engine_number TEXT,
  vehicle_value DECIMAL(12,2) NOT NULL,
  color TEXT,
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission TEXT CHECK (transmission IN ('manual', 'automatic')),
  body_type TEXT,
  seating_capacity INTEGER,
  engine_capacity TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'written_off')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policies table
CREATE TABLE public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('comprehensive', 'third_party', 'third_party_fire_theft')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium_amount DECIMAL(12,2) NOT NULL,
  excess_amount DECIMAL(12,2) DEFAULT 0,
  sum_insured DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  renewal_date DATE,
  agent_commission DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create claims table
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  claim_number TEXT UNIQUE NOT NULL,
  incident_date DATE NOT NULL,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('accident', 'theft', 'fire', 'vandalism', 'natural_disaster', 'other')),
  description TEXT NOT NULL,
  location_of_incident TEXT,
  police_report_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'approved', 'rejected', 'settled', 'closed')),
  claim_amount DECIMAL(12,2),
  settled_amount DECIMAL(12,2),
  settlement_date DATE,
  assessor_name TEXT,
  assessor_contact TEXT,
  garage_name TEXT,
  garage_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque', 'card')),
  payment_reference TEXT,
  mpesa_transaction_id TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('premium', 'renewal', 'installment', 'claim_settlement')),
  description TEXT,
  receipt_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  data_type TEXT NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view all clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Users can create clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Users can delete clients" ON public.clients FOR DELETE USING (true);

-- Create RLS policies for vehicles
CREATE POLICY "Users can view all vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Users can create vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update vehicles" ON public.vehicles FOR UPDATE USING (true);
CREATE POLICY "Users can delete vehicles" ON public.vehicles FOR DELETE USING (true);

-- Create RLS policies for policies
CREATE POLICY "Users can view all policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Users can create policies" ON public.policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update policies" ON public.policies FOR UPDATE USING (true);
CREATE POLICY "Users can delete policies" ON public.policies FOR DELETE USING (true);

-- Create RLS policies for claims
CREATE POLICY "Users can view all claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Users can create claims" ON public.claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update claims" ON public.claims FOR UPDATE USING (true);
CREATE POLICY "Users can delete claims" ON public.claims FOR DELETE USING (true);

-- Create RLS policies for payments
CREATE POLICY "Users can view all payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Users can delete payments" ON public.payments FOR DELETE USING (true);

-- Create RLS policies for system_settings
CREATE POLICY "Users can view public settings" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can view all settings" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage settings" ON public.system_settings FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_phone ON public.clients(phone);
CREATE INDEX idx_clients_id_number ON public.clients(id_number);
CREATE INDEX idx_vehicles_client_id ON public.vehicles(client_id);
CREATE INDEX idx_vehicles_registration ON public.vehicles(registration_number);
CREATE INDEX idx_policies_client_id ON public.policies(client_id);
CREATE INDEX idx_policies_vehicle_id ON public.policies(vehicle_id);
CREATE INDEX idx_policies_status ON public.policies(status);
CREATE INDEX idx_policies_end_date ON public.policies(end_date);
CREATE INDEX idx_claims_policy_id ON public.claims(policy_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_payments_policy_id ON public.payments(policy_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, category, data_type, is_public) VALUES
('company_name', 'Midfair Insurance Agency', 'Company name displayed across the system', 'company', 'string', true),
('company_email', 'info@midfairinsurance.co.ke', 'Primary company email address', 'company', 'string', true),
('company_phone', '+254700000000', 'Primary company phone number', 'company', 'string', true),
('company_address', 'Nairobi, Kenya', 'Company physical address', 'company', 'string', true),
('currency', 'KES', 'Default currency for the system', 'general', 'string', true),
('tax_rate', '16', 'VAT rate percentage', 'financial', 'number', false),
('mpesa_shortcode', '', 'M-Pesa paybill shortcode', 'payments', 'string', false),
('notification_email', 'true', 'Enable email notifications', 'notifications', 'boolean', false),
('notification_sms', 'true', 'Enable SMS notifications', 'notifications', 'boolean', false),
('policy_reminder_days', '30', 'Days before policy expiry to send reminders', 'policies', 'number', false);
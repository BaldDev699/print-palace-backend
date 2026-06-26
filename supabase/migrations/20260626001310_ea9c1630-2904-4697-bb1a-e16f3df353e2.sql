
-- ============ Shared helper ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ Profiles ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Roles ============
CREATE TYPE public.app_role AS ENUM ('customer', 'manufacturer', 'admin');
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ New user trigger ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Manufacturers ============
CREATE TABLE public.manufacturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  specialties TEXT[],
  minimum_order_quantity INTEGER DEFAULT 50,
  lead_time_days INTEGER DEFAULT 14,
  certifications TEXT[],
  website_url TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manufacturers TO authenticated;
GRANT SELECT ON public.manufacturers TO anon;
GRANT ALL ON public.manufacturers TO service_role;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view manufacturers" ON public.manufacturers FOR SELECT USING (true);
CREATE POLICY "Users can create their own manufacturer profile" ON public.manufacturers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own manufacturer profile" ON public.manufacturers FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Manufacturer portfolio ============
CREATE TABLE public.manufacturer_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manufacturer_portfolio TO authenticated;
GRANT SELECT ON public.manufacturer_portfolio TO anon;
GRANT ALL ON public.manufacturer_portfolio TO service_role;
ALTER TABLE public.manufacturer_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view portfolio items" ON public.manufacturer_portfolio FOR SELECT USING (true);
CREATE POLICY "Manufacturers can manage their own portfolio" ON public.manufacturer_portfolio FOR ALL
  USING (EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.id = manufacturer_portfolio.manufacturer_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.id = manufacturer_portfolio.manufacturer_id AND m.user_id = auth.uid()));
CREATE TRIGGER update_manufacturer_portfolio_updated_at BEFORE UPDATE ON public.manufacturer_portfolio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Orders ============
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  design_data JSONB NOT NULL,
  measurements JSONB NOT NULL,
  product_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'KSh',
  printing_method TEXT,
  base_price_cents INTEGER NOT NULL DEFAULT 0,
  printing_surcharge_cents INTEGER NOT NULL DEFAULT 0,
  quantity_discount_cents INTEGER NOT NULL DEFAULT 0,
  design_coverage_adjustment_cents INTEGER NOT NULL DEFAULT 0,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  pricing_breakdown JSONB,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  shipping_final_cents INTEGER NOT NULL DEFAULT 0,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Manufacturers can view assigned orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.user_id = auth.uid() AND m.id = orders.manufacturer_id));
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Manufacturers can update assigned orders" ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.user_id = auth.uid() AND m.id = orders.manufacturer_id));
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Order messages (realtime chat) ============
CREATE TABLE public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_messages TO authenticated;
GRANT ALL ON public.order_messages TO service_role;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view order messages" ON public.order_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_messages.order_id
    AND (o.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.user_id = auth.uid() AND m.id = o.manufacturer_id))));
CREATE POLICY "Participants can insert order messages" ON public.order_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_messages.order_id
    AND (o.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.user_id = auth.uid() AND m.id = o.manufacturer_id))));
ALTER TABLE public.order_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;

-- ============ Wallet ============
CREATE TYPE public.transaction_type AS ENUM ('earned', 'spent', 'withdrawn', 'bonus', 'referral');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE public.blockchain_network AS ENUM ('TRC20', 'ERC20', 'ETH', 'BTC');

CREATE TABLE public.roge_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  description TEXT,
  reference_id UUID,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.roge_transactions TO authenticated;
GRANT ALL ON public.roge_transactions TO service_role;
ALTER TABLE public.roge_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.roge_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.roge_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_roge_transactions_updated_at BEFORE UPDATE ON public.roge_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  network blockchain_network NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address, network)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_wallets TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallets" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own wallets" ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallets" ON public.user_wallets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  network blockchain_network NOT NULL,
  wallet_address TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  network_fee DECIMAL(20, 8),
  final_amount DECIMAL(20, 8),
  blockchain_tx_hash TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.withdrawal_requests TO authenticated;
GRANT ALL ON public.withdrawal_requests TO service_role;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawal requests" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Balance helpers ============
CREATE OR REPLACE FUNCTION public.get_user_roge_balance(user_uuid UUID)
RETURNS DECIMAL(20, 8) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(CASE
    WHEN transaction_type IN ('earned', 'bonus', 'referral') THEN amount
    WHEN transaction_type IN ('spent', 'withdrawn') THEN -amount
    ELSE 0 END), 0)
  FROM public.roge_transactions WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_pending_withdrawals(user_uuid UUID)
RETURNS DECIMAL(20, 8) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(amount), 0) FROM public.withdrawal_requests
  WHERE user_id = user_uuid AND status IN ('pending', 'processing');
$$;

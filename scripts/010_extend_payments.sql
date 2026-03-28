-- Extend payments table with gateway information
ALTER TABLE IF EXISTS public.payments
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'manual' CHECK (payment_gateway IN ('bkash', 'nagad', 'sslcommerz', 'stripe', 'manual')),
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS gateway_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create payment intents table for tracking payment attempts
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'processing', 'succeeded', 'failed')),
  payment_gateway TEXT NOT NULL,
  gateway_order_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on payment_intents
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_intents
CREATE POLICY "payment_intents_select" ON public.payment_intents FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "payment_intents_insert" ON public.payment_intents FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "payment_intents_update" ON public.payment_intents FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON public.payments(payment_gateway);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_school ON public.payment_intents(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_student_fee ON public.payment_intents(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);

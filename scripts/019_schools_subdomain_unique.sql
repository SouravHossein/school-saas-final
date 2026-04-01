-- Add unique constraint on subdomain if it doesn't exist
ALTER TABLE public.schools ADD CONSTRAINT schools_subdomain_unique UNIQUE (subdomain);

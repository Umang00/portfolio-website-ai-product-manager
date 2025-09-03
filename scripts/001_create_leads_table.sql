-- Create leads table for contact form submissions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  website_social text,
  subject text,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for security
alter table public.leads enable row level security;

-- Allow anyone to insert leads (contact form submissions)
create policy "leads_insert_public"
  on public.leads for insert
  with check (true);

-- Only allow authenticated users to view leads (for admin purposes)
create policy "leads_select_authenticated"
  on public.leads for select
  using (auth.role() = 'authenticated');

-- Adunare: schema inițială (multi-biserică, cu Row Level Security)
create extension if not exists "pgcrypto";

-- Biserici și membri ---------------------------------------------------------
create table churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type member_role as enum ('admin', 'lider', 'organizator', 'voluntar');

create table memberships (
  church_id uuid not null references churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'voluntar',
  display_name text,
  primary key (church_id, user_id)
);

-- Funcții ajutătoare pentru politici
create or replace function is_member(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where church_id = c and user_id = auth.uid());
$$;

create or replace function is_leader(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where church_id = c and user_id = auth.uid()
                 and role in ('admin', 'lider', 'organizator'));
$$;

create or replace function is_admin(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where church_id = c and user_id = auth.uid() and role = 'admin');
$$;

-- Oameni ---------------------------------------------------------------------
create table people (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  full_name text not null,
  group_name text,               -- Adolescenți, Tineri, Lideri
  birth_date date,
  phone text,
  created_at timestamptz not null default now()
);

-- Notițele despre tineri stau separat, ca să le vadă doar liderii
create table person_notes (
  person_id uuid primary key references people(id) on delete cascade,
  church_id uuid not null references churches(id) on delete cascade,
  note text not null default ''
);

create table volunteers (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  skills text[] not null default '{}',
  availability boolean[] not null default '{f,f,f,f,f,f,f}' check (cardinality(availability) = 7)
);

-- Programe -------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  starts_at timestamptz not null,
  location text,
  capacity int,
  price_lei numeric(10,2),
  organizer_id uuid references people(id) on delete set null,
  created_at timestamptz not null default now()
);

create table event_signups (
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (event_id, person_id)
);

create type run_kind as enum ('lauda', 'cuvant', 'grupe', 'altele');

create table run_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  position int not null,
  minutes int not null check (minutes > 0),
  title text not null,
  kind run_kind not null default 'altele',
  responsible_id uuid references people(id) on delete set null
);

create table event_checklist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  position int not null default 0
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  text text not null,
  due_date date,
  owner_id uuid references people(id) on delete set null,
  done boolean not null default false
);

-- Laudă ----------------------------------------------------------------------
create table songs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  author text,
  song_key text,
  bpm int,
  playlist_url text
);

create table setlists (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  rehearsal_at timestamptz,
  rehearsal_place text
);

create table setlist_songs (
  setlist_id uuid not null references setlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position int not null,
  primary key (setlist_id, song_id)
);

-- Slujire --------------------------------------------------------------------
create table serving_teams (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null
);

create type slot_status as enum ('asteapta', 'confirmat', 'refuzat');

create table serving_slots (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references serving_teams(id) on delete cascade,
  service_date date not null,
  role text not null,
  person_id uuid references people(id) on delete set null,
  status slot_status not null default 'asteapta'
);

-- Mesaje ---------------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  audience text not null,
  body text not null,
  push boolean not null default true,
  email boolean not null default false,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now()
);

create table message_reads (
  message_id uuid not null references messages(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, person_id)
);

-- Row Level Security ---------------------------------------------------------
alter table churches enable row level security;
alter table memberships enable row level security;
create policy "membrii își văd biserica" on churches for select using (is_member(id));
create policy "membrii văd colegii" on memberships for select using (is_member(church_id));
create policy "adminii gestionează membrii" on memberships for all
  using (is_admin(church_id)) with check (is_admin(church_id));

-- Tabele cu church_id direct: membrii citesc, liderii scriu
do $$
declare t text;
begin
  foreach t in array array['people','volunteers','events','tasks','songs','setlists','serving_teams','messages'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "citire membri" on %I for select using (is_member(church_id))', t);
    execute format('create policy "scriere lideri" on %I for all using (is_leader(church_id)) with check (is_leader(church_id))', t);
  end loop;
end $$;

alter table person_notes enable row level security;
create policy "doar liderii" on person_notes for all using (is_leader(church_id)) with check (is_leader(church_id));

-- Tabele legate prin eveniment
do $$
declare t text;
begin
  foreach t in array array['event_signups','run_items','event_checklist'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "citire membri" on %I for select using (is_member((select church_id from events e where e.id = event_id)))', t);
    execute format('create policy "scriere lideri" on %I for all using (is_leader((select church_id from events e where e.id = event_id))) with check (is_leader((select church_id from events e where e.id = event_id)))', t);
  end loop;
end $$;

alter table setlist_songs enable row level security;
create policy "citire membri" on setlist_songs for select using (is_member((select church_id from setlists s where s.id = setlist_id)));
create policy "scriere lideri" on setlist_songs for all using (is_leader((select church_id from setlists s where s.id = setlist_id))) with check (is_leader((select church_id from setlists s where s.id = setlist_id)));

alter table serving_slots enable row level security;
create policy "citire membri" on serving_slots for select using (is_member((select church_id from serving_teams t where t.id = team_id)));
create policy "scriere lideri" on serving_slots for all using (is_leader((select church_id from serving_teams t where t.id = team_id))) with check (is_leader((select church_id from serving_teams t where t.id = team_id)));

alter table message_reads enable row level security;
create policy "citire membri" on message_reads for select using (is_member((select church_id from messages m where m.id = message_id)));
create policy "marchez citit" on message_reads for insert with check (is_member((select church_id from messages m where m.id = message_id)));

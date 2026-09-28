-- =====================================================================
-- Pelada App — schema.sql (Supabase / PostgreSQL)
-- Rode no SQL Editor do Supabase em um projeto novo.
-- =====================================================================

-- ---------- Tabelas ---------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nickname text not null,
  position text not null check (position in ('GOL','DEF','MEI','ATA')),
  avatar_url text,
  is_super_admin boolean not null default false,
  created_at timestamptz default timezone('utc', now())
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  schedule_info text,
  created_by uuid references profiles(id) default auth.uid(),
  created_at timestamptz default timezone('utc', now())
);

create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  -- ACRÉSCIMO ao PRD: "solicitar entrada" + "aprovar membros" precisam de um estado pendente
  status text not null default 'active' check (status in ('pending','active')),
  joined_at timestamptz default timezone('utc', now()),
  unique (group_id, user_id)
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references profiles(id) default auth.uid(),
  rated_id uuid not null references profiles(id),
  attack int not null check (attack between 0 and 10),
  defense int not null check (defense between 0 and 10),
  physical int not null check (physical between 0 and 10),
  created_at timestamptz default timezone('utc', now()),
  check (rater_id <> rated_id)
);

create index on group_members (user_id);
create index on group_members (group_id) where status = 'active';
create index on ratings (rated_id);

-- ---------- Funções auxiliares (SECURITY DEFINER evita recursão de RLS) --
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_super_admin from profiles where id = auth.uid()), false);
$$;

create or replace function public.is_group_member(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members
    where group_id = gid and user_id = auth.uid() and status = 'active');
$$;

create or replace function public.is_group_admin(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members
    where group_id = gid and user_id = auth.uid() and status = 'active'
      and role in ('owner','admin'));
$$;

create or replace function public.is_group_owner(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members
    where group_id = gid and user_id = auth.uid() and status = 'active' and role = 'owner');
$$;

create or replace function public.shares_group_with(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members a
    join group_members b on b.group_id = a.group_id
    where a.user_id = auth.uid() and b.user_id = other
      and a.status = 'active' and b.status = 'active');
$$;

-- ---------- Triggers --------------------------------------------------
-- Cria o perfil no cadastro (dados vêm de options.data no signUp)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, nickname, position)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'nickname',  split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'position', ''), 'MEI')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Criador do grupo vira owner
create or replace function public.add_group_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into group_members (group_id, user_id, role, status)
  values (new.id, new.created_by, 'owner', 'active');
  return new;
end $$;

create trigger on_group_created
  after insert on groups for each row execute function public.add_group_owner();

-- ---------- RLS -------------------------------------------------------
alter table profiles      enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;
alter table ratings       enable row level security;

-- profiles: dados públicos para usuários logados (necessário para busca)
create policy profiles_select on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid() or is_super_admin()) with check (id = auth.uid() or is_super_admin());
create policy profiles_delete on profiles for delete to authenticated using (is_super_admin());

-- Impede auto-promoção a super admin: só estas colunas são editáveis pelo cliente
revoke update on profiles from authenticated;
grant update (full_name, nickname, position, avatar_url) on profiles to authenticated;

-- groups
create policy groups_select on groups for select to authenticated using (true);
create policy groups_insert on groups for insert to authenticated with check (created_by = auth.uid());
create policy groups_update on groups for update to authenticated
  using (is_group_admin(id) or is_super_admin());
create policy groups_delete on groups for delete to authenticated
  using (created_by = auth.uid() or is_super_admin());

-- group_members
create policy gm_select on group_members for select to authenticated
  using (user_id = auth.uid() or is_group_member(group_id) or is_super_admin());

create policy gm_request_join on group_members for insert to authenticated
  with check (user_id = auth.uid() and role = 'member' and status = 'pending');

create policy gm_admin_add on group_members for insert to authenticated
  with check ((is_group_admin(group_id) and role <> 'owner') or is_super_admin());

-- aprovar pendentes / promover: admins mexem em não-owners; só o owner cria admins
create policy gm_update on group_members for update to authenticated
  using ((is_group_admin(group_id) and role <> 'owner') or is_super_admin())
  with check (
    is_super_admin()
    or (role <> 'owner' and (role = 'member' or is_group_owner(group_id)))
  );

create policy gm_delete on group_members for delete to authenticated
  using (
    is_super_admin()
    or (user_id = auth.uid() and role <> 'owner')          -- sair / cancelar pedido
    or (is_group_admin(group_id) and role = 'member')       -- admin remove membro
    or (is_group_owner(group_id) and role <> 'owner')       -- owner remove admin/membro
  );

-- ratings: imutáveis (sem policy de UPDATE); só o autor lê os próprios registros
create policy ratings_insert on ratings for insert to authenticated
  with check (rater_id = auth.uid() and rated_id <> auth.uid() and shares_group_with(rated_id));
create policy ratings_select on ratings for select to authenticated
  using (rater_id = auth.uid() or is_super_admin());
create policy ratings_delete on ratings for delete to authenticated using (is_super_admin());

-- ---------- View player_stats ------------------------------------------
-- Roda com privilégios do dono (ignora RLS de ratings) para expor SÓ agregados,
-- filtrando por: o próprio usuário, quem divide grupo com ele, ou super admin.
-- Sem avaliações => nota base 5.0 nos 3 quesitos => rating_real = 50.
create or replace view public.player_stats
with (security_invoker = false) as
with agg as (
  select rated_id,
         avg(attack)::numeric   as a,
         avg(defense)::numeric  as d,
         avg(physical)::numeric as f,
         count(*)               as n
  from ratings group by rated_id
),
base as (
  select p.id, p.full_name, p.nickname, p.position, p.avatar_url,
         coalesce(agg.a, 5) as avg_attack,
         coalesce(agg.d, 5) as avg_defense,
         coalesce(agg.f, 5) as avg_physical,
         coalesce(agg.n, 0) as ratings_count,
         case p.position when 'GOL' then 0.05 when 'DEF' then 0.20 when 'MEI' then 0.40 else 0.50 end as w_ata,
         case p.position when 'GOL' then 0.85 when 'DEF' then 0.50 when 'MEI' then 0.40 else 0.20 end as w_def,
         case p.position when 'GOL' then 0.10 when 'DEF' then 0.30 when 'MEI' then 0.20 else 0.30 end as w_fis
  from profiles p
  left join agg on agg.rated_id = p.id
  where p.id = auth.uid() or public.shares_group_with(p.id) or public.is_super_admin()
),
calc as (
  select *, (avg_attack * w_ata + avg_defense * w_def + avg_physical * w_fis) * 10 as rating_real
  from base
)
select id, full_name, nickname, position, avatar_url,
       round(avg_attack, 2)   as avg_attack,
       round(avg_defense, 2)  as avg_defense,
       round(avg_physical, 2) as avg_physical,
       ratings_count,
       round(rating_real, 2)              as rating_real,     -- usado só pelo sorteio
       round(25 + 0.75 * rating_real, 1)  as rating_display   -- usado nos cards
from calc;

revoke all on public.player_stats from anon;
grant select on public.player_stats to authenticated;

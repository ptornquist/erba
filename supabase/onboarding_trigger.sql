-- Provisions membership rows when a user signs up, using the onboarding
-- payload the wizard passes in `auth.signUp({ options: { data } })`.
--
-- This makes onboarding work even when email confirmation is enabled: at that
-- point the browser has no session yet, so it cannot insert rows under RLS.
-- Runs after supabase/schema.sql.

create or replace function private.generate_referral_code(len integer default 6)
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32))::int + 1, 1),
    ''
  )
  from generate_series(1, len);
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta           jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  code           text;
  attempts       integer := 0;
  new_company    uuid;
  cost           numeric;
  v_member_type  text;
  v_company_name text;
begin
  -- Profile (with a unique 6-character referral code).
  loop
    code := private.generate_referral_code(6);
    begin
      insert into public.profiles (id, email, referral_code, referred_by)
      values (
        new.id,
        coalesce(new.email, ''),
        code,
        nullif(trim(meta ->> 'referred_by'), '')
      )
      on conflict (id) do nothing;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts >= 5 then
        raise;
      end if;
    end;
  end loop;

  -- Company + optional first pain submission. Private individuals are stored
  -- as a company row named after the person so dashboard/RLS keep working.
  v_member_type := coalesce(nullif(trim(meta ->> 'member_type'), ''), 'company');
  v_company_name := coalesce(
    nullif(trim(meta ->> 'company_name'), ''),
    case
      when v_member_type = 'individual' then coalesce(nullif(trim(meta ->> 'full_name'), ''), 'Private member')
      else null
    end
  );

  if v_company_name is not null then
    begin
      insert into public.companies (profile_id, name, industry, turnover_band, is_anonymous)
      values (
        new.id,
        v_company_name,
        coalesce(
          nullif(trim(meta ->> 'industry'), ''),
          case when v_member_type = 'individual' then 'Private individual' else 'Other' end
        ),
        coalesce(
          nullif(trim(meta ->> 'turnover_band'), ''),
          case when v_member_type = 'individual' then 'Private individual' else 'Undisclosed' end
        ),
        coalesce((meta ->> 'is_anonymous')::boolean, false)
      )
      returning id into new_company;

      if nullif(trim(meta ->> 'regulation_name'), '') is not null then
        cost := nullif(meta ->> 'estimated_cost_eur', '')::numeric;
        if cost is not null and cost >= 0 then
          if cost > 1000000 then
            cost := 1000000;
          end if;
          insert into public.pain_submissions (company_id, regulation_name, estimated_cost_eur, description)
          values (
            new_company,
            trim(meta ->> 'regulation_name'),
            cost,
            nullif(trim(meta ->> 'description'), '')
          );
        end if;
      end if;
    exception when others then
      -- Never block account creation because of an onboarding payload issue;
      -- the dashboard prompts the member to complete their company profile.
      raise warning 'handle_new_user: could not provision company for %: %', new.id, sqlerrm;
    end;
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.generate_referral_code(integer) from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

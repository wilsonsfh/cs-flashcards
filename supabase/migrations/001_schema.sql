-- ============================================================
-- CS Flashcards Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- CARDS TABLE
-- ============================================================
create type card_category as enum ('general', 'code', 'data_structures', 'algorithms', 'os', 'networking', 'custom');

create table cards (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  front        text not null,
  back         text not null,
  category     card_category not null default 'general',
  tags         text[] default '{}',
  source_id    integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- FSRS STATE TABLE (1:1 with cards)
-- ============================================================
create table card_fsrs_state (
  id               uuid primary key default uuid_generate_v4(),
  card_id          uuid not null references cards(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  due              timestamptz not null default now(),
  stability        float8 not null default 0,
  difficulty       float8 not null default 0,
  elapsed_days     integer not null default 0,
  scheduled_days   integer not null default 0,
  reps             integer not null default 0,
  lapses           integer not null default 0,
  learning_steps   integer not null default 0,
  state            smallint not null default 0,
  last_review      timestamptz,
  updated_at       timestamptz not null default now(),
  unique(card_id)
);

-- ============================================================
-- REVIEW LOGS TABLE (append-only)
-- ============================================================
create table review_logs (
  id               uuid primary key default uuid_generate_v4(),
  card_id          uuid not null references cards(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  rating           smallint not null,
  state            smallint not null,
  due              timestamptz not null,
  stability        float8 not null,
  difficulty       float8 not null,
  elapsed_days     integer not null,
  last_elapsed_days integer not null,
  scheduled_days   integer not null,
  reviewed_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_fsrs_due on card_fsrs_state(user_id, due asc) where due <= now();
create index idx_fsrs_state_new on card_fsrs_state(user_id, state) where state = 0;
create index idx_review_logs_date on review_logs(user_id, reviewed_at desc);
create index idx_cards_category on cards(user_id, category);
create index idx_cards_search on cards using gin(to_tsvector('english', front || ' ' || back));

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table cards enable row level security;
alter table card_fsrs_state enable row level security;
alter table review_logs enable row level security;

create policy "cards: own rows only" on cards
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "fsrs_state: own rows only" on card_fsrs_state
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "review_logs: own rows only" on review_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at
  before update on cards
  for each row execute function update_updated_at();

create trigger fsrs_state_updated_at
  before update on card_fsrs_state
  for each row execute function update_updated_at();

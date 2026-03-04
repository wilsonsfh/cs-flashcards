CREATE TABLE template_cards (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  front       text NOT NULL,
  back        text NOT NULL,
  category    card_category NOT NULL DEFAULT 'general',
  tags        text[] DEFAULT '{}',
  source_id   integer
);
-- No RLS — accessed via service role only

-- Enable Row Level Security on tables
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public read access to active occasions" ON occasions;
DROP POLICY IF EXISTS "Allow public read access to published cards" ON cards;
DROP POLICY IF EXISTS "Block direct writes to occasions" ON occasions;
DROP POLICY IF EXISTS "Block direct updates to occasions" ON occasions;
DROP POLICY IF EXISTS "Block direct deletes to occasions" ON occasions;
DROP POLICY IF EXISTS "Block direct writes to cards" ON cards;
DROP POLICY IF EXISTS "Block direct updates to cards" ON cards;
DROP POLICY IF EXISTS "Block direct deletes to cards" ON cards;

-- Policy: Allow public read access to active occasions
-- This allows anyone to read occasions that are active (for homepage)
CREATE POLICY "Allow public read access to active occasions"
ON occasions
FOR SELECT
USING (is_active = true);

-- Policy: Allow public read access to published cards
-- This allows anyone to read published cards (for viewing via deep links)
CREATE POLICY "Allow public read access to published cards"
ON cards
FOR SELECT
USING (status = 'published' AND expires_at > NOW());

-- Policy: Block all direct writes to occasions
-- All writes should go through the API (which uses service role and bypasses RLS)
CREATE POLICY "Block direct writes to occasions"
ON occasions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct updates to occasions"
ON occasions
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes to occasions"
ON occasions
FOR DELETE
USING (false);

-- Policy: Block all direct writes to cards
-- All writes should go through the API (which uses service role and bypasses RLS)
CREATE POLICY "Block direct writes to cards"
ON cards
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct updates to cards"
ON cards
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes to cards"
ON cards
FOR DELETE
USING (false);

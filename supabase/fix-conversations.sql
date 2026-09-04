-- ==========================================
-- EMERGENCY FIX: Drop ALL policies on conversation tables
-- and recreate without recursion
-- ==========================================

-- Drop ALL existing policies on these 3 tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversation_members') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversation_members';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON messages';
  END LOOP;
END $$;

-- conversation_members: simple policies, NO subqueries to self
CREATE POLICY "conversation_members_select" ON conversation_members FOR SELECT USING (true);
CREATE POLICY "conversation_members_insert" ON conversation_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversation_members_delete" ON conversation_members FOR DELETE USING (auth.uid() = user_id);

-- conversations: simple policies, NO subqueries
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (true);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_update" ON conversations FOR UPDATE USING (true);

-- messages: simple policies, NO subqueries
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (auth.uid() = user_id);

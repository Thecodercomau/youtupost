-- ==========================================
-- YOUTUPOST — Complete Setup (Combined)
-- Run this ONCE in Supabase SQL Editor
-- Safe to re-run (all operations are idempotent)
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES (all with IF NOT EXISTS)
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  banner TEXT,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  aura TEXT DEFAULT 'violet' CHECK (aura IN ('violet','cyan','emerald','solar','rose','ice')),
  status JSONB,
  badges TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  activity_status BOOLEAN DEFAULT TRUE,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followers (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT DEFAULT '',
  media TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'text' CHECK (type IN ('text','image','carousel','video','repost','poll')),
  repost_of UUID REFERENCES posts(id) ON DELETE SET NULL,
  hashtags TEXT[] DEFAULT '{}',
  location TEXT DEFAULT '',
  category TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE IF NOT EXISTS reposts (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS saved_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_posts (
  collection_id UUID REFERENCES saved_collections(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, post_id)
);

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image','video','text')),
  duration INTEGER DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS story_views (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (story_id, user_id)
);

CREATE TABLE IF NOT EXISTS shorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  music JSONB,
  duration INTEGER DEFAULT 30,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS short_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, short_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  muted BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text','image','video','gif','voice')),
  media_url TEXT,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  reactions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','read')),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like','comment','follow','repost','mention','message','story','system')),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  text TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '👥',
  banner TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_members (
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin','moderator','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  media TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS mutes (
  muter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  muted_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (muter_id, muted_id)
);

CREATE TABLE IF NOT EXISTS close_friends (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT DEFAULT '',
  media TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'post',
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  accent TEXT DEFAULT 'default',
  density TEXT DEFAULT 'comfortable',
  reduced_motion BOOLEAN DEFAULT FALSE,
  privacy JSONB DEFAULT '{"is_private":false,"comments_permission":"everyone","mention_permission":"everyone","message_permission":"everyone","story_visibility":"everyone","activity_visibility":true,"read_receipts":true}',
  notifications JSONB DEFAULT '{"likes":true,"comments":true,"follows":true,"messages":true,"mentions":true,"system":true}',
  content JSONB DEFAULT '{"sensitive_content":false,"autoplay":true}',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_shorts_user ON shorts(user_id);
CREATE INDEX IF NOT EXISTS idx_shorts_created ON shorts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- ==========================================
-- 3. FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile is created by the app after signup (not via trigger)
  -- This trigger is kept as a fallback
  BEGIN
    INSERT INTO profiles (id, username, display_name, email, avatar, badges)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'avatar', ''),
      '{}'
    );
    INSERT INTO user_settings (user_id) VALUES (NEW.id);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors - app will create profile on first login
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$ BEGIN UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id; RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. TRIGGERS (drop then create)
-- ==========================================

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ==========================================
-- 5. ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. DROP ALL EXISTING POLICIES (clean slate)
-- ==========================================

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
  END LOOP;
END $$;

-- ==========================================
-- 7. CREATE ALL POLICIES (no recursion!)
-- ==========================================

-- PROFILES
CREATE POLICY "p_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "p_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "p_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- FOLLOWERS
CREATE POLICY "f_select" ON followers FOR SELECT USING (true);
CREATE POLICY "f_insert" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "f_delete" ON followers FOR DELETE USING (auth.uid() = follower_id);

-- POSTS
CREATE POLICY "po_select" ON posts FOR SELECT USING (is_archived = false);
CREATE POLICY "po_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "po_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "po_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- LIKES
CREATE POLICY "l_select" ON likes FOR SELECT USING (true);
CREATE POLICY "l_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "l_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "c_select" ON comments FOR SELECT USING (true);
CREATE POLICY "c_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "c_update" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "c_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- COMMENT LIKES
CREATE POLICY "cl_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "cl_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cl_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- REPOSTS
CREATE POLICY "r_select" ON reposts FOR SELECT USING (true);
CREATE POLICY "r_insert" ON reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "r_delete" ON reposts FOR DELETE USING (auth.uid() = user_id);

-- BOOKMARKS
CREATE POLICY "b_select" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "b_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "b_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- SAVED COLLECTIONS
CREATE POLICY "sc_select" ON saved_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sc_insert" ON saved_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sc_update" ON saved_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sc_delete" ON saved_collections FOR DELETE USING (auth.uid() = user_id);

-- COLLECTION POSTS
CREATE POLICY "cp_select" ON collection_posts FOR SELECT USING (true);
CREATE POLICY "cp_insert" ON collection_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "cp_delete" ON collection_posts FOR DELETE USING (true);

-- STORIES
CREATE POLICY "s_select" ON stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "s_insert" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "s_delete" ON stories FOR DELETE USING (auth.uid() = user_id);

-- STORY VIEWS
CREATE POLICY "sv_select" ON story_views FOR SELECT USING (true);
CREATE POLICY "sv_insert" ON story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SHORTS
CREATE POLICY "sh_select" ON shorts FOR SELECT USING (true);
CREATE POLICY "sh_insert" ON shorts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sh_delete" ON shorts FOR DELETE USING (auth.uid() = user_id);

-- SHORT LIKES
CREATE POLICY "sl_select" ON short_likes FOR SELECT USING (true);
CREATE POLICY "sl_insert" ON short_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sl_delete" ON short_likes FOR DELETE USING (auth.uid() = user_id);

-- CONVERSATIONS (open — protection via application logic)
CREATE POLICY "cv_select" ON conversations FOR SELECT USING (true);
CREATE POLICY "cv_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "cv_update" ON conversations FOR UPDATE USING (true);

-- CONVERSATION MEMBERS (open — no self-referencing subqueries)
CREATE POLICY "cm_select" ON conversation_members FOR SELECT USING (true);
CREATE POLICY "cm_insert" ON conversation_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cm_delete" ON conversation_members FOR DELETE USING (auth.uid() = user_id);

-- MESSAGES (open — protection via application logic)
CREATE POLICY "m_select" ON messages FOR SELECT USING (true);
CREATE POLICY "m_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "m_update" ON messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "m_delete" ON messages FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "n_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "n_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "n_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "n_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- COMMUNITIES
CREATE POLICY "com_select" ON communities FOR SELECT USING (true);
CREATE POLICY "com_insert" ON communities FOR INSERT WITH CHECK (true);

-- COMMUNITY MEMBERS
CREATE POLICY "cmem_select" ON community_members FOR SELECT USING (true);
CREATE POLICY "cmem_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cmem_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- COMMUNITY POSTS
CREATE POLICY "cmp_select" ON community_posts FOR SELECT USING (true);
CREATE POLICY "cmp_insert" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BLOCKS
CREATE POLICY "bl_select" ON blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "bl_insert" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "bl_delete" ON blocks FOR DELETE USING (auth.uid() = blocker_id);

-- MUTES
CREATE POLICY "mu_select" ON mutes FOR SELECT USING (auth.uid() = muter_id);
CREATE POLICY "mu_insert" ON mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);
CREATE POLICY "mu_delete" ON mutes FOR DELETE USING (auth.uid() = muter_id);

-- CLOSE FRIENDS
CREATE POLICY "cf_select" ON close_friends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_insert" ON close_friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_delete" ON close_friends FOR DELETE USING (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "rp_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "rp_select" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- DRAFTS
CREATE POLICY "d_select" ON drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "d_insert" ON drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "d_update" ON drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "d_delete" ON drafts FOR DELETE USING (auth.uid() = user_id);

-- USER SETTINGS
CREATE POLICY "us_select" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "us_insert" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_update" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- YOUTUPOST — Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- Safe to re-run (uses DROP IF EXISTS)
-- ==========================================

-- Enable RLS on all tables
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
-- PROFILES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ==========================================
-- FOLLOWERS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON followers;
CREATE POLICY "Followers are viewable by everyone" ON followers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON followers;
CREATE POLICY "Users can unfollow" ON followers FOR DELETE USING (auth.uid() = follower_id);

-- ==========================================
-- POSTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Posts are viewable by everyone (non-archived)" ON posts;
CREATE POLICY "Posts are viewable by everyone (non-archived)" ON posts FOR SELECT USING (
  is_archived = false
  AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = posts.user_id AND blocked_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- LIKES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON likes;
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON likes;
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- COMMENTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- COMMENT LIKES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON comment_likes;
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like comments" ON comment_likes;
CREATE POLICY "Users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;
CREATE POLICY "Users can unlike comments" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- REPOSTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Reposts are viewable by everyone" ON reposts;
CREATE POLICY "Reposts are viewable by everyone" ON reposts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can repost" ON reposts;
CREATE POLICY "Users can repost" ON reposts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reposts" ON reposts;
CREATE POLICY "Users can delete own reposts" ON reposts FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- BOOKMARKS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark posts" ON bookmarks;
CREATE POLICY "Users can bookmark posts" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarks;
CREATE POLICY "Users can remove bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- SAVED COLLECTIONS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own collections" ON saved_collections;
CREATE POLICY "Users can view own collections" ON saved_collections FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create collections" ON saved_collections;
CREATE POLICY "Users can create collections" ON saved_collections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own collections" ON saved_collections;
CREATE POLICY "Users can update own collections" ON saved_collections FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own collections" ON saved_collections;
CREATE POLICY "Users can delete own collections" ON saved_collections FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- COLLECTION POSTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own collection posts" ON collection_posts;
CREATE POLICY "Users can view own collection posts" ON collection_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM saved_collections WHERE saved_collections.id = collection_posts.collection_id AND saved_collections.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can add to own collections" ON collection_posts;
CREATE POLICY "Users can add to own collections" ON collection_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM saved_collections WHERE saved_collections.id = collection_posts.collection_id AND saved_collections.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can remove from own collections" ON collection_posts;
CREATE POLICY "Users can remove from own collections" ON collection_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM saved_collections WHERE saved_collections.id = collection_posts.collection_id AND saved_collections.user_id = auth.uid())
);

-- ==========================================
-- STORIES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Stories are viewable by everyone (non-expired)" ON stories;
CREATE POLICY "Stories are viewable by everyone (non-expired)" ON stories FOR SELECT USING (expires_at > NOW());

DROP POLICY IF EXISTS "Users can create stories" ON stories;
CREATE POLICY "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- STORY VIEWS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view story views" ON story_views;
CREATE POLICY "Users can view story views" ON story_views FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM stories WHERE stories.id = story_views.story_id AND stories.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create story views" ON story_views;
CREATE POLICY "Users can create story views" ON story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SHORTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Shorts are viewable by everyone" ON shorts;
CREATE POLICY "Shorts are viewable by everyone" ON shorts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create shorts" ON shorts;
CREATE POLICY "Users can create shorts" ON shorts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shorts" ON shorts;
CREATE POLICY "Users can delete own shorts" ON shorts FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- SHORT LIKES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Short likes are viewable by everyone" ON short_likes;
CREATE POLICY "Short likes are viewable by everyone" ON short_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like shorts" ON short_likes;
CREATE POLICY "Users can like shorts" ON short_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike shorts" ON short_likes;
CREATE POLICY "Users can unlike shorts" ON short_likes FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- CONVERSATIONS POLICIES (fixed recursion)
-- ==========================================
DROP POLICY IF EXISTS "Users can view conversations they belong to" ON conversations;
CREATE POLICY "Users can view conversations they belong to" ON conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

-- ==========================================
-- CONVERSATION MEMBERS POLICIES (fixed recursion)
-- ==========================================
DROP POLICY IF EXISTS "Users can view members of conversations they belong to" ON conversation_members;
CREATE POLICY "Users can view members of conversations they belong to" ON conversation_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add members to conversations" ON conversation_members;
CREATE POLICY "Users can add members to conversations" ON conversation_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- MESSAGES POLICIES (fixed recursion)
-- ==========================================
DROP POLICY IF EXISTS "Members can view messages in their conversations" ON messages;
CREATE POLICY "Members can view messages in their conversations" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can send messages" ON messages;
CREATE POLICY "Members can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- NOTIFICATIONS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- COMMUNITIES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create communities" ON communities;
CREATE POLICY "Users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- ==========================================
-- COMMUNITY MEMBERS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON community_members;
CREATE POLICY "Community members are viewable by everyone" ON community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join communities" ON community_members;
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave communities" ON community_members;
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- COMMUNITY POSTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Community posts are viewable by members" ON community_posts;
CREATE POLICY "Community posts are viewable by members" ON community_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_members WHERE community_members.community_id = community_posts.community_id AND community_members.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can create community posts" ON community_posts;
CREATE POLICY "Members can create community posts" ON community_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM community_members WHERE community_members.community_id = community_posts.community_id AND community_members.user_id = auth.uid())
);

-- ==========================================
-- BLOCKS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own blocks" ON blocks;
CREATE POLICY "Users can view own blocks" ON blocks FOR SELECT USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can block" ON blocks;
CREATE POLICY "Users can block" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can unblock" ON blocks;
CREATE POLICY "Users can unblock" ON blocks FOR DELETE USING (auth.uid() = blocker_id);

-- ==========================================
-- MUTES POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own mutes" ON mutes;
CREATE POLICY "Users can view own mutes" ON mutes FOR SELECT USING (auth.uid() = muter_id);

DROP POLICY IF EXISTS "Users can mute" ON mutes;
CREATE POLICY "Users can mute" ON mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);

DROP POLICY IF EXISTS "Users can unmute" ON mutes;
CREATE POLICY "Users can unmute" ON mutes FOR DELETE USING (auth.uid() = muter_id);

-- ==========================================
-- CLOSE FRIENDS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own close friends" ON close_friends;
CREATE POLICY "Users can view own close friends" ON close_friends FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add close friends" ON close_friends;
CREATE POLICY "Users can add close friends" ON close_friends FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove close friends" ON close_friends;
CREATE POLICY "Users can remove close friends" ON close_friends FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- REPORTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- ==========================================
-- DRAFTS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own drafts" ON drafts;
CREATE POLICY "Users can view own drafts" ON drafts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create drafts" ON drafts;
CREATE POLICY "Users can create drafts" ON drafts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own drafts" ON drafts;
CREATE POLICY "Users can update own drafts" ON drafts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own drafts" ON drafts;
CREATE POLICY "Users can delete own drafts" ON drafts FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- USER SETTINGS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

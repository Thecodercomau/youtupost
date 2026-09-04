/* ==========================================
   YOUTUPOST — Supabase Services
   Real Backend Integration
   ========================================== */

import { getSupabase, isSupabaseConfigured } from '../supabase.js';
import { AppState } from '../state.js';
import { generateId, escapeHtml } from '../utils.js';
import { STORAGE_BUCKET } from '../config.js';

/* ==========================================
   AUTH SERVICE
   ========================================== */
export const SupabaseAuth = {
  async signUp(email, password, metadata = {}) {
    const sb = await getSupabase();
    if (!sb) return { success: false, error: 'Supabase not configured' };

    const username = metadata.username || email.split('@')[0];
    const displayName = metadata.displayName || email.split('@')[0];

    // Step 1: Sign up with Supabase Auth
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName, avatar: metadata.avatar || '' },
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed' };

    // Step 2: Create profile (trigger may have failed, so we do it explicitly)
    const userId = data.user.id;
    const { error: profileErr } = await sb.from('profiles').upsert({
      id: userId,
      username,
      display_name: displayName,
      email,
      avatar: metadata.avatar || '',
      badges: [],
    }, { onConflict: 'id' });

    if (profileErr) console.warn('[Supabase] Profile upsert:', profileErr.message);

    // Step 3: Create default settings
    const { error: settingsErr } = await sb.from('user_settings').upsert(
      { user_id: userId },
      { onConflict: 'user_id' }
    );

    if (settingsErr) console.warn('[Supabase] Settings upsert:', settingsErr.message);

    // Step 4: Fetch the created profile
    const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();

    return { success: true, user: data.user, profile };
  },

  async signIn(email, password) {
    const sb = await getSupabase();
    if (!sb) return { success: false, error: 'Supabase not configured' };

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const userId = data.user.id;

    // Fetch profile — create if missing
    let { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();

    if (!profile) {
      const username = data.user.user_metadata?.username || email.split('@')[0];
      const displayName = data.user.user_metadata?.display_name || email.split('@')[0];

      await sb.from('profiles').upsert({
        id: userId,
        username,
        display_name: displayName,
        email,
        avatar: data.user.user_metadata?.avatar || '',
        badges: [],
      }, { onConflict: 'id' });

      await sb.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id' });

      const { data: newProfile } = await sb.from('profiles').select('*').eq('id', userId).single();
      profile = newProfile;
    }

    return { success: true, user: data.user, profile };
  },

  async signOut() {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    AppState.set('currentUser', null);
  },

  async getCurrentUser() {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    return profile;
  },

  onAuthStateChange(callback) {
    return new Promise(async (resolve) => {
      const sb = await getSupabase();
      if (!sb) { resolve({ data: { subscription: { unsubscribe: () => {} } } }); return; }

      const { data } = sb.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
          callback(event, session, profile);
        } else {
          callback(event, session, null);
        }
      });

      resolve(data);
    });
  },
};

/* ==========================================
   POST SERVICE
   ========================================== */
export const SupabasePosts = {
  async create(data) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data: post, error } = await sb.from('posts').insert({
      user_id: AppState.getVal('currentUser'),
      text: data.text || '',
      media: data.media || [],
      type: data.type || 'text',
      hashtags: data.hashtags || [],
      location: data.location || '',
      category: data.category || '',
      repost_of: data.repostOf || null,
    }).select().single();

    if (error) { console.error('Create post error:', error); return null; }
    return post;
  },

  async getFeed(filter = 'for-you', page = 0, limit = 20) {
    const sb = await getSupabase();
    if (!sb) return [];

    const userId = AppState.getVal('currentUser');
    const offset = page * limit;

    let query = sb.from('posts').select(`
      *,
      user:profiles!posts_user_id_fkey(id, username, display_name, avatar, is_verified, badges),
      likes:likes(user_id),
      comments:comments(id),
      reposts:reposts(user_id),
      bookmarks:bookmarks(user_id)
    `);

    // Filter out blocked users
    const { data: blocked } = await sb.from('blocks').select('blocked_id').eq('blocker_id', userId);
    const blockedIds = (blocked || []).map(b => b.blocked_id);

    if (blockedIds.length > 0) {
      query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);
    }

    // Apply filter
    switch (filter) {
      case 'following': {
        const { data: following } = await sb.from('followers').select('following_id').eq('follower_id', userId);
        const followingIds = (following || []).map(f => f.following_id);
        followingIds.push(userId);
        query = query.in('user_id', followingIds);
        break;
      }
      case 'friends': {
        const { data: following } = await sb.from('followers').select('following_id').eq('follower_id', userId);
        const followingIds = (following || []).map(f => f.following_id);
        // Get mutual followers
        if (followingIds.length > 0) {
          const { data: mutual } = await sb.from('followers').select('follower_id').in('following_id', [userId]).in('follower_id', followingIds);
          const friendIds = (mutual || []).map(m => m.follower_id);
          friendIds.push(userId);
          query = query.in('user_id', friendIds);
        }
        break;
      }
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      default: // for-you
        query = query.order('created_at', { ascending: false });
    }

    if (filter !== 'latest') {
      query = query.order('created_at', { ascending: false });
    }

    const { data: posts, error } = await query.range(offset, offset + limit - 1);
    if (error) { console.error('Feed error:', error); return []; }

    // Transform to match expected format
    return (posts || []).map(p => ({
      ...p,
      likes: (p.likes || []).map(l => l.user_id),
      comments: p.comments || [],
      reposts: (p.reposts || []).map(r => r.user_id),
      bookmarks: (p.bookmarks || []).map(b => b.user_id),
      user: p.user,
    }));
  },

  async getById(postId) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data, error } = await sb.from('posts').select(`
      *,
      user:profiles!posts_user_id_fkey(id, username, display_name, avatar, is_verified, badges),
      likes:likes(user_id),
      comments(*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar)),
      reposts:reposts(user_id)
    `).eq('id', postId).single();

    if (error) return null;
    return {
      ...data,
      likes: (data.likes || []).map(l => l.user_id),
      reposts: (data.reposts || []).map(r => r.user_id),
    };
  },

  async getUserPosts(userId) {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data, error } = await sb.from('posts').select(`
      *,
      user:profiles!posts_user_id_fkey(id, username, display_name, avatar, is_verified, badges),
      likes:likes(user_id),
      comments(id),
      reposts:reposts(user_id)
    `).eq('user_id', userId).eq('is_archived', false).order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(p => ({
      ...p,
      likes: (p.likes || []).map(l => l.user_id),
      reposts: (p.reposts || []).map(r => r.user_id),
    }));
  },

  async like(postId) {
    const sb = await getSupabase();
    if (!sb) return;

    const userId = AppState.getVal('currentUser');
    const { data: existing } = await sb.from('likes').select().eq('user_id', userId).eq('post_id', postId).single();

    if (existing) {
      await sb.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
    } else {
      await sb.from('likes').insert({ user_id: userId, post_id: postId });
      // Create notification
      const { data: post } = await sb.from('posts').select('user_id').eq('id', postId).single();
      if (post && post.user_id !== userId) {
        await sb.from('notifications').insert({
          user_id: post.user_id,
          from_user_id: userId,
          type: 'like',
          post_id: postId,
        });
      }
    }
  },

  async addComment(postId, text, parentId = null) {
    const sb = await getSupabase();
    if (!sb) return null;

    const userId = AppState.getVal('currentUser');
    const { data: comment, error } = await sb.from('comments').insert({
      post_id: postId,
      user_id: userId,
      text: escapeHtml(text),
      parent_id: parentId,
    }).select().single();

    if (error) return null;

    // Create notification
    const { data: post } = await sb.from('posts').select('user_id').eq('id', postId).single();
    if (post && post.user_id !== userId) {
      await sb.from('notifications').insert({
        user_id: post.user_id,
        from_user_id: userId,
        type: 'comment',
        post_id: postId,
        text: text.slice(0, 100),
      });
    }

    return comment;
  },

  async save(postId) {
    const sb = await getSupabase();
    if (!sb) return false;

    const userId = AppState.getVal('currentUser');
    const { data: existing } = await sb.from('bookmarks').select().eq('user_id', userId).eq('post_id', postId).single();

    if (existing) {
      await sb.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId);
      return false;
    } else {
      await sb.from('bookmarks').insert({ user_id: userId, post_id: postId });
      return true;
    }
  },

  async delete(postId) {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.from('posts').delete().eq('id', postId);
  },

  async archive(postId) {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.from('posts').update({ is_archived: true }).eq('id', postId);
  },

  async search(query) {
    const sb = await getSupabase();
    if (!sb) return { users: [], posts: [], hashtags: [], communities: [] };

    const { data: users } = await sb.from('profiles').select('*').or(`username.ilike.%${query}%,display_name.ilike.%${query}%`).limit(10);
    const { data: posts } = await sb.from('posts').select('*, user:profiles!posts_user_id_fkey(id, username, display_name, avatar)').textSearch('text', query).limit(20);

    return { users: users || [], posts: posts || [], hashtags: [], communities: [] };
  },
};

/* ==========================================
   PROFILE SERVICE
   ========================================== */
export const SupabaseProfiles = {
  async getByUsername(username) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data, error } = await sb.from('profiles').select('*').eq('username', username).single();
    if (error) return null;
    return data;
  },

  async getById(userId) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
    return data;
  },

  async update(userId, data) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data: updated, error } = await sb.from('profiles').update(data).eq('id', userId).select().single();
    if (error) return null;
    return updated;
  },

  async follow(targetUserId) {
    const sb = await getSupabase();
    if (!sb) return false;

    const userId = AppState.getVal('currentUser');
    const { data: existing } = await sb.from('followers').select().eq('follower_id', userId).eq('following_id', targetUserId).single();

    if (existing) {
      await sb.from('followers').delete().eq('follower_id', userId).eq('following_id', targetUserId);
      return false;
    } else {
      await sb.from('followers').insert({ follower_id: userId, following_id: targetUserId });
      // Create notification
      if (targetUserId !== userId) {
        await sb.from('notifications').insert({
          user_id: targetUserId,
          from_user_id: userId,
          type: 'follow',
        });
      }
      return true;
    }
  },

  async isFollowing(userId, targetId) {
    const sb = await getSupabase();
    if (!sb) return false;

    const { data } = await sb.from('followers').select().eq('follower_id', userId).eq('following_id', targetId).single();
    return !!data;
  },

  async getFollowers(userId) {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data } = await sb.from('followers').select('follower:profiles!followers_follower_id_fkey(id, username, display_name, avatar, is_verified, badges)').eq('following_id', userId);
    return (data || []).map(d => d.follower).filter(Boolean);
  },

  async getFollowing(userId) {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data } = await sb.from('followers').select('following:profiles!followers_following_id_fkey(id, username, display_name, avatar, is_verified, badges)').eq('follower_id', userId);
    return (data || []).map(d => d.following).filter(Boolean);
  },

  async getFollowerCount(userId) {
    const sb = await getSupabase();
    if (!sb) return 0;

    const { count } = await sb.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    return count || 0;
  },

  async getFollowingCount(userId) {
    const sb = await getSupabase();
    if (!sb) return 0;

    const { count } = await sb.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    return count || 0;
  },

  async block(targetId) {
    const sb = await getSupabase();
    if (!sb) return;

    const userId = AppState.getVal('currentUser');
    const { data: existing } = await sb.from('blocks').select().eq('blocker_id', userId).eq('blocked_id', targetId).single();

    if (existing) {
      await sb.from('blocks').delete().eq('blocker_id', userId).eq('blocked_id', targetId);
    } else {
      await sb.from('blocks').insert({ blocker_id: userId, blocked_id: targetId });
    }
  },

  async mute(targetId) {
    const sb = await getSupabase();
    if (!sb) return;

    const userId = AppState.getVal('currentUser');
    const { data: existing } = await sb.from('mutes').select().eq('muter_id', userId).eq('muted_id', targetId).single();

    if (existing) {
      await sb.from('mutes').delete().eq('muter_id', userId).eq('muted_id', targetId);
    } else {
      await sb.from('mutes').insert({ muter_id: userId, muted_id: targetId });
    }
  },
};

/* ==========================================
   MESSAGE SERVICE
   ========================================== */
export const SupabaseMessages = {
  async getConversations() {
    const sb = await getSupabase();
    if (!sb) return [];

    const userId = AppState.getVal('currentUser');

    // Get conversations the user is a member of
    const { data: memberships } = await sb.from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!memberships?.length) return [];

    const convIds = memberships.map(m => m.conversation_id);

    const { data: conversations } = await sb.from('conversations')
      .select(`
        *,
        members:conversation_members(user_id),
        last_message:messages(text, created_at, user_id, status)
      `)
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    return (conversations || []).map(c => ({
      ...c,
      members: (c.members || []).map(m => m.user_id),
      last_message: c.last_message?.[0] || null,
    }));
  },

  async getMessages(convId) {
    const sb = await getSupabase();
    if (!sb) return [];

    const { data, error } = await sb.from('messages')
      .select('*, user:profiles!messages_user_id_fkey(id, username, display_name, avatar)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data || [];
  },

  async sendMessage(convId, text) {
    const sb = await getSupabase();
    if (!sb) return null;

    const userId = AppState.getVal('currentUser');
    const { data: msg, error } = await sb.from('messages').insert({
      conversation_id: convId,
      user_id: userId,
      text: escapeHtml(text),
      type: 'text',
      status: 'sent',
    }).select().single();

    if (error) return null;

    // Create notification for other members
    const { data: members } = await sb.from('conversation_members')
      .select('user_id')
      .eq('conversation_id', convId)
      .neq('user_id', userId);

    for (const member of (members || [])) {
      await sb.from('notifications').insert({
        user_id: member.user_id,
        from_user_id: userId,
        type: 'message',
        text: text.slice(0, 100),
      });
    }

    return msg;
  },

  async createConversation(memberIds, name = null, isGroup = false) {
    const sb = await getSupabase();
    if (!sb) return null;

    const { data: conv, error } = await sb.from('conversations').insert({
      name,
      is_group: isGroup,
    }).select().single();

    if (error) return null;

    // Add members
    const members = memberIds.map(id => ({ conversation_id: conv.id, user_id: id }));
    await sb.from('conversation_members').insert(members);

    return conv;
  },

  async markAsRead(convId) {
    const sb = await getSupabase();
    if (!sb) return;

    const userId = AppState.getVal('currentUser');
    await sb.from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', convId)
      .eq('user_id', userId);
  },
};

/* ==========================================
   NOTIFICATION SERVICE
   ========================================== */
export const SupabaseNotifications = {
  async getAll() {
    const sb = await getSupabase();
    if (!sb) return [];

    const userId = AppState.getVal('currentUser');
    const { data } = await sb.from('notifications')
      .select('*, from_user:profiles!notifications_from_user_id_fkey(id, username, display_name, avatar)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map(n => ({
      ...n,
      user: n.from_user,
    }));
  },

  async getUnreadCount() {
    const sb = await getSupabase();
    if (!sb) return 0;

    const userId = AppState.getVal('currentUser');
    const { count } = await sb.from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return count || 0;
  },

  async markAsRead(notifId) {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.from('notifications').update({ read: true }).eq('id', notifId);
  },

  async markAllAsRead() {
    const sb = await getSupabase();
    if (!sb) return;

    const userId = AppState.getVal('currentUser');
    await sb.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  },
};

/* ==========================================
   REALTIME SERVICE
   ========================================== */
export const SupabaseRealtime = {
  channels: {},

  subscribeToMessages(convId, callback) {
    return new Promise(async (resolve) => {
      const sb = await getSupabase();
      if (!sb) { resolve(() => {}); return; }

      const channel = sb.channel(`messages:${convId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        }, (payload) => {
          callback(payload.new);
        })
        .subscribe();

      this.channels[`messages:${convId}`] = channel;
      resolve(() => {
        sb.removeChannel(channel);
        delete this.channels[`messages:${convId}`];
      });
    });
  },

  subscribeToNotifications(callback) {
    return new Promise(async (resolve) => {
      const sb = await getSupabase();
      if (!sb) { resolve(() => {}); return; }

      const userId = AppState.getVal('currentUser');
      const channel = sb.channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          callback(payload.new);
        })
        .subscribe();

      this.channels.notifications = channel;
      resolve(() => {
        sb.removeChannel(channel);
        delete this.channels.notifications;
      });
    });
  },

  subscribeToPosts(callback) {
    return new Promise(async (resolve) => {
      const sb = await getSupabase();
      if (!sb) { resolve(() => {}); return; }

      const channel = sb.channel('posts')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts',
        }, (payload) => {
          callback(payload);
        })
        .subscribe();

      this.channels.posts = channel;
      resolve(() => {
        sb.removeChannel(channel);
        delete this.channels.posts;
      });
    });
  },

  async trackPresence(userId, status = 'online') {
    const sb = await getSupabase();
    if (!sb) return;

    const channel = sb.channel('presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        AppState.set('onlineUsers', Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            status,
            online_at: new Date().toISOString(),
          });
        }
      });

    this.channels.presence = channel;
  },

  unsubscribeAll() {
    const sb = getSupabase();
    if (!sb) return;

    Object.values(this.channels).forEach(ch => {
      sb.removeChannel(ch);
    });
    this.channels = {};
  },
};

/* ==========================================
   STORAGE SERVICE
   ========================================== */
export const SupabaseStorage = {
  async upload(file, folder = 'uploads') {
    const sb = await getSupabase();
    if (!sb) return null;

    const userId = AppState.getVal('currentUser');
    const ext = file.name?.split('.').pop() || 'jpg';
    const path = `${folder}/${userId}/${generateId()}.${ext}`;

    const { data, error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) { console.error('Upload error:', error); return null; }

    const { data: urlData } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async delete(path) {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.storage.from(STORAGE_BUCKET).remove([path]);
  },
};

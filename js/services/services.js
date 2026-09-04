/* ==========================================
   YOUTUPOST — Services (Unified)
   Supabase backend when configured,
   LocalStorage demo mode otherwise
   ========================================== */

import { isSupabaseConfigured } from '../supabase.js';
import { AppState } from '../state.js';
import { generateId, escapeHtml } from '../utils.js';

/* Lazy-load Supabase services */
let _sbAuth, _sbPosts, _sbProfiles, _sbMessages, _sbNotifications, _sbRealtime, _sbStorage;

async function loadSupabaseServices() {
  if (!_sbAuth) {
    const mod = await import('./supabase-services.js');
    _sbAuth = mod.SupabaseAuth;
    _sbPosts = mod.SupabasePosts;
    _sbProfiles = mod.SupabaseProfiles;
    _sbMessages = mod.SupabaseMessages;
    _sbNotifications = mod.SupabaseNotifications;
    _sbRealtime = mod.SupabaseRealtime;
    _sbStorage = mod.SupabaseStorage;
  }
}

/* ==========================================
   AUTH SERVICE
   ========================================== */
export const AuthService = {
  async signIn(username, password) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      const result = await _sbAuth.signIn(username, password);
      if (result.success && result.profile) {
        AppState.set('currentUser', result.profile.id);
      }
      return result;
    }
    // Demo mode
    const users = AppState.getVal('users') || [];
    const user = users.find(u =>
      (u.username.toLowerCase() === username.toLowerCase() ||
       u.email?.toLowerCase() === username.toLowerCase()) &&
      u.password === password
    );
    if (user) {
      AppState.set('currentUser', user.id);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  async signUp(userData) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbAuth.signUp(userData.email, userData.password, {
        username: userData.username,
        displayName: userData.displayName,
        avatar: userData.avatar,
      });
    }
    // Demo mode
    const users = AppState.getVal('users') || [];
    const exists = users.find(u =>
      u.username.toLowerCase() === userData.username.toLowerCase() ||
      u.email?.toLowerCase() === userData.email?.toLowerCase()
    );
    if (exists) return { success: false, error: 'Username or email already taken' };

    const newUser = {
      id: generateId(),
      ...userData,
      followers: [],
      following: [],
      posts: [],
      createdAt: new Date().toISOString(),
      isVerified: false,
      badges: [],
      bio: '',
      location: '',
      website: '',
      aura: 'violet',
      status: null,
      isPrivate: false,
    };
    users.push(newUser);
    AppState.set('users', users);
    AppState.set('currentUser', newUser.id);
    return { success: true, user: newUser };
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      await _sbAuth.signOut();
    }
    AppState.set('currentUser', null);
  },

  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      const profile = await _sbAuth.getCurrentUser();
      if (profile) AppState.set('currentUser', profile.id);
      return profile;
    }
    const userId = AppState.getVal('currentUser');
    if (!userId) return null;
    const users = AppState.getVal('users') || [];
    return users.find(u => u.id === userId) || null;
  },

  continueAsDemo() {
    const users = AppState.getVal('users') || [];
    if (users.length > 0) {
      AppState.set('currentUser', users[0].id);
      return users[0];
    }
    return null;
  },
};

/* ==========================================
   POST SERVICE
   ========================================== */
export const PostService = {
  async createPost(data) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.create(data);
    }
    const posts = AppState.getVal('posts') || [];
    const newPost = {
      id: generateId(),
      userId: AppState.getVal('currentUser'),
      ...data,
      likes: [],
      comments: [],
      reposts: [],
      bookmarks: [],
      views: 0,
      createdAt: new Date().toISOString(),
      isArchived: false,
    };
    posts.unshift(newPost);
    AppState.set('posts', posts);
    return newPost;
  },

  async getFeed(filter = 'for-you') {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.getFeed(filter);
    }
    const posts = AppState.getVal('posts') || [];
    const userId = AppState.getVal('currentUser');
    const relationships = AppState.getVal('followRelationships') || {};
    const blocked = AppState.getVal('blockedUsers') || [];

    let filtered = posts.filter(p => !p.isArchived && !blocked.includes(p.userId));

    switch (filter) {
      case 'following':
        const following = relationships[userId] || [];
        filtered = filtered.filter(p => following.includes(p.userId) || p.userId === userId);
        break;
      case 'friends':
        const myFollowing = relationships[userId] || [];
        filtered = filtered.filter(p => {
          const theirFollowing = relationships[p.userId] || [];
          return myFollowing.includes(p.userId) && theirFollowing.includes(userId);
        });
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        filtered.sort((a, b) => {
          const aScore = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) * 3 + (a.reposts?.length || 0);
          const bScore = (b.likes?.length || 0) * 2 + (b.comments?.length || 0) * 3 + (b.reposts?.length || 0);
          return bScore - aScore;
        });
    }
    return filtered;
  },

  async getPost(postId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.getById(postId);
    }
    const posts = AppState.getVal('posts') || [];
    return posts.find(p => p.id === postId);
  },

  async getUserPosts(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.getUserPosts(userId);
    }
    const posts = AppState.getVal('posts') || [];
    return posts.filter(p => p.userId === userId && !p.isArchived);
  },

  async likePost(postId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      await _sbPosts.like(postId);
      return;
    }
    const posts = AppState.getVal('posts') || [];
    const userId = AppState.getVal('currentUser');
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    AppState.set('posts', posts);
    return post;
  },

  async savePost(postId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.save(postId);
    }
    const saved = AppState.getVal('savedPosts') || [];
    if (saved.includes(postId)) {
      AppState.set('savedPosts', saved.filter(id => id !== postId));
      return false;
    } else {
      saved.push(postId);
      AppState.set('savedPosts', saved);
      return true;
    }
  },

  async repostPost(postId, comment = '') {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.create({ text: comment, repostOf: postId, type: 'repost' });
    }
    const posts = AppState.getVal('posts') || [];
    const userId = AppState.getVal('currentUser');
    const original = posts.find(p => p.id === postId);
    if (!original) return;
    if (!original.reposts.includes(userId)) {
      original.reposts.push(userId);
      AppState.set('posts', posts);
    }
    if (comment) {
      return this.createPost({ text: comment, repostOf: postId, media: original.media, type: 'repost' });
    }
    return original;
  },

  async addComment(postId, text, parentId = null) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.addComment(postId, text, parentId);
    }
    const posts = AppState.getVal('posts') || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const comment = {
      id: generateId(),
      userId: AppState.getVal('currentUser'),
      text: escapeHtml(text),
      parentId,
      likes: [],
      createdAt: new Date().toISOString(),
    };
    post.comments.push(comment);
    AppState.set('posts', posts);
    return comment;
  },

  async deletePost(postId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.delete(postId);
    }
    const posts = AppState.getVal('posts') || [];
    AppState.set('posts', posts.filter(p => p.id !== postId));
  },

  async archivePost(postId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.archive(postId);
    }
    const posts = AppState.getVal('posts') || [];
    const post = posts.find(p => p.id === postId);
    if (post) { post.isArchived = true; AppState.set('posts', posts); }
  },

  async getExplorePosts(category = null) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.getFeed('latest');
    }
    const posts = AppState.getVal('posts') || [];
    let filtered = posts.filter(p => !p.isArchived);
    if (category) {
      filtered = filtered.filter(p =>
        p.hashtags?.some(h => h.toLowerCase() === category.toLowerCase()) ||
        p.category?.toLowerCase() === category.toLowerCase()
      );
    }
    return filtered;
  },
};

/* ==========================================
   PROFILE SERVICE
   ========================================== */
export const ProfileService = {
  async getUser(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getById(userId);
    }
    const users = AppState.getVal('users') || [];
    return users.find(u => u.id === userId);
  },

  async getUserByUsername(username) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getByUsername(username);
    }
    const users = AppState.getVal('users') || [];
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  async updateProfile(userId, data) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.update(userId, data);
    }
    const users = AppState.getVal('users') || [];
    const user = users.find(u => u.id === userId);
    if (user) { Object.assign(user, data); AppState.set('users', users); }
    return user;
  },

  async follow(targetUserId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.follow(targetUserId);
    }
    const currentUser = AuthService.getCurrentUser?.() || (() => {
      const users = AppState.getVal('users') || [];
      return users.find(u => u.id === AppState.getVal('currentUser'));
    })();
    if (!currentUser) return false;
    const relationships = AppState.getVal('followRelationships') || {};
    if (!relationships[currentUser.id]) relationships[currentUser.id] = [];
    if (relationships[currentUser.id].includes(targetUserId)) {
      relationships[currentUser.id] = relationships[currentUser.id].filter(id => id !== targetUserId);
    } else {
      relationships[currentUser.id].push(targetUserId);
    }
    AppState.set('followRelationships', relationships);
    return relationships[currentUser.id].includes(targetUserId);
  },

  async isFollowing(userId, targetId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.isFollowing(userId, targetId);
    }
    const relationships = AppState.getVal('followRelationships') || {};
    return (relationships[userId] || []).includes(targetId);
  },

  async getFollowers(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getFollowers(userId);
    }
    const relationships = AppState.getVal('followRelationships') || [];
    const users = AppState.getVal('users') || [];
    const followerIds = [];
    for (const [uid, following] of Object.entries(relationships)) {
      if (following.includes(userId)) followerIds.push(uid);
    }
    return followerIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  },

  async getFollowing(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getFollowing(userId);
    }
    const relationships = AppState.getVal('followRelationships') || [];
    const users = AppState.getVal('users') || [];
    return (relationships[userId] || []).map(id => users.find(u => u.id === id)).filter(Boolean);
  },

  async getFollowerCount(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getFollowerCount(userId);
    }
    const followers = await this.getFollowers(userId);
    return followers.length;
  },

  async getFollowingCount(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.getFollowingCount(userId);
    }
    const following = await this.getFollowing(userId);
    return following.length;
  },

  isConnection(userId, otherId) {
    return this.isFollowing(userId, otherId) && this.isFollowing(otherId, userId);
  },

  async blockUser(targetId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.block(targetId);
    }
    const blocked = AppState.getVal('blockedUsers') || [];
    if (blocked.includes(targetId)) {
      AppState.set('blockedUsers', blocked.filter(id => id !== targetId));
    } else {
      blocked.push(targetId);
      AppState.set('blockedUsers', blocked);
    }
  },

  async muteUser(targetId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbProfiles.mute(targetId);
    }
    const muted = AppState.getVal('mutedUsers') || [];
    if (muted.includes(targetId)) {
      AppState.set('mutedUsers', muted.filter(id => id !== targetId));
    } else {
      muted.push(targetId);
      AppState.set('mutedUsers', muted);
    }
  },

  async toggleCloseFriend(targetId) {
    const cf = AppState.getVal('closeFriends') || [];
    if (cf.includes(targetId)) {
      AppState.set('closeFriends', cf.filter(id => id !== targetId));
    } else {
      cf.push(targetId);
      AppState.set('closeFriends', cf);
    }
  },
};

/* ==========================================
   MESSAGE SERVICE
   ========================================== */
export const MessageService = {
  async getConversations() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbMessages.getConversations();
    }
    const convs = AppState.getVal('conversations') || [];
    const userId = AppState.getVal('currentUser');
    return convs.filter(c => c.members.includes(userId));
  },

  async getMessages(convId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbMessages.getMessages(convId);
    }
    const messages = AppState.getVal('messages') || [];
    return messages.filter(m => m.conversationId === convId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async sendMessage(convId, text) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbMessages.sendMessage(convId, text);
    }
    const messages = AppState.getVal('messages') || [];
    const msg = {
      id: generateId(),
      conversationId: convId,
      userId: AppState.getVal('currentUser'),
      text: escapeHtml(text),
      type: 'text',
      reactions: [],
      replyTo: null,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    messages.push(msg);
    AppState.set('messages', messages);
    const convs = AppState.getVal('conversations') || [];
    const conv = convs.find(c => c.id === convId);
    if (conv) { conv.lastMessage = msg; conv.updatedAt = msg.createdAt; }
    AppState.set('conversations', convs);
    setTimeout(() => { msg.status = 'delivered'; AppState.set('messages', messages); }, 800);
    setTimeout(() => { msg.status = 'read'; AppState.set('messages', messages); }, 2000);
    return msg;
  },

  async createConversation(members, name = null, isGroup = false) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbMessages.createConversation(members, name, isGroup);
    }
    const convs = AppState.getVal('conversations') || [];
    const conv = {
      id: generateId(),
      members,
      name: isGroup ? name : null,
      isGroup,
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    convs.push(conv);
    AppState.set('conversations', convs);
    return conv;
  },

  async getUnreadCount(convId) {
    const userId = AppState.getVal('currentUser');
    const messages = await this.getMessages(convId);
    return messages.filter(m => m.userId !== userId && m.status !== 'read').length;
  },
};

/* ==========================================
   NOTIFICATION SERVICE
   ========================================== */
export const NotificationService = {
  async getAll() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbNotifications.getAll();
    }
    return (AppState.getVal('notifications') || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getUnreadCount() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbNotifications.getUnreadCount();
    }
    const notifs = AppState.getVal('notifications') || [];
    return notifs.filter(n => !n.read).length;
  },

  async markAsRead(notifId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbNotifications.markAsRead(notifId);
    }
    const notifications = AppState.getVal('notifications') || [];
    const notif = notifications.find(n => n.id === notifId);
    if (notif) { notif.read = true; AppState.set('notifications', notifications); }
  },

  async markAllAsRead() {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbNotifications.markAllAsRead();
    }
    const notifications = AppState.getVal('notifications') || [];
    notifications.forEach(n => n.read = true);
    AppState.set('notifications', notifications);
  },

  async create(data) {
    const notifications = AppState.getVal('notifications') || [];
    const notif = {
      id: generateId(),
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(notif);
    if (notifications.length > 100) notifications.length = 100;
    AppState.set('notifications', notifications);
    return notif;
  },
};

/* ==========================================
   REALTIME SERVICE
   ========================================== */
export const RealtimeService = {
  async subscribeToMessages(convId, callback) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbRealtime.subscribeToMessages(convId, callback);
    }
    return () => {};
  },

  async subscribeToNotifications(callback) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbRealtime.subscribeToNotifications(callback);
    }
    return () => {};
  },

  async subscribeToPosts(callback) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbRealtime.subscribeToPosts(callback);
    }
    return () => {};
  },

  async trackPresence(userId) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbRealtime.trackPresence(userId);
    }
  },

  unsubscribeAll() {
    if (isSupabaseConfigured() && _sbRealtime) {
      _sbRealtime.unsubscribeAll();
    }
  },
};

/* ==========================================
   SEARCH SERVICE
   ========================================== */
export const SearchService = {
  async search(query) {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbPosts.search(query);
    }
    if (!query || query.length < 2) return { users: [], posts: [], hashtags: [], communities: [] };

    const users = (AppState.getVal('users') || []).filter(u =>
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
    );
    const posts = (AppState.getVal('posts') || []).filter(p =>
      p.text?.toLowerCase().includes(query.toLowerCase()) ||
      p.hashtags?.some(h => h.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 20);

    const allHashtags = new Set();
    (AppState.getVal('posts') || []).forEach(p => { p.hashtags?.forEach(h => allHashtags.add(h)); });
    const hashtags = [...allHashtags].filter(h => h.toLowerCase().includes(query.toLowerCase()));

    const communities = (AppState.getVal('communities') || []).filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    return { users, posts, hashtags, communities };
  },

  addToHistory(query) {
    const history = AppState.getVal('searchHistory') || [];
    const filtered = history.filter(h => h !== query);
    filtered.unshift(query);
    if (filtered.length > 20) filtered.length = 20;
    AppState.set('searchHistory', filtered);
  },

  getHistory() {
    return AppState.getVal('searchHistory') || [];
  },

  clearHistory() {
    AppState.set('searchHistory', []);
  },
};

/* ==========================================
   COMMUNITY SERVICE
   ========================================== */
export const CommunityService = {
  getAll() { return AppState.getVal('communities') || []; },
  getById(id) { return (AppState.getVal('communities') || []).find(c => c.id === id); },

  join(communityId) {
    const userId = AppState.getVal('currentUser');
    const communities = AppState.getVal('communities') || [];
    const community = communities.find(c => c.id === communityId);
    if (!community) return;
    if (!community.members) community.members = [];
    if (!community.members.includes(userId)) {
      community.members.push(userId);
    } else {
      community.members = community.members.filter(id => id !== userId);
    }
    AppState.set('communities', communities);
  },

  create(data) {
    const communities = AppState.getVal('communities') || [];
    const community = {
      id: generateId(),
      ...data,
      members: [AppState.getVal('currentUser')],
      posts: [],
      createdAt: new Date().toISOString(),
    };
    communities.push(community);
    AppState.set('communities', communities);
    return community;
  },
};

/* ==========================================
   SAVED SERVICE
   ========================================== */
export const SavedService = {
  getCollections() { return AppState.getVal('savedCollections') || []; },

  createCollection(name) {
    const collections = AppState.getVal('savedCollections') || [];
    const collection = { id: generateId(), name, posts: [], createdAt: new Date().toISOString() };
    collections.push(collection);
    AppState.set('savedCollections', collections);
    return collection;
  },

  addToCollection(collectionId, postId) {
    const collections = AppState.getVal('savedCollections') || [];
    const collection = collections.find(c => c.id === collectionId);
    if (collection && !collection.posts.includes(postId)) {
      collection.posts.push(postId);
      AppState.set('savedCollections', collections);
    }
  },

  removeFromCollection(collectionId, postId) {
    const collections = AppState.getVal('savedCollections') || [];
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      collection.posts = collection.posts.filter(id => id !== postId);
      AppState.set('savedCollections', collections);
    }
  },

  deleteCollection(collectionId) {
    const collections = AppState.getVal('savedCollections') || [];
    AppState.set('savedCollections', collections.filter(c => c.id !== collectionId));
  },

  getSavedPosts() {
    const savedIds = AppState.getVal('savedPosts') || [];
    const posts = AppState.getVal('posts') || [];
    return savedIds.map(id => posts.find(p => p.id === id)).filter(Boolean);
  },
};

/* ==========================================
   DRAFT SERVICE
   ========================================== */
export const DraftService = {
  getAll() { return AppState.getVal('drafts') || []; },

  save(data) {
    const drafts = AppState.getVal('drafts') || [];
    const draft = { id: generateId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    drafts.unshift(draft);
    AppState.set('drafts', drafts);
    return draft;
  },

  update(draftId, data) {
    const drafts = AppState.getVal('drafts') || [];
    const draft = drafts.find(d => d.id === draftId);
    if (draft) { Object.assign(draft, data, { updatedAt: new Date().toISOString() }); AppState.set('drafts', drafts); }
    return draft;
  },

  delete(draftId) {
    const drafts = AppState.getVal('drafts') || [];
    AppState.set('drafts', drafts.filter(d => d.id !== draftId));
  },
};

/* ==========================================
   AI SERVICE (Simulated)
   ========================================== */
export const AIService = {
  async generateCaption(imageDescription = '') {
    await this._delay();
    const captions = [
      'Living in the moment ✨ #goodvibes',
      'Creating something beautiful today 🎨',
      'The journey is the destination 🌅',
      'New perspectives, same sky 💫',
      'Building the future, one day at a time 🚀',
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  },

  async generateHashtags(topic = '') {
    await this._delay();
    return [['#creative','#inspiration','#artlife'],['#tech','#innovation','#future'],['#music','#producer','#vibes'],['#travel','#adventure','#explore'],['#fitness','#health','#motivation']][Math.floor(Math.random() * 5)];
  },

  async generatePostIdeas(interests = []) {
    await this._delay();
    return ['Share a behind-the-scenes look at your creative process','Ask your audience a question','Post a before/after of your latest project','Create a carousel of your top tips','Share a day-in-the-life story'][Math.floor(Math.random() * 5)];
  },

  async generateBio(name, interests = []) {
    await this._delay();
    return `Creator | ${interests[0] || 'Art'} enthusiast | Building something cool ✨`;
  },

  async searchAssistant(query) {
    await this._delay(1500);
    return `Based on "${query}", here are some suggestions:\n\n• Try exploring the ${query} community\n• Follow creators who post about ${query}\n• Check out trending hashtags related to ${query}`;
  },

  async summarizeDiscussion(posts = []) {
    await this._delay(2000);
    return `Discussion Summary:\n\nThis thread covers ${posts.length} posts about an interesting topic. Key themes include creativity, collaboration, and innovation.`;
  },

  _delay(ms = 1000) { return new Promise(r => setTimeout(r, ms)); },
};

/* ==========================================
   STORAGE SERVICE (Supabase only)
   ========================================== */
export const MediaStorage = {
  async upload(file, folder = 'uploads') {
    if (isSupabaseConfigured()) {
      await loadSupabaseServices();
      return await _sbStorage.upload(file, folder);
    }
    // Demo mode: return data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  },
};

/* ==========================================
   YOUTUPOST — Demo Data
   20+ Users, 30+ Posts, Stories, Shorts, etc.
   ========================================== */

import { generateId, generatePostImage, generateAvatarSVG } from '../utils.js';

const now = Date.now();
const hour = 3600000;
const day = 86400000;

function ago(ms) { return new Date(now - ms).toISOString(); }

/* === Demo Users === */
export const demoUsers = [
  { id: 'u1', username: 'alexchen', displayName: 'Alex Chen', email: 'alex@demo.com', password: 'demo', bio: 'Full-stack developer | Open source enthusiast | Building the future of social media 🚀', location: 'San Francisco, CA', website: 'alexchen.dev', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'developer'], aura: 'violet', status: { emoji: '💻', text: 'Coding' }, createdAt: ago(365 * day) },
  { id: 'u2', username: 'sarahdesigns', displayName: 'Sarah Mitchell', email: 'sarah@demo.com', password: 'demo', bio: 'UI/UX Designer | Creative director | Making the web beautiful ✨', location: 'New York, NY', website: 'sarahdesigns.co', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'artist'], aura: 'rose', status: { emoji: '🎨', text: 'Creating' }, createdAt: ago(300 * day) },
  { id: 'u3', username: 'marioproducer', displayName: 'Mario Rodriguez', email: 'mario@demo.com', password: 'demo', bio: 'Music producer | Beat maker | 🎧 Let the rhythm take over', location: 'Miami, FL', website: '', followers: [], following: [], posts: [], isVerified: true, badges: ['creator'], aura: 'cyan', status: { emoji: '🎧', text: 'Listening' }, createdAt: ago(250 * day) },
  { id: 'u4', username: 'emilytravels', displayName: 'Emily Watson', email: 'emily@demo.com', password: 'demo', bio: 'Travel photographer | 40+ countries | Every picture tells a story 📸', location: 'London, UK', website: 'emilytravels.photo', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'emerald', status: { emoji: '📸', text: 'Exploring' }, createdAt: ago(200 * day) },
  { id: 'u5', username: 'jakegaming', displayName: 'Jake Thompson', email: 'jake@demo.com', password: 'demo', bio: 'Pro gamer | Streamer | Esports enthusiast 🎮', location: 'Austin, TX', website: '', followers: [], following: [], posts: [], isVerified: false, badges: ['creator'], aura: 'solar', status: { emoji: '🎮', text: 'Gaming' }, createdAt: ago(180 * day) },
  { id: 'u6', username: 'lunascience', displayName: 'Luna Patel', email: 'luna@demo.com', password: 'demo', bio: 'Astrophysicist | Science communicator | The universe is amazing 🔭', location: 'Boston, MA', website: 'lunascience.io', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'developer'], aura: 'ice', status: null, createdAt: ago(150 * day) },
  { id: 'u7', username: 'omarfitness', displayName: 'Omar Hassan', email: 'omar@demo.com', password: 'demo', bio: 'Fitness coach | Nutrition expert | Transform your body and mind 💪', location: 'Dubai, UAE', website: 'omarfitness.com', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'creator'], aura: 'emerald', status: { emoji: '💪', text: 'Working out' }, createdAt: ago(130 * day) },
  { id: 'u8', username: 'chloecreates', displayName: 'Chloe Kim', email: 'chloe@demo.com', password: 'demo', bio: 'Digital artist | Illustrator | Making dreams come alive on canvas 🎨', location: 'Seoul, KR', website: 'chloecreates.art', followers: [], following: [], posts: [], isVerified: true, badges: ['artist'], aura: 'violet', status: { emoji: '🎨', text: 'Creating' }, createdAt: ago(120 * day) },
  { id: 'u9', username: 'danielfood', displayName: 'Daniel Garcia', email: 'daniel@demo.com', password: 'demo', bio: 'Food blogger | Chef | Life is too short for bad food 🍳', location: 'Barcelona, Spain', website: 'danielfood.blog', followers: [], following: [], posts: [], isVerified: false, badges: ['creator'], aura: 'solar', status: null, createdAt: ago(100 * day) },
  { id: 'u10', username: 'priyatech', displayName: 'Priya Sharma', email: 'priya@demo.com', password: 'demo', bio: 'AI/ML Engineer | Python | Building intelligent systems 🤖', location: 'Bangalore, India', website: '', followers: [], following: [], posts: [], isVerified: true, badges: ['developer'], aura: 'cyan', status: { emoji: '💻', text: 'Coding' }, createdAt: ago(90 * day) },
  { id: 'u11', username: 'natecodes', displayName: 'Nathan Brooks', email: 'nate@demo.com', password: 'demo', bio: 'React developer | TypeScript | Open source contributor ⚡', location: 'Portland, OR', website: 'natecodes.dev', followers: [], following: [], posts: [], isVerified: false, badges: ['developer'], aura: 'ice', status: null, createdAt: ago(80 * day) },
  { id: 'u12', username: 'avafashion', displayName: 'Ava Williams', email: 'ava@demo.com', password: 'demo', bio: 'Fashion designer | Sustainable fashion advocate | Style is a way of life 👗', location: 'Paris, FR', website: 'avafashion.fr', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'rose', status: { emoji: '✨', text: 'Designing' }, createdAt: ago(70 * day) },
  { id: 'u13', username: 'leosports', displayName: 'Leo Martinez', email: 'leo@demo.com', password: 'demo', bio: 'Sports journalist | Football fanatic | Reporting from the field ⚽', location: 'Madrid, Spain', website: '', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'emerald', status: null, createdAt: ago(60 * day) },
  { id: 'u14', username: 'zara_music', displayName: 'Zara Collins', email: 'zara@demo.com', password: 'demo', bio: 'Singer-songwriter | Guitar | Music is the universal language 🎵', location: 'Nashville, TN', website: 'zaracollins.music', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'artist'], aura: 'violet', status: { emoji: '🎵', text: 'Recording' }, createdAt: ago(55 * day) },
  { id: 'u15', username: 'kai_surfer', displayName: 'Kai Nakamura', email: 'kai@demo.com', password: 'demo', bio: 'Surfer | Marine biologist | Ocean lover 🌊', location: 'Honolulu, HI', website: '', followers: [], following: [], posts: [], isVerified: false, badges: [], aura: 'cyan', status: { emoji: '🌊', text: 'Surfing' }, createdAt: ago(50 * day) },
  { id: 'u16', username: 'finnscott', displayName: 'Finn Scott', email: 'finn@demo.com', password: 'demo', bio: 'Indie filmmaker | Storyteller | Life is a movie 🎬', location: 'Los Angeles, CA', website: 'finnscott.film', followers: [], following: [], posts: [], isVerified: false, badges: ['creator'], aura: 'solar', status: null, createdAt: ago(45 * day) },
  { id: 'u17', username: 'mia_writes', displayName: 'Mia Anderson', email: 'mia@demo.com', password: 'demo', bio: 'Author | Poet | Words have power ✍️', location: 'Chicago, IL', website: 'miaanderson.writes', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'ice', status: null, createdAt: ago(40 * day) },
  { id: 'u18', username: 'yuki_arch', displayName: 'Yuki Tanaka', email: 'yuki@demo.com', password: 'demo', bio: 'Architect | Minimalist design | Spaces that inspire 🏛️', location: 'Tokyo, JP', website: 'yukitanaka.arch', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'emerald', status: null, createdAt: ago(35 * day) },
  { id: 'u19', username: 'ruby_env', displayName: 'Ruby Chen', email: 'ruby@demo.com', password: 'demo', bio: 'Environmental scientist | Climate activist | Save our planet 🌍', location: 'Vancouver, CA', website: '', followers: [], following: [], posts: [], isVerified: false, badges: [], aura: 'emerald', status: { emoji: '🌍', text: 'Advocating' }, createdAt: ago(30 * day) },
  { id: 'u20', username: 'max_startup', displayName: 'Max Turner', email: 'max@demo.com', password: 'demo', bio: 'Serial entrepreneur | Angel investor | Building companies 🏗️', location: 'Austin, TX', website: 'maxturner.co', followers: [], following: [], posts: [], isVerified: true, badges: ['verified', 'organisation'], aura: 'solar', status: null, createdAt: ago(25 * day) },
  { id: 'u21', username: 'demo_user', displayName: 'Demo User', email: 'demo@demo.com', password: 'demo', bio: 'Welcome to Youtupost! This is your demo account. Explore all features! 🎉', location: 'Everywhere', website: 'youtupost.com', followers: [], following: [], posts: [], isVerified: true, badges: ['verified'], aura: 'violet', status: { emoji: '✨', text: 'Exploring' }, createdAt: ago(365 * day) },
];

/* Set up follow relationships */
const followMap = {
  'u1': ['u2', 'u3', 'u4', 'u5', 'u6', 'u8', 'u10', 'u11', 'u14'],
  'u2': ['u1', 'u4', 'u8', 'u12', 'u18'],
  'u3': ['u1', 'u5', 'u14', 'u21'],
  'u4': ['u1', 'u2', 'u15', 'u16'],
  'u5': ['u1', 'u3', 'u13'],
  'u6': ['u1', 'u10', 'u19'],
  'u7': ['u1', 'u13', 'u21'],
  'u8': ['u1', 'u2', 'u12'],
  'u9': ['u1', 'u7', 'u14'],
  'u10': ['u1', 'u6', 'u11'],
  'u11': ['u1', 'u10', 'u14'],
  'u12': ['u2', 'u8', 'u14'],
  'u13': ['u5', 'u7', 'u21'],
  'u14': ['u1', 'u3', 'u12'],
  'u15': ['u4', 'u16'],
  'u16': ['u4', 'u15', 'u17'],
  'u17': ['u16', 'u18'],
  'u18': ['u2', 'u17'],
  'u19': ['u6', 'u20'],
  'u20': ['u1', 'u19', 'u13'],
  'u21': ['u1', 'u2', 'u3', 'u5', 'u7', 'u13', 'u14'],
};
Object.entries(followMap).forEach(([uid, fids]) => {
  const user = demoUsers.find(u => u.id === uid);
  if (user) user.following = fids;
});

/* === Demo Posts === */
export const demoPosts = [
  { id: 'p1', userId: 'u2', text: 'Just finished redesigning the entire UI for our latest project. Glass morphism meets futuristic minimalism. What do you think? ✨\n\n#uidesign #glassmorphism #futuristic', media: [generatePostImage(1)], type: 'image', likes: ['u1', 'u3', 'u4', 'u6', 'u8', 'u10', 'u21'], comments: [], reposts: ['u1', 'u12'], bookmarks: ['u8'], views: 2847, createdAt: ago(2 * hour), hashtags: ['uidesign', 'glassmorphism', 'futuristic'], location: 'New York, NY' },
  { id: 'p2', userId: 'u3', text: 'New beat just dropped! 🔥 Been working on this for weeks. Let me know what you think!\n\n#music #producer #beats', media: [generatePostImage(2)], type: 'image', likes: ['u1', 'u5', 'u14', 'u21'], comments: [], reposts: ['u5'], bookmarks: [], views: 1523, createdAt: ago(3 * hour), hashtags: ['music', 'producer', 'beats'], location: 'Miami, FL' },
  { id: 'p3', userId: 'u4', text: 'Sunset over the Santorini caldera. Some moments take your breath away. 🌅\n\n#travel #santorini #sunset #photography', media: [generatePostImage(3), generatePostImage(13)], type: 'carousel', likes: ['u1', 'u2', 'u6', 'u8', 'u12', 'u15', 'u16', 'u21'], comments: [], reposts: ['u2'], bookmarks: ['u12'], views: 4231, createdAt: ago(5 * hour), hashtags: ['travel', 'santorini', 'sunset', 'photography'], location: 'Santorini, Greece' },
  { id: 'p4', userId: 'u1', text: 'Just open-sourced my new CSS framework! 🎉\n\nFeatures:\n- Zero dependencies\n- 2KB gzipped\n- Fully customizable\n- Dark mode built-in\n\nLink in bio! #opensource #css #webdev', media: [], type: 'text', likes: ['u2', 'u6', 'u10', 'u11', 'u14', 'u21'], comments: [], reposts: ['u10', 'u11'], bookmarks: ['u6', 'u10'], views: 1893, createdAt: ago(6 * hour), hashtags: ['opensource', 'css', 'webdev'] },
  { id: 'p5', userId: 'u8', text: 'New digital art piece: "Neon Dreams" 🎨\n\nCreated entirely in Procreate. Took about 20 hours. Sometimes you just have to let the art flow.\n\n#digitalart #procreate #neon', media: [generatePostImage(4)], type: 'image', likes: ['u1', 'u2', 'u3', 'u4', 'u12', 'u14', 'u17'], comments: [], reposts: ['u2'], bookmarks: ['u2', 'u12'], views: 3567, createdAt: ago(8 * hour), hashtags: ['digitalart', 'procreate', 'neon'] },
  { id: 'p6', userId: 'u5', text: 'Just hit Diamond rank! 🏆 The grind was real but so worth it. Who wants to squad up tonight?\n\n#gaming #esports #ranked', media: [generatePostImage(5)], type: 'image', likes: ['u1', 'u3', 'u13'], comments: [], reposts: [], bookmarks: [], views: 987, createdAt: ago(10 * hour), hashtags: ['gaming', 'esports', 'ranked'] },
  { id: 'p7', userId: 'u6', text: 'The James Webb Space Telescope just captured something incredible. The early universe is more complex than we ever imagined. Thread 🧵\n\n#science #jwst #space #astronomy', media: [generatePostImage(6)], type: 'image', likes: ['u1', 'u10', 'u19', 'u20', 'u21'], comments: [], reposts: ['u1', 'u10'], bookmarks: ['u10', 'u19'], views: 5678, createdAt: ago(12 * hour), hashtags: ['science', 'jwst', 'space', 'astronomy'] },
  { id: 'p8', userId: 'u7', text: 'Morning workout complete! 💪 Remember: consistency beats intensity every single time.\n\nToday\'s routine:\n- 5x5 squats\n- 3x12 bench press\n- 4x10 rows\n- Core finisher\n\n#fitness #workout #motivation', media: [generatePostImage(7)], type: 'image', likes: ['u1', 'u5', 'u13', 'u21'], comments: [], reposts: [], bookmarks: ['u5'], views: 1234, createdAt: ago(14 * hour), hashtags: ['fitness', 'workout', 'motivation'] },
  { id: 'p9', userId: 'u14', text: 'New song preview! 🎵 This one\'s special. Acoustic vibes for a late night.\n\n#music #acoustic #singersongwriter #newmusic', media: [generatePostImage(8)], type: 'image', likes: ['u1', 'u2', 'u3', 'u9', 'u12', 'u21'], comments: [], reposts: ['u3'], bookmarks: ['u2'], views: 2345, createdAt: ago(16 * hour), hashtags: ['music', 'acoustic', 'singersongwriter', 'newmusic'] },
  { id: 'p10', userId: 'u12', text: 'Spring collection preview 👗✨ Sustainable materials, timeless design. Fashion doesn\'t have to harm the planet.\n\n#fashion #sustainable #springcollection', media: [generatePostImage(9), generatePostImage(14), generatePostImage(15)], type: 'carousel', likes: ['u1', 'u2', 'u8', 'u14'], comments: [], reposts: ['u2'], bookmarks: ['u2', 'u14'], views: 3100, createdAt: ago(18 * hour), hashtags: ['fashion', 'sustainable', 'springcollection'] },
  { id: 'p11', userId: 'u10', text: 'Built a neural network that can detect deepfakes with 99.7% accuracy. The implications for media trust are huge.\n\nPaper coming soon! #AI #machinelearning #deeplearning', media: [], type: 'text', likes: ['u1', 'u6', 'u11', 'u20'], comments: [], reposts: ['u1', 'u11'], bookmarks: ['u6', 'u20'], views: 4567, createdAt: ago(20 * hour), hashtags: ['AI', 'machinelearning', 'deeplearning'] },
  { id: 'p12', userId: 'u16', text: 'Behind the scenes of our latest short film. The golden hour light was absolutely perfect. 🎬\n\n#filmmaking #bts #cinematography', media: [generatePostImage(10)], type: 'image', likes: ['u1', 'u4', 'u15', 'u17'], comments: [], reposts: [], bookmarks: ['u4'], views: 1876, createdAt: ago(22 * hour), hashtags: ['filmmaking', 'bts', 'cinematography'] },
  { id: 'p13', userId: 'u17', text: 'Words are not just tools. They are bridges between souls.\n\nNew poem from my upcoming collection "Digital Whispers". 📝\n\n#poetry #writing #literature', media: [], type: 'text', likes: ['u1', 'u2', 'u16', 'u18'], comments: [], reposts: [], bookmarks: ['u2'], views: 890, createdAt: ago(24 * hour), hashtags: ['poetry', 'writing', 'literature'] },
  { id: 'p14', userId: 'u18', text: 'Tokyo\'s new vertical garden skyscraper. Architecture that breathes. 🏛️🌿\n\n#architecture #tokyo #sustainability #design', media: [generatePostImage(11)], type: 'image', likes: ['u1', 'u2', 'u4', 'u17', 'u19'], comments: [], reposts: ['u2'], bookmarks: ['u2', 'u4'], views: 2345, createdAt: ago(26 * hour), hashtags: ['architecture', 'tokyo', 'sustainability', 'design'] },
  { id: 'p15', userId: 'u9', text: 'Homemade pasta from scratch. The secret? Patience and good olive oil. 🍝\n\nRecipe in comments!\n\n#food #cooking #pasta #homemade', media: [generatePostImage(12)], type: 'image', likes: ['u1', 'u7', 'u14', 'u21'], comments: [], reposts: [], bookmarks: ['u7'], views: 1567, createdAt: ago(28 * hour), hashtags: ['food', 'cooking', 'pasta', 'homemade'] },
  { id: 'p16', userId: 'u19', text: 'The ocean cleanup project just removed 100,000 kg of plastic from the Pacific. Small actions, big impact. 🌊\n\n#environment #ocean #sustainability', media: [generatePostImage(16)], type: 'image', likes: ['u1', 'u4', 'u6', 'u15', 'u20'], comments: [], reposts: ['u1', 'u6', 'u20'], bookmarks: ['u6'], views: 6789, createdAt: ago(30 * hour), hashtags: ['environment', 'ocean', 'sustainability'] },
  { id: 'p17', userId: 'u20', text: 'Excited to announce our Series A! 🎉 $12M to build the future of collaboration tools.\n\nThank you to everyone who believed in us from day one.\n\n#startup #funding #entrepreneurship', media: [], type: 'text', likes: ['u1', 'u6', 'u10', 'u11', 'u13', 'u19'], comments: [], reposts: ['u1', 'u10'], bookmarks: ['u1', 'u10'], views: 8901, createdAt: ago(32 * hour), hashtags: ['startup', 'funding', 'entrepreneurship'] },
  { id: 'p18', userId: 'u11', text: 'Refactored 10,000 lines of code today. Sometimes the best features are the ones you remove. 🧹\n\n#programming #refactoring #cleancode', media: [], type: 'text', likes: ['u1', 'u10', 'u20'], comments: [], reposts: [], bookmarks: ['u10'], views: 567, createdAt: ago(34 * hour), hashtags: ['programming', 'refactoring', 'cleancode'] },
  { id: 'p19', userId: 'u13', text: 'GOAL! What a match! The stadium erupted. 🏟️⚽\n\n#football #sports #goal', media: [generatePostImage(17)], type: 'image', likes: ['u5', 'u7', 'u14', 'u21'], comments: [], reposts: ['u5'], bookmarks: [], views: 3456, createdAt: ago(36 * hour), hashtags: ['football', 'sports', 'goal'] },
  { id: 'p20', userId: 'u15', text: 'Swam with manta rays today. These gentle giants are incredible. We must protect our oceans. 🌊\n\n#ocean #surfing #marinebiology', media: [generatePostImage(18)], type: 'image', likes: ['u1', 'u4', 'u16', 'u19'], comments: [], reposts: ['u4'], bookmarks: ['u4'], views: 2100, createdAt: ago(38 * hour), hashtags: ['ocean', 'surfing', 'marinebiology'] },
  { id: 'p21', userId: 'u1', text: 'Late night coding session. Building something exciting for Youtupost. Can\'t wait to share! 👀\n\n#coding #webdev #javascript', media: [generatePostImage(19)], type: 'image', likes: ['u2', 'u3', 'u10', 'u11', 'u14'], comments: [], reposts: [], bookmarks: ['u10'], views: 1234, createdAt: ago(40 * hour), hashtags: ['coding', 'webdev', 'javascript'] },
  { id: 'p22', userId: 'u2', text: 'Design tip of the day: White space is not empty space. It\'s breathing room for your content. 📐\n\n#design #uidesign #tip', media: [], type: 'text', likes: ['u1', 'u4', 'u8', 'u12', 'u18'], comments: [], reposts: ['u1', 'u18'], bookmarks: ['u18'], views: 2345, createdAt: ago(42 * hour), hashtags: ['design', 'uidesign', 'tip'] },
  { id: 'p23', userId: 'u6', text: 'Fun fact: The observable universe contains approximately 2 trillion galaxies. We\'re just getting started exploring. 🌌\n\n#space #universe #science', media: [generatePostImage(20)], type: 'image', likes: ['u1', 'u10', 'u16', 'u19', 'u21'], comments: [], reposts: ['u1', 'u10'], bookmarks: ['u19'], views: 5678, createdAt: ago(44 * hour), hashtags: ['space', 'universe', 'science'] },
  { id: 'p24', userId: 'u3', text: 'Studio session with @zara_music. Something special is cooking. 🎶🔥\n\n#collab #music #studio', media: [generatePostImage(21)], type: 'image', likes: ['u1', 'u14', 'u9', 'u21'], comments: [], reposts: ['u14'], bookmarks: [], views: 1890, createdAt: ago(46 * hour), hashtags: ['collab', 'music', 'studio'] },
  { id: 'p25', userId: 'u14', text: 'Acoustic cover of my favorite song. Stripped down, raw, and real. 🎸\n\n#acoustic #cover #music #raw', media: [generatePostImage(22)], type: 'image', likes: ['u1', 'u3', 'u8', 'u12', 'u21'], comments: [], reposts: ['u3'], bookmarks: ['u3'], views: 2345, createdAt: ago(48 * hour), hashtags: ['acoustic', 'cover', 'music', 'raw'] },
  { id: 'p26', userId: 'u8', text: 'Abstract series #3: "Digital Flora" 🌺\n\nExploring the intersection of nature and technology through digital art.\n\n#abstract #digitalart #flora', media: [generatePostImage(23)], type: 'image', likes: ['u1', 'u2', 'u12', 'u17', 'u18'], comments: [], reposts: ['u2'], bookmarks: ['u2', 'u12'], views: 3456, createdAt: ago(50 * hour), hashtags: ['abstract', 'digitalart', 'flora'] },
  { id: 'p27', userId: 'u7', text: 'Meal prep Sunday! 🥗 Eating clean doesn\'t have to be boring.\n\nToday\'s menu:\n- Grilled chicken breast\n- Quinoa bowl\n- Roasted vegetables\n- Fresh smoothie\n\n#mealprep #healthy #nutrition', media: [generatePostImage(24)], type: 'image', likes: ['u1', 'u9', 'u13', 'u21'], comments: [], reposts: [], bookmarks: ['u9'], views: 1234, createdAt: ago(52 * hour), hashtags: ['mealprep', 'healthy', 'nutrition'] },
  { id: 'p28', userId: 'u10', text: 'Hot take: The future of programming is natural language. We\'re closer than people think.\n\n#AI #programming #future', media: [], type: 'text', likes: ['u1', 'u6', 'u11', 'u20'], comments: [], reposts: ['u1', 'u11'], bookmarks: ['u11', 'u20'], views: 4567, createdAt: ago(54 * hour), hashtags: ['AI', 'programming', 'future'] },
  { id: 'p29', userId: 'u17', text: '"In a world of algorithms, be a poem."\n\nNew short story out now. Link in bio. 📚\n\n#writing #shortstory #literature', media: [], type: 'text', likes: ['u1', 'u2', 'u16', 'u18'], comments: [], reposts: [], bookmarks: ['u2'], views: 678, createdAt: ago(56 * hour), hashtags: ['writing', 'shortstory', 'literature'] },
  { id: 'p30', userId: 'u20', text: 'Lessons from 5 years of building:\n\n1. Ship fast, iterate faster\n2. Listen to users, not investors\n3. Culture eats strategy\n4. Revenue is oxygen\n5. Take care of your team\n\n#startup #entrepreneurship #lessons', media: [], type: 'text', likes: ['u1', 'u6', 'u10', 'u11', 'u13', 'u19'], comments: [], reposts: ['u1', 'u10', 'u11'], bookmarks: ['u1', 'u10'], views: 7890, createdAt: ago(58 * hour), hashtags: ['startup', 'entrepreneurship', 'lessons'] },
  { id: 'p31', userId: 'u4', text: 'Cherry blossoms in Kyoto. Japan in spring is pure magic. 🌸\n\n#japan #cherryblossom #kyoto #travel', media: [generatePostImage(25), generatePostImage(26)], type: 'carousel', likes: ['u1', 'u2', 'u8', 'u12', 'u15', 'u18', 'u21'], comments: [], reposts: ['u2'], bookmarks: ['u2', 'u8', 'u12'], views: 5678, createdAt: ago(60 * hour), hashtags: ['japan', 'cherryblossom', 'kyoto', 'travel'] },
  { id: 'p32', userId: 'u9', text: 'Street food tour in Bangkok! 🍜 The flavors here are unreal.\n\n#food #streetfood #bangkok #travel', media: [generatePostImage(27)], type: 'image', likes: ['u1', 'u4', 'u7', 'u14'], comments: [], reposts: [], bookmarks: ['u4'], views: 2345, createdAt: ago(62 * hour), hashtags: ['food', 'streetfood', 'bangkok', 'travel'] },
];

/* Add comments to some posts */
demoPosts[0].comments = [
  { id: 'c1', userId: 'u1', text: 'This is incredible work! The glass effect is so clean.', parentId: null, likes: ['u2', 'u8'], createdAt: ago(1.5 * hour) },
  { id: 'c2', userId: 'u8', text: 'Love the blur effect! What did you use for the backdrop?', parentId: null, likes: ['u2'], createdAt: ago(1 * hour) },
  { id: 'c3', userId: 'u2', text: 'CSS backdrop-filter! Works beautifully in modern browsers.', parentId: 'c2', likes: ['u8', 'u1'], createdAt: ago(0.5 * hour) },
];
demoPosts[2].comments = [
  { id: 'c4', userId: 'u1', text: 'Absolutely breathtaking! Santorini is on my bucket list.', parentId: null, likes: ['u4'], createdAt: ago(4 * hour) },
  { id: 'c5', userId: 'u15', text: 'The colors are unreal. Is this edited?', parentId: null, likes: [], createdAt: ago(3.5 * hour) },
  { id: 'c6', userId: 'u4', text: 'Just a slight contrast boost. The sunset did all the work! 🌅', parentId: 'c5', likes: ['u15'], createdAt: ago(3 * hour) },
];
demoPosts[4].comments = [
  { id: 'c7', userId: 'u2', text: 'The color palette is stunning! Those neon tones 🔥', parentId: null, likes: ['u8'], createdAt: ago(7 * hour) },
  { id: 'c8', userId: 'u12', text: 'I need this as a print! Do you sell your art?', parentId: null, likes: ['u8'], createdAt: ago(6.5 * hour) },
];
demoPosts[6].comments = [
  { id: 'c9', userId: 'u1', text: 'The detail in that image is insane. JWST is a game changer.', parentId: null, likes: ['u6', 'u10'], createdAt: ago(11 * hour) },
  { id: 'c10', userId: 'u10', text: 'We are literally looking at the beginning of time. Mind-blowing.', parentId: null, likes: ['u1', 'u6'], createdAt: ago(10.5 * hour) },
];

/* === Demo Stories === */
export const demoStories = [
  { id: 's1', userId: 'u2', items: [{ type: 'image', src: generatePostImage(30), duration: 5000 }], seen: false, createdAt: ago(1 * hour) },
  { id: 's2', userId: 'u3', items: [{ type: 'image', src: generatePostImage(31), duration: 5000 }], seen: false, createdAt: ago(2 * hour) },
  { id: 's3', userId: 'u4', items: [{ type: 'image', src: generatePostImage(32), duration: 5000 }, { type: 'image', src: generatePostImage(33), duration: 5000 }], seen: false, createdAt: ago(3 * hour) },
  { id: 's4', userId: 'u8', items: [{ type: 'image', src: generatePostImage(34), duration: 5000 }], seen: true, createdAt: ago(5 * hour) },
  { id: 's5', userId: 'u5', items: [{ type: 'image', src: generatePostImage(35), duration: 5000 }], seen: true, createdAt: ago(6 * hour) },
  { id: 's6', userId: 'u7', items: [{ type: 'image', src: generatePostImage(36), duration: 5000 }], seen: false, createdAt: ago(4 * hour) },
  { id: 's7', userId: 'u14', items: [{ type: 'image', src: generatePostImage(37), duration: 5000 }, { type: 'image', src: generatePostImage(38), duration: 5000 }], seen: true, createdAt: ago(7 * hour) },
  { id: 's8', userId: 'u12', items: [{ type: 'image', src: generatePostImage(39), duration: 5000 }], seen: false, createdAt: ago(2.5 * hour) },
  { id: 's9', userId: 'u6', items: [{ type: 'image', src: generatePostImage(40), duration: 5000 }], seen: true, createdAt: ago(8 * hour) },
  { id: 's10', userId: 'u10', items: [{ type: 'image', src: generatePostImage(41), duration: 5000 }], seen: false, createdAt: ago(1.5 * hour) },
  { id: 's11', userId: 'u9', items: [{ type: 'image', src: generatePostImage(42), duration: 5000 }], seen: true, createdAt: ago(9 * hour) },
  { id: 's12', userId: 'u16', items: [{ type: 'image', src: generatePostImage(43), duration: 5000 }], seen: true, createdAt: ago(10 * hour) },
  { id: 's13', userId: 'u15', items: [{ type: 'image', src: generatePostImage(44), duration: 5000 }], seen: false, createdAt: ago(4.5 * hour) },
  { id: 's14', userId: 'u1', items: [{ type: 'image', src: generatePostImage(45), duration: 5000 }], seen: true, createdAt: ago(11 * hour) },
  { id: 's15', userId: 'u21', items: [{ type: 'image', src: generatePostImage(46), duration: 5000 }], seen: true, createdAt: ago(12 * hour) },
];

/* === Demo Shorts === */
export const demoShorts = [
  { id: 'sh1', userId: 'u3', caption: 'New beat making process 🔥 #music #producer', music: { name: 'Studio Vibes', artist: 'Mario Rodriguez' }, likes: ['u1', 'u5', 'u14', 'u21'], comments: 23, reposts: 5, saves: 12, views: 12500, duration: 30, createdAt: ago(2 * hour) },
  { id: 'sh2', userId: 'u5', caption: 'Insane clutch! 🎮 #gaming #highlight', music: null, likes: ['u1', 'u3', 'u13'], comments: 45, reposts: 8, saves: 20, views: 28900, duration: 45, createdAt: ago(4 * hour) },
  { id: 'sh3', userId: 'u4', caption: 'Beautiful sunset in Bali 🌅 #travel #bali', music: { name: 'Island Dreams', artist: 'Tropical Vibes' }, likes: ['u1', 'u2', 'u15', 'u16', 'u21'], comments: 67, reposts: 15, saves: 34, views: 45600, duration: 20, createdAt: ago(6 * hour) },
  { id: 'sh4', userId: 'u8', caption: 'Speed painting process ✨ #art #digitalart', music: { name: 'Creative Flow', artist: 'Chill Beats' }, likes: ['u1', 'u2', 'u12', 'u14'], comments: 34, reposts: 12, saves: 28, views: 18700, duration: 60, createdAt: ago(8 * hour) },
  { id: 'sh5', userId: 'u7', caption: 'Quick ab workout 💪 #fitness #workout', music: { name: 'Pump It Up', artist: 'Fitness Mix' }, likes: ['u1', 'u5', 'u9', 'u13'], comments: 19, reposts: 7, saves: 45, views: 32100, duration: 35, createdAt: ago(10 * hour) },
  { id: 'sh6', userId: 'u14', caption: 'Acoustic session 🎵 #music #acoustic', music: null, likes: ['u1', 'u3', 'u8', 'u12', 'u21'], comments: 56, reposts: 20, saves: 40, views: 67800, duration: 40, createdAt: ago(12 * hour) },
  { id: 'sh7', userId: 'u1', text: 'Coding tips in 30 seconds ⚡ #coding #tips', caption: 'Coding tips in 30 seconds ⚡ #coding #tips', music: null, likes: ['u2', 'u10', 'u11'], comments: 28, reposts: 10, saves: 22, views: 15600, duration: 30, createdAt: ago(14 * hour) },
  { id: 'sh8', userId: 'u9', caption: 'Making fresh pasta from scratch 🍝 #food #cooking', music: { name: 'Italian Kitchen', artist: 'Chef Vibes' }, likes: ['u1', 'u7', 'u14'], comments: 15, reposts: 3, saves: 18, views: 9800, duration: 50, createdAt: ago(16 * hour) },
  { id: 'sh9', userId: 'u16', caption: 'Cinematic drone shot 🎬 #filmmaking #drone', music: { name: 'Epic Score', artist: 'Film Music' }, likes: ['u1', 'u4', 'u15', 'u17'], comments: 41, reposts: 14, saves: 30, views: 34500, duration: 25, createdAt: ago(18 * hour) },
  { id: 'sh10', userId: 'u12', caption: 'Fashion design process 👗 #fashion #design', music: { name: 'Runway Beat', artist: 'Fashion Mix' }, likes: ['u1', 'u2', 'u8', 'u14'], comments: 22, reposts: 8, saves: 25, views: 21300, duration: 35, createdAt: ago(20 * hour) },
  { id: 'sh11', userId: 'u15', caption: 'Underwater adventure 🌊 #ocean #surfing', music: { name: 'Ocean Waves', artist: 'Nature Sounds' }, likes: ['u1', 'u4', 'u16', 'u19'], comments: 33, reposts: 9, saves: 15, views: 27600, duration: 30, createdAt: ago(22 * hour) },
  { id: 'sh12', userId: 'u10', caption: 'AI demo: real-time translation 🤖 #AI #tech', music: null, likes: ['u1', 'u6', 'u11', 'u20'], comments: 52, reposts: 18, saves: 35, views: 42100, duration: 45, createdAt: ago(24 * hour) },
  { id: 'sh13', userId: 'u13', caption: 'Best goals compilation ⚽ #football #goals', music: { name: 'Stadium Anthem', artist: 'Sports Mix' }, likes: ['u5', 'u7', 'u21'], comments: 78, reposts: 25, saves: 40, views: 89000, duration: 55, createdAt: ago(26 * hour) },
  { id: 'sh4', userId: 'u18', caption: 'Architectural timelapse 🏛️ #architecture', music: { name: 'Ambient Flow', artist: 'Chill Mix' }, likes: ['u1', 'u2', 'u4', 'u17'], comments: 20, reposts: 6, saves: 18, views: 12400, duration: 40, createdAt: ago(28 * hour) },
  { id: 'sh15', userId: 'u19', caption: 'Ocean cleanup progress 🌍 #environment', music: null, likes: ['u1', 'u4', 'u6', 'u15', 'u20'], comments: 44, reposts: 30, saves: 50, views: 56700, duration: 35, createdAt: ago(30 * hour) },
];

/* === Demo Conversations === */
export const demoConversations = [
  { id: 'conv1', members: ['u21', 'u2'], name: null, isGroup: false, createdAt: ago(10 * day) },
  { id: 'conv2', members: ['u21', 'u1'], name: null, isGroup: false, createdAt: ago(8 * day) },
  { id: 'conv3', members: ['u21', 'u3', 'u14', 'u8'], name: 'Creative Squad 🎨', isGroup: true, createdAt: ago(5 * day) },
  { id: 'conv4', members: ['u21', 'u4'], name: null, isGroup: false, createdAt: ago(3 * day) },
  { id: 'conv5', members: ['u21', 'u10', 'u11'], name: 'Dev Talk 💻', isGroup: true, createdAt: ago(4 * day) },
  { id: 'conv6', members: ['u21', 'u6'], name: null, isGroup: false, createdAt: ago(2 * day) },
  { id: 'conv7', members: ['u21', 'u5'], name: null, isGroup: false, createdAt: ago(1 * day) },
  { id: 'conv8', members: ['u21', 'u7'], name: null, isGroup: false, createdAt: ago(12 * hour) },
  { id: 'conv9', members: ['u21', 'u12', 'u8'], name: 'Design Hub ✨', isGroup: true, createdAt: ago(6 * day) },
  { id: 'conv10', members: ['u21', 'u9'], name: null, isGroup: false, createdAt: ago(8 * hour) },
];

/* === Demo Messages === */
export const demoMessages = [
  { id: 'm1', conversationId: 'conv1', userId: 'u2', text: 'Hey! Love your latest project 😊', createdAt: ago(2 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm2', conversationId: 'conv1', userId: 'u21', text: 'Thanks Sarah! It was a fun build', createdAt: ago(1.5 * hour), status: 'read', reactions: ['❤️'], replyTo: null },
  { id: 'm3', conversationId: 'conv1', userId: 'u2', text: 'Would you like to collaborate on something?', createdAt: ago(1 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm4', conversationId: 'conv1', userId: 'u21', text: "Absolutely! Let's do it! 🚀", createdAt: ago(30 * 60000), status: 'delivered', reactions: [], replyTo: null },
  { id: 'm5', conversationId: 'conv2', userId: 'u1', text: "Hey, I saw your open source project. It's amazing!", createdAt: ago(1 * day), status: 'read', reactions: [], replyTo: null },
  { id: 'm6', conversationId: 'conv2', userId: 'u21', text: 'Thanks Alex! Would love your feedback on it', createdAt: ago(23 * 3600000), status: 'read', reactions: ['👍'], replyTo: null },
  { id: 'm7', conversationId: 'conv2', userId: 'u1', text: "I'll take a look tonight and open some issues if I find anything", createdAt: ago(22 * 3600000), status: 'read', reactions: [], replyTo: null },
  { id: 'm8', conversationId: 'conv3', userId: 'u3', text: 'Who\'s free for a jam session this weekend? 🎶', createdAt: ago(3 * hour), status: 'read', reactions: ['🎵'], replyTo: null },
  { id: 'm9', conversationId: 'conv3', userId: 'u8', text: 'I\'m in! Got some new artwork to share too', createdAt: ago(2.5 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm10', conversationId: 'conv3', userId: 'u14', text: 'Count me in! I\'ll bring my guitar 🎸', createdAt: ago(2 * hour), status: 'read', reactions: ['❤️'], replyTo: null },
  { id: 'm11', conversationId: 'conv3', userId: 'u21', text: 'This is going to be epic! Saturday at 3pm?', createdAt: ago(1.5 * hour), status: 'delivered', reactions: ['🔥'], replyTo: null },
  { id: 'm12', conversationId: 'conv4', userId: 'u4', text: 'Have you been to Kyoto? The cherry blossoms are amazing right now!', createdAt: ago(2 * day), status: 'read', reactions: [], replyTo: null },
  { id: 'm13', conversationId: 'conv4', userId: 'u21', text: 'Not yet but it\'s on my list! Share some photos?', createdAt: ago(1.9 * day), status: 'read', reactions: ['🌸'], replyTo: null },
  { id: 'm14', conversationId: 'conv5', userId: 'u10', text: 'Just deployed the new ML model. 99.2% accuracy!', createdAt: ago(6 * hour), status: 'read', reactions: ['🔥'], replyTo: null },
  { id: 'm15', conversationId: 'conv5', userId: 'u11', text: 'Nice! What architecture are you using?', createdAt: ago(5.5 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm16', conversationId: 'conv5', userId: 'u10', text: 'Transformer-based with custom attention mechanism', createdAt: ago(5 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm17', conversationId: 'conv5', userId: 'u21', text: 'That sounds incredible! Can you share the paper?', createdAt: ago(4.5 * hour), status: 'delivered', reactions: [], replyTo: null },
  { id: 'm18', conversationId: 'conv6', userId: 'u6', text: 'Did you see the latest JWST images? 🌌', createdAt: ago(1 * day), status: 'read', reactions: [], replyTo: null },
  { id: 'm19', conversationId: 'conv6', userId: 'u21', text: 'Yes! The detail is mind-blowing', createdAt: ago(23 * 3600000), status: 'read', reactions: ['🔭'], replyTo: null },
  { id: 'm20', conversationId: 'conv7', userId: 'u5', text: 'Want to play some ranked tonight? 🎮', createdAt: ago(8 * hour), status: 'read', reactions: [], replyTo: null },
  { id: 'm21', conversationId: 'conv7', userId: 'u21', text: 'Sure! I\'ll be on around 8pm', createdAt: ago(7 * 3600000), status: 'read', reactions: ['🎮'], replyTo: null },
  { id: 'm22', conversationId: 'conv8', userId: 'u7', text: 'How\'s the fitness journey going? 💪', createdAt: ago(10 * 3600000), status: 'read', reactions: [], replyTo: null },
  { id: 'm23', conversationId: 'conv8', userId: 'u21', text: 'Going strong! Your meal plans really help', createdAt: ago(9 * 3600000), status: 'read', reactions: ['💪'], replyTo: null },
  { id: 'm24', conversationId: 'conv9', userId: 'u12', text: 'Check out the new sustainable fabric I found!', createdAt: ago(3 * day), status: 'read', reactions: ['✨'], replyTo: null },
  { id: 'm25', conversationId: 'conv9', userId: 'u8', text: 'That looks amazing! Great for the new collection', createdAt: ago(2.9 * day), status: 'read', reactions: [], replyTo: null },
  { id: 'm26', conversationId: 'conv10', userId: 'u9', text: 'Try my new pasta recipe! It\'s incredible 🍝', createdAt: ago(6 * 3600000), status: 'read', reactions: ['😍'], replyTo: null },
  { id: 'm27', conversationId: 'conv10', userId: 'u21', text: 'Looks delicious! Making it tonight', createdAt: ago(5 * 3600000), status: 'delivered', reactions: [], replyTo: null },
];

/* === Demo Notifications === */
export const demoNotifications = [
  { id: 'n1', type: 'like', userId: 'u2', postId: 'p21', read: false, createdAt: ago(30 * 60000) },
  { id: 'n2', type: 'follow', userId: 'u8', read: false, createdAt: ago(1 * hour) },
  { id: 'n3', type: 'comment', userId: 'u1', postId: 'p21', text: 'Great work!', read: false, createdAt: ago(1.5 * hour) },
  { id: 'n4', type: 'repost', userId: 'u14', postId: 'p21', read: false, createdAt: ago(2 * hour) },
  { id: 'n5', type: 'like', userId: 'u10', postId: 'p21', read: true, createdAt: ago(3 * hour) },
  { id: 'n6', type: 'follow', userId: 'u11', read: true, createdAt: ago(4 * hour) },
  { id: 'n7', type: 'mention', userId: 'u3', postId: 'p24', text: '@demo_user', read: true, createdAt: ago(5 * hour) },
  { id: 'n8', type: 'like', userId: 'u4', postId: 'p4', read: true, createdAt: ago(6 * hour) },
  { id: 'n9', type: 'comment', userId: 'u6', postId: 'p4', text: 'Congrats on the launch!', read: true, createdAt: ago(7 * hour) },
  { id: 'n10', type: 'message', userId: 'u2', read: true, createdAt: ago(8 * hour) },
  { id: 'n11', type: 'like', userId: 'u12', postId: 'p21', read: true, createdAt: ago(9 * hour) },
  { id: 'n12', type: 'follow', userId: 'u16', read: true, createdAt: ago(10 * hour) },
  { id: 'n13', type: 'story', userId: 'u2', read: true, createdAt: ago(11 * hour) },
  { id: 'n14', type: 'like', userId: 'u14', postId: 'p4', read: true, createdAt: ago(12 * hour) },
  { id: 'n15', type: 'repost', userId: 'u10', postId: 'p4', read: true, createdAt: ago(14 * hour) },
  { id: 'n16', type: 'comment', userId: 'u11', postId: 'p4', text: 'This is awesome!', read: true, createdAt: ago(16 * hour) },
  { id: 'n17', type: 'follow', userId: 'u15', read: true, createdAt: ago(18 * hour) },
  { id: 'n18', type: 'like', userId: 'u17', postId: 'p21', read: true, createdAt: ago(20 * hour) },
  { id: 'n19', type: 'system', userId: null, text: 'Your account has been verified! ✅', read: true, createdAt: ago(1 * day) },
  { id: 'n20', type: 'like', userId: 'u20', postId: 'p4', read: true, createdAt: ago(2 * day) },
];

/* === Demo Communities === */
export const demoCommunities = [
  { id: 'com1', name: 'Technology', description: 'Discuss the latest in tech, gadgets, and innovations', icon: '💻', members: ['u1', 'u6', 'u10', 'u11', 'u20', 'u21'], banner: generatePostImage(50), createdAt: ago(300 * day) },
  { id: 'com2', name: 'Music Production', description: 'Share beats, get feedback, and collaborate', icon: '🎵', members: ['u3', 'u14', 'u8', 'u21'], banner: generatePostImage(51), createdAt: ago(250 * day) },
  { id: 'com3', name: 'Gaming', description: 'All things gaming - news, clips, and discussions', icon: '🎮', members: ['u5', 'u13', 'u21'], banner: generatePostImage(52), createdAt: ago(200 * day) },
  { id: 'com4', name: 'Photography', description: 'Share your shots and get constructive feedback', icon: '📸', members: ['u4', 'u2', 'u16', 'u21'], banner: generatePostImage(53), createdAt: ago(180 * day) },
  { id: 'com5', name: 'Design & Art', description: 'UI/UX, digital art, illustration, and creative design', icon: '🎨', members: ['u2', 'u8', 'u12', 'u18', 'u21'], banner: generatePostImage(54), createdAt: ago(150 * day) },
  { id: 'com6', name: 'Programming', description: 'Code, algorithms, open source, and developer life', icon: '⚡', members: ['u1', 'u10', 'u11', 'u20', 'u21'], banner: generatePostImage(55), createdAt: ago(120 * day) },
];

/* === Demo Saved Collections === */
export const demoCollections = [
  { id: 'sc1', name: 'Favorites', posts: ['p1', 'p3', 'p5', 'p8'], createdAt: ago(30 * day) },
  { id: 'sc2', name: 'Inspiration', posts: ['p2', 'p14', 'p22'], createdAt: ago(20 * day) },
  { id: 'sc3', name: 'Photography', posts: ['p3', 'p20', 'p31'], createdAt: ago(15 * day) },
  { id: 'sc4', name: 'Tech', posts: ['p4', 'p11', 'p28'], createdAt: ago(10 * day) },
  { id: 'sc5', name: 'Music', posts: ['p2', 'p9', 'p24', 'p25'], createdAt: ago(5 * day) },
  { id: 'sc6', name: 'Projects', posts: ['p1', 'p4', 'p17'], createdAt: ago(3 * day) },
];

/* === Trending Data === */
export const demoTrending = [
  { id: 't1', type: 'hashtag', name: '#AI', posts: 12500, category: 'Technology' },
  { id: 't2', type: 'topic', name: 'Web3 Development', posts: 8900, category: 'Technology' },
  { id: 't3', type: 'hashtag', name: '#DigitalArt', posts: 23400, category: 'Art' },
  { id: 't4', type: 'topic', name: 'Sustainable Fashion', posts: 15600, category: 'Fashion' },
  { id: 't5', type: 'hashtag', name: '#IndieMusic', posts: 9800, category: 'Music' },
  { id: 't6', type: 'topic', name: 'Space Exploration', posts: 31200, category: 'Science' },
  { id: 't7', type: 'hashtag', name: '#CleanCode', posts: 7600, category: 'Programming' },
  { id: 't8', type: 'topic', name: 'Healthy Living', posts: 18900, category: 'Lifestyle' },
];

/* === Saved Posts === */
export const demoSavedPosts = ['p1', 'p3', 'p5', 'p8', 'p14', 'p22'];

/* Load all demo data into state */
export function loadDemoData() {
  return {
    users: demoUsers,
    posts: demoPosts,
    stories: demoStories,
    shorts: demoShorts,
    conversations: demoConversations,
    messages: demoMessages,
    notifications: demoNotifications,
    communities: demoCommunities,
    savedPosts: demoSavedPosts,
    savedCollections: demoCollections,
    followRelationships: followMap,
  };
}

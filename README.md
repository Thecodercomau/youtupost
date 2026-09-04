# Youtupost

**Share what happens next.**

A next-generation social media platform built with vanilla HTML, CSS, and JavaScript.

## Features

- **Home Feed** — Posts, Stories, feed filters (For You, Following, Friends, Latest)
- **Explore** — Discovery grid, categories, trending topics
- **Shorts** — Fullscreen vertical video feed with swipe navigation
- **Messages** — Direct messages, group chats, typing indicators
- **Notifications** — Real-time notification feed with categories
- **Profiles** — User profiles with grids, followers/following, auras
- **Communities** — Create and join topic communities
- **Create** — Post creation with media upload, captions, hashtags
- **Saved** — Save posts and organize into collections
- **Youtupost AI** — AI-powered creative tools (simulated)
- **Settings** — Theme, accent, privacy, accessibility, and more

## Design System

- Dark futuristic UI with glass morphism
- Light, OLED, and system themes
- 7 accent color options (Violet, Cyan, Emerald, Solar, Rose, Ice, Default)
- 3 density levels (Compact, Comfortable, Spacious)
- Reduced motion support
- Fully responsive: phones, tablets, laptops, desktop, ultrawide

## Tech Stack

- HTML5 (semantic)
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- Vanilla JavaScript ES6+ Modules
- LocalStorage + IndexedDB
- History API (hash-based routing)
- Web APIs (IntersectionObserver, Pointer Events, etc.)

## Getting Started

1. Open `index.html` in a modern browser
2. Click **Explore Demo** to load with sample data
3. Or sign in with `demo@demo.com` / `demo`

## Demo Accounts

20 fictional demo users with posts, stories, shorts, messages, and communities pre-loaded.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| H | Home |
| E | Explore |
| S | Search |
| M | Messages |
| N | Notifications |
| C | Create |
| P | Profile |
| Esc | Close modal |

## Project Structure

```
youtupost/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   ├── variables.css      # Design tokens
│   ├── base.css           # Reset & typography
│   ├── layout.css         # Sidebar, topbar, grid
│   ├── components.css     # Buttons, cards, posts
│   ├── animations.css     # Motion system
│   ├── forms.css          # Form elements
│   ├── modals.css         # Modal system
│   ├── themes.css         # Theme variants
│   └── responsive.css     # Breakpoints
├── js/
│   ├── app.js             # Entry point
│   ├── state.js           # State management
│   ├── storage.js         # LocalStorage/IndexedDB
│   ├── utils.js           # Utilities
│   ├── router.js          # Client-side routing
│   ├── icons.js           # SVG icon system
│   ├── components/
│   │   ├── sidebar.js
│   │   ├── post.js
│   │   ├── comments.js
│   │   ├── story.js
│   │   ├── modal.js
│   │   └── toast.js
│   ├── pages/
│   │   ├── auth.js
│   │   ├── home.js
│   │   ├── explore.js
│   │   ├── shorts.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── profile.js
│   │   ├── settings.js
│   │   ├── communities.js
│   │   ├── saved.js
│   │   ├── create.js
│   │   ├── ai.js
│   │   └── search.js
│   ├── services/
│   │   └── services.js    # Service layer
│   └── demo/
│       └── data.js        # Demo data (20+ users, 30+ posts)
└── assets/
    ├── icons/
    └── images/
```

## Future Backend

The architecture is designed for Supabase integration:

- Service layer (`services.js`) abstracts all data operations
- State management supports real-time subscriptions
- Data models are structured for database tables
- Authentication architecture is replaceable

## License

Demo project — for educational purposes.

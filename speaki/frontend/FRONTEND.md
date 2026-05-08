# Speaki Frontend - Modern Real-time Chat App

Built with **Next.js 16**, **Tailwind CSS**, **Framer Motion**, and **WebSockets**.

## 🎨 Design System

### Color Palette (Dark Mode)
- **Background**: `#0f0f11` - Primary bg color
- **Card**: `#18181b` - Surface/card color
- **Border**: `#27272a` - Subtle borders
- **Primary Text**: `#f4f4f5` - Main text
- **Secondary Text**: `#a1a1aa` - Muted text
- **Accent**: `#6366f1` - Action/highlight color (Indigo)

### Design Features
- Minimal, clean aesthetic
- Rounded components (border-radius ~20px)
- Smooth animations via Framer Motion
- Soft shadows and subtle gradients
- Gen-Z styled UI

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── home/              # Home page - discover people
│   ├── chat/[id]/         # Chat page - 1:1 conversations
│   ├── circles/           # Circles page - communities
│   ├── profile/           # User profile page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root redirect to /home
│   └── globals.css        # Global dark theme styles
│
├── components/            # Reusable React components
│   ├── ChatBubble.tsx     # Chat message bubble
│   ├── UserCard.tsx       # User discovery card
│   ├── CircleCard.tsx     # Circle/community card
│   └── Navbar.tsx         # Top navigation bar
│
├── lib/                   # Utilities and helpers
│   ├── api.ts             # Axios API client with interceptors
│   └── websocket.ts       # WebSocket client class
│
└── store/                 # State management (Zustand)
    └── useUserStore.ts    # Global user state
```

## 🚀 Features

### Pages

**Home Page** (`/home`)
- Fetches matches from `GET /matches` endpoint
- Displays user cards in responsive grid
- Shows username, interests, intent, online status
- Smooth fade-in animations with staggered delays
- Click to open chat with user
- Loading and empty states

**Chat Page** (`/chat/[id]`)
- 1:1 real-time messaging
- Message bubbles with different styles for own/other messages
- Timestamps and user info
- Auto-refresh messages every 2 seconds
- Send message form with validation

**Circles Page** (`/circles`)
- Browse and discover communities
- Join/leave circles
- Circle information: name, description, member count
- Create new circle button
- Empty state handling

**Profile Page** (`/profile`)
- View user information
- Edit bio and interests
- Add/remove interests freely
- Save changes to backend
- Display profile picture and email

**Auth Pages** (`/login`, `/register`)
- Beautiful login form
- Registration with password confirmation
- Form validation
- Error messages
- Redirect on success

### Components

**UserCard**
- Avatar/initial fallback
- Username and intent
- Interest chips (max 3 + count badge)
- Online status indicator
- Hover animation (scale and lift)
- Connect button

**ChatBubble**
- Own vs. other message styling
- Timestamps
- User info for group display
- Smooth slide-in animation
- Proper message grouping

**CircleCard**
- Cover image or gradient
- Circle name and description
- Member count
- Join status badge
- Hover effects

**Navbar**
- Logo with brand color
- Navigation links
- Current page highlight
- Mobile-responsive menu
- User avatar and logout button

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Styling & Animation
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion 11** - Smooth animations

### State Management & Data
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **WebSockets** - Real-time bidirectional communication

## 📦 Dependencies

```json
{
  "dependencies": {
    "axios": "^1.7.0",
    "framer-motion": "^11.2.0",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "zustand": "^4.5.0"
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### API Base URL

The API client in `lib/api.ts` defaults to:
- API: `http://localhost:8000/api`
- WebSocket: `ws://localhost:8000/ws`

## 🎯 API Integration

### User API Endpoints

```typescript
// Get matches/users to discover
GET /matches

// Get user profile
GET /users/:id

// Update user profile
PUT /users/:id

// Search users
GET /users/search?q=query
```

### Chat API Endpoints

```typescript
// Get all chats
GET /chats

// Get messages from a chat
GET /chats/:id/messages

// Send a message
POST /chats/:id/messages { message: string }

// Create new chat with user
POST /chats { user_id: string }
```

### Circle API Endpoints

```typescript
// List all circles
GET /circles

// Get circle details
GET /circles/:id

// Create circle
POST /circles { name, description }

// Join circle
POST /circles/:id/join

// Leave circle
POST /circles/:id/leave
```

### Auth API Endpoints

```typescript
// Login
POST /auth/login { email, password }

// Register
POST /auth/register { email, password, username }

// Logout
POST /auth/logout
```

## 🔐 Authentication

- JWT tokens stored in localStorage
- Automatic token injection in API requests via axios interceptor
- Auto-redirect to login on 401 response
- Token persistence across page reloads

## 💾 State Management

### useUserStore (Zustand)

```typescript
{
  currentUser: User | null,
  token: string | null,
  isAuthenticated: boolean,
  setCurrentUser: (user) => void,
  setToken: (token) => void,
  login: (user, token) => void,
  logout: () => void
}
```

## 🎬 Animation Patterns

**Container Animations**
- Staggered children: 0.1s delay between items
- Fade-in + translate effects

**Hover Effects**
- Scale up (1.02-1.05)
- Lift effect (negative y-transform)
- Border color transitions

**Loading States**
- Pulse animation on skeleton loaders
- 2s repeat cycle

**Entry Animations**
- Initial opacity: 0
- Initial y: 10-20px
- Easing: 'easeOut'

## 📱 Responsive Design

- Mobile-first approach
- Grid: 1 column on mobile, 2 on tablet, 3+ on desktop
- Navbar: Compact on mobile, full on desktop
- Touch-friendly button sizes (44x44px minimum)

## 🚦 Running the Application

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## 📝 Notable Implementation Details

1. **Dynamic Routes**: Chat page uses `/chat/[id]` for dynamic user conversations
2. **Protected Routes**: All pages check `isAuthenticated` and redirect to login
3. **Auto-refresh**: Chat messages auto-refresh every 2 seconds (can be upgraded to WebSockets)
4. **Interest Tags**: Can add/remove interests with Enter key support
5. **Token Persistence**: Tokens and user data stored in localStorage
6. **Error Handling**: API errors display user-friendly messages
7. **Loading States**: Skeleton loaders with pulse animations

## 🔄 WebSocket Integration

The `lib/websocket.ts` provides a WebSocket client with:
- Auto-reconnection (max 5 attempts)
- Message type-based event system
- Token-based authentication
- Graceful disconnection handling

### Usage Example

```typescript
import { wsClient } from '@/lib/websocket';

// Connect
await wsClient.connect(token);

// Listen for messages
wsClient.on('message', (data) => {
  console.log('New message:', data);
});

// Send message
wsClient.send('message', { text: 'Hello' });

// Disconnect
wsClient.disconnect();
```

## 🎨 Tailwind Color Utilities

Custom theme colors are available in Tailwind classes:
- `bg-bg` - Background color
- `bg-card` - Card background
- `border-border` - Border color
- `text-primary` - Primary text
- `text-secondary` - Secondary text
- `bg-accent`, `text-accent` - Accent color

## 📚 Styling Best Practices

1. Use semantic color names (primary, secondary, accent)
2. Round corners consistently (~20px for cards, ~12px for inputs)
3. Apply soft shadows: `shadow-sm`, `shadow-md`
4. Use Framer Motion for all animations
5. Implement loading states for async operations
6. Always provide empty states in lists

---

Built with ❤️ for Speaki - a modern, real-time chat application.

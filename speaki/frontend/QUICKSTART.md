# Speaki Frontend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running at `http://localhost:8000`

### Installation

```bash
# Navigate to frontend directory
cd speaki/backend/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Configuration

### Set API & WebSocket URLs

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 📖 Architecture Overview

### Pages Structure
```
/ → redirects to /home
├── /home           - User discovery & matching
├── /chat/[id]      - 1:1 real-time chat
├── /circles        - Community discovery
├── /profile        - User profile management
├── /login          - Authentication
└── /register       - Account creation
```

### Key Components
- **UserCard** - Displays user info with interests & online status
- **ChatBubble** - Message UI with timestamps
- **CircleCard** - Community card with member count
- **Navbar** - Navigation with active page highlight

### State Management (Zustand)
```
useUserStore
├── currentUser (User object)
├── token (JWT)
├── isAuthenticated (boolean)
└── methods: login(), logout(), setCurrentUser()
```

### API Integration (Axios)
- Base URL: `NEXT_PUBLIC_API_URL`
- Auto token injection via interceptor
- Auto-redirect on 401
- Organized by resource: `userAPI`, `chatAPI`, `circleAPI`, `authAPI`

## 🎨 Design System

### Colors (Dark Mode)
```css
--color-bg: #0f0f11        /* Primary background */
--color-card: #18181b      /* Card surface */
--color-border: #27272a    /* Borders & dividers */
--color-primary: #f4f4f5   /* Main text */
--color-secondary: #a1a1aa /* Muted text */
--color-accent: #6366f1    /* Action colors */
```

### Styling Approach
- Tailwind CSS v4 utility classes
- Custom theme colors as Tailwind variables
- Framer Motion for all animations
- Consistent 20px border radius on cards

## 📱 Features

### Authentication Flow
1. User registers at `/register` or logs in at `/login`
2. Backend returns JWT token
3. Token stored in localStorage
4. Token auto-injected in all API requests
5. Auto-redirect to login on token expiration

### Home Page - User Discovery
- Fetches matches from `GET /matches` API
- Displays responsive grid of UserCards
- Cards show: avatar, username, interests, online status
- Click card to start chat
- Loading skeleton states with animations

### Chat - Real-time Messaging
- Displays conversation bubbles
- Own messages right-aligned (accent color)
- Other messages left-aligned (card color)
- Auto-refresh messages every 2 seconds
- Message form with send button

### Circles - Communities
- Browse all circles
- See member count and description
- Join/leave circles
- Create new circle button
- Shows "Joined" badge for member circles

### Profile - User Management
- View profile picture, username, email
- Edit bio with textarea
- Add/remove interests (with + button or Enter key)
- Save changes to backend
- Loading state + success feedback

## 🔄 API Integration

### Authentication
```typescript
POST /auth/login
POST /auth/register
POST /auth/logout
```

### Users
```typescript
GET /matches           // Get users to discover
GET /users/:id         // Get user profile
PUT /users/:id         // Update profile
GET /users/search      // Search users
```

### Chat
```typescript
GET /chats             // List chats
GET /chats/:id/messages
POST /chats/:id/messages
POST /chats            // Create new chat
```

### Circles
```typescript
GET /circles
GET /circles/:id
POST /circles
POST /circles/:id/join
POST /circles/:id/leave
```

## 🎬 Animation Features

### Hover Effects
- Cards scale up 1.02-1.05x on hover
- Subtle lift effect (negative translate-y)
- Border color transitions to accent

### Entry Animations
- Page titles fade in from top
- Cards stagger in with 0.1s delay
- 0.5s duration with easeOut timing

### Loading States
- Skeleton placeholders pulse
- 2-second repeat animation
- Smooth fade transitions

### Interactions
- Button press: scale down 0.98x
- Hover: scale up 1.05x
- Smooth 200ms transitions

## 🛠️ Development Tips

### Debugging
- Use browser DevTools for React debugging
- Check Network tab for API calls
- Look for token in localStorage
- WebSocket traffic in Network tab

### Common Issues

**"Cannot fetch /matches"**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` is correct

**"Redirecting to login"**
- Token may be expired
- Check localStorage for valid token
- Try logging in again

**CSS not loading**
- Run `npm run dev` to see errors
- Clear `.next` cache: `rm -rf .next`

## 📦 Project Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Production
npm run build            # Create optimized build
npm run start            # Run production server

# Linting
npm run lint             # Check for issues

# Cleaning
rm -rf .next            # Clear build cache
```

## 🔌 WebSocket Integration (Optional Enhancement)

The `wsClient` from `lib/websocket.ts` supports:
- Real-time message delivery
- Auto-reconnection with exponential backoff
- Type-based message routing
- Easy subscribe/unsubscribe pattern

### Enable WebSocket for Chat
```typescript
// In chat/[id]/page.tsx
await wsClient.connect(currentUser.id);
wsClient.on('message', (data) => {
  setMessages(prev => [...prev, data]);
});
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t speaki-frontend .
docker run -p 3000:3000 speaki-frontend
```

### Environment Variables for Production
- `NEXT_PUBLIC_API_URL` - Production API URL
- `NEXT_PUBLIC_WS_URL` - Production WebSocket URL

## 📞 Support

For issues or questions:
1. Check `FRONTEND.md` for detailed component docs
2. Review error messages in browser console
3. Ensure backend is running and accessible
4. Verify environment variables are set correctly

---

Happy coding! Build amazing features with Speaki! 🎉

# Speaki Frontend - Developer Quick Start

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running at configured URL
- Environment variables set

### Setup

```bash
# 1. Navigate to frontend
cd speaki/frontend

# 2. Install dependencies
npm install

# 3. Set environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# 4. Start development server
npm run dev

# Open http://localhost:3000 in browser
```

---

## 📱 User Flow for Testing

### 1. **Register**
- Go to `/register`
- Create account: username, email, password
- Redirects to `/onboarding`

### 2. **Onboarding**
- Select interests (minimum 1)
- Select intention (dating, friendship, community, etc.)
- Click "Complete Setup"

### 3. **Home Page**
- View matched users as cards
- Click card to start chatting
- See interests, online status, etc.

### 4. **Chat**
- Send/receive messages in real-time
- See typing indicator
- Check message status (sent/delivered/seen)

### 5. **Circles**
- Browse communities
- Join circles
- See member count and description

### 6. **Profile**
- View your profile
- Click "Edit Profile" to update interests/bio
- Changes save to backend

---

## 🔧 Development Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

---

## 📂 Project Structure Summary

```
src/
├── app/
│   ├── layout.tsx              # Root layout + ClientProvider
│   ├── globals.css             # Dark theme
│   ├── page.tsx                # Redirect /→/home
│   ├── login/page.tsx          # Auth page
│   ├── register/page.tsx       # Registration → onboarding
│   ├── onboarding/page.tsx     # Setup flow
│   ├── home/page.tsx           # Feed
│   ├── chat/[id]/page.tsx      # Messaging
│   ├── circles/page.tsx        # Communities
│   └── profile/page.tsx        # Profile
├── components/
│   ├── ClientProvider.tsx      # App initialization
│   ├── Navbar.tsx              # Navigation
│   ├── ChatBubble.tsx          # Messages
│   ├── UserCard.tsx            # Users
│   └── CircleCard.tsx          # Circles
├── lib/
│   ├── api.ts                  # Axios service
│   └── websocket.ts            # WebSocket client
└── store/
    └── useUserStore.ts         # Zustand
```

---

## 🎨 Theming

### Dark Colors (CSS Variables)
All colors defined in `src/app/globals.css`:
```css
--color-bg: #0f0f11
--color-card: #18181b
--color-border: #27272a
--color-primary: #f4f4f5
--color-secondary: #a1a1aa
--color-accent: #6366f1
```

### Using Colors in Components
```tsx
// Use Tailwind utility classes
<div className="bg-bg text-primary border border-border" />

// Or with accent
<button className="bg-accent text-white" />
```

---

## 🔒 Authentication Flow

### Components Involved
1. **AuthAPI** (`lib/api.ts`) - HTTP calls
2. **UserStore** (`store/useUserStore.ts`) - State
3. **Login/Register Pages** - UI
4. **axios Interceptor** - Auto token injection
5. **Protected Pages** - Route guards

### JWT Token
- Stored in `localStorage` (key: `token`)
- Sent in `Authorization: Bearer {token}` header
- Auto-refreshed/handled by backend
- 401 response → logout + redirect to login

---

## 💬 Real-Time Messaging

### WebSocket Flow
1. **Connect**: `await wsClient.connect(token)` in chat page
2. **Listen**: `wsClient.on('message', handler)`
3. **Send**: `wsClient.sendMessage(chatId, content)`
4. **Receive**: Handler receives message object
5. **Status**: `message_delivered` → `message_seen` events

### Message Object
```typescript
interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
  username?: string
  avatar_url?: string
  status?: 'sent' | 'delivered' | 'seen'
}
```

---

## 🐛 Debugging

### Enable Debug Logs
WebSocket and API calls already log to console:
```javascript
// In browser console
console.log('✅ WebSocket connected')
console.log('📨 WS Message:', data.type)
```

### Common Issues

**1. WebSocket connection fails**
- Check `NEXT_PUBLIC_WS_URL` in `.env.local`
- Ensure WebSocket is wss:// in production
- Check backend is running

**2. API 401 errors**
- Token might be expired
- Check localStorage token exists
- Verify backend sessions

**3. Components not updating**
- Ensure using `useUserStore()` hook
- Check Zustand store actions called
- Try hard refresh (Cmd+Shift+R)

---

## 📊 API Example Calls

### Login
```typescript
const response = await authAPI.login('user@example.com', 'password')
const { token, user } = response.data
useUserStore.getState().login(user, token)
```

### Get Matches
```typescript
const response = await userAPI.getMatches()
const users = response.data // Array of User objects
```

### Send Message (WebSocket)
```typescript
wsClient.sendMessage(chatId, 'Hello!')
```

### Update Profile
```typescript
await userAPI.updateProfile(userId, {
  interests: ['coding', 'music'],
  intent: 'friendship'
})
```

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables (Production)
Set these on your hosting platform:
```
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
```

### Deploy to Vercel
```bash
# Push to GitHub branch
git push origin feature-branch

# Vercel auto-builds from main
# Set env vars in Vercel dashboard
```

---

## 📚 Key Technologies

| Tech | Purpose | Version |
|------|---------|---------|
| Next.js | Framework | 16.2.4 |
| React | UI Library | 19.2.4 |
| TypeScript | Type Safety | 5 |
| Tailwind CSS | Styling | 4 |
| Framer Motion | Animations | 11.2.0 |
| Zustand | State | 4.5.0 |
| Axios | HTTP | 1.7.0 |

---

## 📖 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Zustand**: https://github.com/pmndrs/zustand
- **TypeScript**: https://www.typescriptlang.org

---

## 💡 Tips & Best Practices

1. **Always use `className` in Tailwind** (not inline styles)
2. **Keep animations smooth** (duration: 0.3-0.6s)
3. **Use `'use client'`** for interactive components
4. **Error handling** - Wrap API calls in try/catch
5. **Loading states** - Always show loading UI
6. **Responsive** - Use md:, lg: breakpoints
7. **Type safety** - Define interfaces for data
8. **Reusable components** - Props over hardcoding

---

## 🤝 Contributing

When adding new features:
1. Create feature branch: `git checkout -b feature/my-feature`
2. Follow project structure
3. Add TypeScript types
4. Use existing components/utilities
5. Test on mobile and desktop
6. Commit with clear messages

---

## ❓ Need Help?

- Check existing pages for patterns
- Review component props
- Look at API examples in `lib/api.ts`
- Check WebSocket examples in `src/app/chat/[id]/page.tsx`
- Inspect store in `src/store/useUserStore.ts`

---

**Happy coding! 🚀**

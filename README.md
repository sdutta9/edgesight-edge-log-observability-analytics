# Cloudflare Workers Fullstack Template

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sdutta9/edgesight-edge-log-observability-analytics))

A production-ready fullstack application template built on Cloudflare Workers. Features a reactive frontend with React, Vite, and shadcn/ui, powered by a Hono-based API with Durable Objects for stateful data management (Users, ChatBoards, Messages). Includes TypeScript end-to-end, TanStack Query, Tailwind CSS, and seamless deployment to Cloudflare's global edge network.

## ✨ Key Features

- **Edge-Native API**: Hono router with CORS, logging, and error handling.
- **Durable Objects**: Per-entity storage for Users and ChatBoards with built-in indexing and pagination.
- **Reactive UI**: Modern React 18 app with routing, query caching, and theming.
- **UI Components**: Pre-configured shadcn/ui with Tailwind CSS animations and dark mode.
- **Type-Safe**: Full TypeScript support across frontend, worker, and shared types.
- **Offline-First Demo Data**: Seeded with mock users, chats, and messages.
- **Development Workflow**: Hot reload for frontend, live reload for worker routes.
- **Production-Ready**: Optimized builds, error reporting, and Cloudflare analytics.

## 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Runtime** | Cloudflare Workers, Durable Objects |
| **API** | Hono, TypeScript |
| **Frontend** | React 18, Vite, React Router, TanStack Query |
| **UI** | shadcn/ui, Tailwind CSS, Lucide Icons, Framer Motion |
| **Data** | Shared types, mock data seeding |
| **Utils** | Zod, Immer, Sonner (toasts), clsx, tw-merge |
| **Dev Tools** | Bun, ESLint, TypeScript 5 |

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended for speed)
- [Cloudflare Account](https://dash.cloudflare.com/) (free tier sufficient)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation
```bash
bun install
```

### Development
```bash
# Start dev server (frontend + worker proxy)
bun dev

# In another terminal, generate types from worker
bun cf-typegen
```

Open [http://localhost:3000](http://localhost:3000) to view the app. API endpoints available at `/api/*`.

**Available Endpoints** (auto-seeded on first request):
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user `{ name: string }`
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat `{ title: string }`
- `GET /api/chats/:chatId/messages` - List messages
- `POST /api/chats/:chatId/messages` - Send `{ userId: string, text: string }`
- Delete endpoints for bulk/single operations

### Build for Production
```bash
bun build
```

## 📚 Usage

### Frontend Customization
- Replace `src/pages/HomePage.tsx` with your app.
- Use `src/lib/api-client.ts` for type-safe API calls.
- Leverage shadcn/ui components from `@/components/ui/*`.
- Hooks: `useTheme`, `useMobile`, TanStack Query.

### Backend Customization
- Add routes in `worker/user-routes.ts`.
- Extend entities in `worker/entities.ts` (uses `IndexedEntity` base).
- Shared types: `shared/types.ts`.

### Example API Call (Frontend)
```tsx
import { api } from '@/lib/api-client';
import type { User } from '@shared/types';

const users = await api<User[]>('/api/users');
```

## ☁️ Deployment

1. **Login to Wrangler**:
   ```bash
   wrangler login
   ```

2. **Deploy**:
   ```bash
   bun deploy
   ```
   This builds the frontend assets and deploys the Worker + Pages bundle.

3. **Custom Domain** (optional):
   ```bash
   wrangler pages deploy --project-name YOUR_PROJECT
   ```

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sdutta9/edgesight-edge-log-observability-analytics))

**Note**: Durable Objects migrate automatically. First deploy seeds demo data.

## 🔧 Configuration

- `wrangler.jsonc`: Worker config (DO bindings, assets).
- `tailwind.config.js`: Custom themes/animations.
- `vite.config.ts`: Proxy API to worker in dev.
- Environment vars via Cloudflare Dashboard.

## 🤝 Contributing

1. Fork and clone.
2. `bun install`.
3. `bun dev`.
4. Submit PRs to `main`.

Report issues for bugs or feature requests.

## 📄 License

MIT. See [LICENSE](LICENSE) for details.

---

⭐ **Built with [Cloudflare Workers](https://workers.cloudflare.com)**
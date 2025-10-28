# Technology Stack

**Modern Next.js Application with Type-Safe APIs**

---

## ✅ Core Stack

### Frontend
- **Next.js 14** - App Router, Server Components, Server Actions
- **React 18** - Latest features with concurrent rendering
- **TypeScript** - Strict mode, full type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components built on Radix UI

### Backend
- **tRPC** - End-to-end type-safe APIs
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Document database with Atlas
- **NextAuth.js v5** - Authentication
- **Zod** - Runtime validation & type inference

### State Management
- **React Query** (@tanstack/react-query) - Server state
- **Zustand** - Client state (lightweight)
- **tRPC** - Automatic cache management

### UI Components (shadcn/ui)
- **Radix UI** - Accessible primitives
  - Dialog
  - Dropdown Menu
  - Toast
  - Tabs
  - Select
  - Avatar
  - Label
  - Separator
- **Vaul** - Beautiful drawer component
- **Lucide React** - Icon library
- **CVA** (class-variance-authority) - Component variants

---

## 🎯 Why This Stack?

### tRPC Benefits
✅ **End-to-end type safety** - No code generation needed
✅ **Automatic type inference** - Types flow from server to client
✅ **Better DX** - Autocomplete everywhere
✅ **Less code** - No need for REST/GraphQL schemas
✅ **Zod integration** - Runtime validation + TypeScript types

### Example: Type-Safe API Call

```typescript
// Server (src/server/routers/prompt.ts)
export const promptRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      return getPrompts(input);
    }),
});

// Client (React component)
const { data, isLoading } = trpc.prompt.getAll.useQuery({
  category: 'engineering',
  limit: 20,
});
// ✅ Fully typed! TypeScript knows the exact shape of `data`
// ✅ Autocomplete for all fields
// ✅ Compile-time errors if you use wrong types
```

### Tailwind + shadcn/ui Benefits
✅ **No CSS files** - All styling in components
✅ **Consistent design** - Pre-built theme system
✅ **Accessible** - WCAG compliant components
✅ **Customizable** - Full control over styling
✅ **Copy-paste** - Own the code, no black boxes

### Example: Drawer Component

```typescript
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <div className="p-4">
      {/* Your content */}
    </div>
  </DrawerContent>
</Drawer>
```

---

## 📁 Project Structure

```
engify-ai-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       └── trpc/[trpc]/      # tRPC API handler
│   │           └── route.ts
│   ├── server/                   # tRPC Server
│   │   ├── trpc.ts               # tRPC setup
│   │   └── routers/
│   │       ├── _app.ts           # Main router
│   │       ├── prompt.ts         # Prompt routes
│   │       └── user.ts           # User routes
│   ├── lib/
│   │   ├── db/
│   │   │   └── schema.ts         # Zod schemas
│   │   ├── trpc/
│   │   │   ├── client.ts         # tRPC client
│   │   │   └── Provider.tsx      # tRPC provider
│   │   └── utils.ts              # Utility functions
│   └── components/
│       └── ui/                   # shadcn/ui components
├── docs/                         # Documentation
├── public/                       # Static assets
└── scripts/                      # Build scripts
```

---

## 🔧 Configuration

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Next.js plugin configured

### Tailwind CSS (`tailwind.config.ts`)
- shadcn/ui theme
- Dark mode support
- Custom animations

### ESLint (`.eslintrc.json`)
- No `any` types
- Unused variables flagged
- TypeScript strict rules

---

## 📦 Key Dependencies

### Production
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "@trpc/server": "^10.45.0",
  "@trpc/client": "^10.45.0",
  "@trpc/react-query": "^10.45.0",
  "@tanstack/react-query": "^5.28.0",
  "zod": "^3.23.0",
  "mongodb": "^6.3.0",
  "next-auth": "^5.0.0-beta.20",
  "tailwindcss": "^3.4.0",
  "vaul": "^0.9.0",
  "lucide-react": "^0.344.0"
}
```

### Development
```json
{
  "typescript": "^5.3.0",
  "eslint": "^8.57.0",
  "prettier": "^3.2.0",
  "husky": "^9.0.0",
  "vitest": "^1.3.0"
}
```

---

## 🚀 Development Workflow

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI
```

### 3. Run Development Server
```bash
pnpm dev
```

### 4. Type Check
```bash
pnpm type-check
```

### 5. Lint & Format
```bash
pnpm lint
pnpm format
```

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Slate
- **Accent**: Indigo
- **Destructive**: Red

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, comfortable line-height

### Spacing
- **Container**: max-w-7xl
- **Padding**: p-4, p-6, p-8
- **Gap**: gap-4, gap-6, gap-8

---

## 📊 Performance

### Optimization Strategies
- ✅ Server Components by default
- ✅ Client Components only when needed
- ✅ Image optimization (Next.js Image)
- ✅ Font optimization (next/font)
- ✅ Code splitting (automatic)
- ✅ API route caching
- ✅ React Query caching

### Bundle Size Targets
- **First Load JS**: < 100KB
- **Total Bundle**: < 500KB
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

---

## 🔐 Security

### Built-in Security
- ✅ Security headers (Next.js config)
- ✅ CSRF protection (NextAuth.js)
- ✅ XSS prevention (React escaping)
- ✅ SQL injection prevention (MongoDB parameterized queries)
- ✅ Input validation (Zod)
- ✅ Authentication (NextAuth.js)
- ✅ Rate limiting (planned)

---

## 🧪 Testing

### Testing Stack
- **Vitest** - Unit tests
- **Testing Library** - Component tests
- **Playwright** (planned) - E2E tests

### Test Coverage Targets
- **Overall**: 80%+
- **Lib**: 85%+
- **API Routes**: 75%+

---

## 📚 Documentation

- **[SETUP.md](../SETUP.md)** - Setup instructions
- **[CODE_QUALITY_STANDARDS.md](./CODE_QUALITY_STANDARDS.md)** - Code standards
- **[API_STANDARDS.md](./API_STANDARDS.md)** - API best practices
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - Security guidelines

---

## ✅ Summary

**This is a modern, production-ready Next.js application with**:
- ✅ Type-safe APIs (tRPC)
- ✅ Beautiful UI (Tailwind + shadcn/ui)
- ✅ Proper authentication (NextAuth.js)
- ✅ Database (MongoDB)
- ✅ Validation (Zod)
- ✅ Testing (Vitest)
- ✅ Code quality (ESLint, Prettier, Husky)

**Ready to scale to 1K+ users!** 🚀

**Last Updated**: 2025-10-27  
**Status**: Active Development

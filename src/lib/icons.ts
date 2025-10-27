/**
 * Centralized Icon Management
 *
 * Single source of truth for all Lucide icons used in the app.
 * Import icons from here instead of directly from lucide-react.
 *
 * Benefits:
 * - Easy to track which icons are used
 * - Prevents duplicate imports
 * - Easier to swap icon libraries if needed
 * - Better tree-shaking
 */

import {
  // Navigation & UI
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,

  // Actions
  Search,
  Copy,
  Check,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,

  // Status & Feedback
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,

  // Content
  Eye,
  EyeOff,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,

  // Files & Data
  File,
  FileText,
  Folder,
  FolderOpen,
  Inbox,
  Archive,

  // User & Account
  User,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  LogOut,
  LogIn,

  // Features
  Sparkles,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,

  // Navigation Icons
  Home,
  BookOpen,
  Library,
  Code,
  Terminal,

  // Misc
  MoreVertical,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  Bell,

  // Additional icons for patterns/learn pages
  Brain,
  Link,
  HelpCircle,
  Focus,
  Shield,
  TreePine,
  RefreshCw,
  Database,
  type LucideIcon,
,
  Lightbulb,
  Compass,
  Mail,
  Briefcase,
  X,
  Github,
  Server,
  Key,
  Wrench,
  TestTube2,
  FileSearch,
  GitCompare,
  TrendingUp,
  Layers,
  GraduationCap,
  Palette,
  Building2,
  DollarSign,
  Hash,
  Play,
  Wifi
} from 'lucide-react';

// Export all icons with descriptive names
export const Icons = {
  // Navigation & UI
  menu: Menu,
  close: X,
  arrowRight: ChevronRight,
  check: Check,
  left: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowRightAlt: ArrowRight,
  arrowLeft: ArrowLeft,

  // Actions
  search: Search,
  copy: Copy,
  checkAlt: Check,
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  download: Download,
  upload: Upload,
  share: Share2,

  // Status & Feedback
  warning: AlertTriangle,
  alertTriangle: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
  spinner: Loader2,
  cancel: XCircle,

  // Content
  view: Eye,
  hide: EyeOff,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  comment: MessageSquare,
  like: ThumbsUp,
  dislike: ThumbsDown,

  // Files & Data
  file: File,
  document: FileText,
  folder: Folder,
  folderOpen: FolderOpen,
  inbox: Inbox,
  archive: Archive,

  // User & Account
  user: User,
  users: Users,
  userAdd: UserPlus,
  userRemove: UserMinus,
  settings: Settings,
  logout: LogOut,
  login: LogIn,

  // Features
  sparkles: Sparkles,
  zap: Zap,
  trophy: Trophy,
  target: Target,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  barChart: BarChart,
  pieChart: PieChart,

  // Navigation
  home: Home,
  book: BookOpen,
  library: Library,
  code: Code,
  terminal: Terminal,

  // Misc
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  calendar: Calendar,
  clock: Clock,
  bell: Bell,

  // Pattern page icons
  brain: Brain,
  link: Link,
  help: HelpCircle,
  focus: Focus,
  shield: Shield,
  tree: TreePine,
  refresh: RefreshCw,
  database: Database,
} as const;

// Export type for icon names
export type IconName = keyof typeof Icons;

// Export LucideIcon type for component props
export type { LucideIcon 
  // Auto-added icons
  lightbulb: Lightbulb,
  compass: Compass,
  mail: Mail,
  briefcase: Briefcase,
  x: X,
  github: Github,
  server: Server,
  key: Key,
  tool: Wrench,
  testTube: TestTube2,
  fileSearch: FileSearch,
  gitCompare: GitCompare,
  trending: TrendingUp,
  layers: Layers,
  graduationCap: GraduationCap,
  palette: Palette,
  building: Building2,
  dollarSign: DollarSign,
  hash: Hash,
  play: Play,
  wifi: Wifi,
};

/**
 * Icon Usage Tracking
 *
 * Update this when adding icons to track where they're used
 */
export const iconUsage = {
  // Layout Components
  Header: ['sparkles', 'menu', 'close'],
  Sidebar: [
    'home',
    'sparkles',
    'book',
    'library',
    'trendingUp',
    'trophy',
    'settings',
  ],
  Footer: ['sparkles'],

  // Feature Components
  PromptCard: ['copy', 'check', 'view', 'star'],
  LoadingSpinner: ['spinner'],
  EmptyState: ['inbox'], // Dynamic - passed as prop

  // Pages
  HomePage: ['arrowRight', 'sparkles', 'target', 'trophy', 'zap'],
  LibraryPage: ['search', 'inbox'],

  // Future Components
  // WorkbenchPage: [],
  // DashboardPage: [],
  // SettingsPage: [],
} as const;

/**
 * Helper function to get icon by name
 * Useful for dynamic icon selection
 */
export function getIcon(name: IconName): LucideIcon {
  return Icons[name];
}

/**
 * Icon size presets
 * Use these for consistent sizing
 */
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
} as const;

export type IconSize = keyof typeof iconSizes;

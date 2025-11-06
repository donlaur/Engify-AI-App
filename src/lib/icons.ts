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
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ExternalLink,

  // Actions
  Search,
  Copy,
  Check,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share2,
  Send,

  // Status & Feedback
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Flag,

  // Content
  Eye,
  EyeOff,
  Star,
  Tag,
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
  Lock,

  // Features
  Sparkles,
  Zap,
  Trophy,
  Target,
  TrendingDown,
  BarChart,
  PieChart,

  // Navigation
  Home,
  BookOpen,
  Library,
  Code,
  Terminal,

  // Social
  Twitter,
  Linkedin,
  Facebook,

  // Additional
  Calculator,
  Rocket,
  Infinity,

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
  Bot,
  type LucideIcon,
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
  Wifi,
  Globe,
} from 'lucide-react';

// Export all icons with descriptive names
export const Icons = {
  // Navigation & UI
  menu: Menu,
  close: X,
  arrowRight: ChevronRight,
  chevronRight: ChevronRight, // Alias for breadcrumbs and navigation
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
  plus: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  trash: Trash2, // Alias for delete
  save: Save,
  download: Download,
  upload: Upload,
  share: Share2,
  send: Send,
  externalLink: ExternalLink,

  // Status & Feedback
  warning: AlertTriangle,
  alertTriangle: AlertTriangle,
  alertCircle: AlertCircle,
  error: AlertCircle,
  success: CheckCircle,
  checkCircle: CheckCircle,
  info: Info,
  spinner: Loader2,
  cancel: XCircle,
  flag: Flag,

  // Content
  view: Eye,
  eye: Eye, // Alias for view
  hide: EyeOff,
  star: Star,
  tag: Tag,
  heart: Heart,
  bookmark: Bookmark,
  comment: MessageSquare,
  messageSquare: MessageSquare,
  like: ThumbsUp,
  dislike: ThumbsDown,

  // Files & Data
  file: File,
  document: FileText,
  fileText: FileText,
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
  logOut: LogOut,
  login: LogIn,
  lock: Lock,

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
  bookOpen: BookOpen,
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
  helpCircle: HelpCircle, // Alias for help
  focus: Focus,
  shield: Shield,
  tree: TreePine,
  refresh: RefreshCw,
  refreshCw: RefreshCw, // Alias for refresh
  database: Database,
  bot: Bot,

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
  wrench: Wrench, // Alias for tool
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
  globe: Globe,

  // Social
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,

  // Additional
  calculator: Calculator,
  rocket: Rocket,
  infinity: Infinity,
} as const;

// Export type for icon names
export type IconName = keyof typeof Icons;

// Export LucideIcon type for component props
export type { LucideIcon };

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

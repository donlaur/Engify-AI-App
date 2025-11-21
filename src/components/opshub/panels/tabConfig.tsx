/**
 * Tab configuration and utilities for OpsHubTabs
 */

import { Icons } from '@/lib/icons';

export interface TabConfig {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  category: 'overview' | 'content' | 'management' | 'system';
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'barChart', category: 'overview' },
  { id: 'content', label: 'Content', icon: 'fileText', category: 'content' },
  { id: 'generator', label: 'Generator', icon: 'zap', category: 'content' },
  { id: 'prompts', label: 'Prompts', icon: 'code', category: 'content' },
  { id: 'patterns', label: 'Patterns', icon: 'brain', category: 'content' },
  { id: 'workflows', label: 'Workflows', icon: 'gitBranch', category: 'management' },
  { id: 'recommendations', label: 'Recommendations', icon: 'lightbulb', category: 'management' },
  { id: 'painpoints', label: 'Pain Points', icon: 'alertTriangle', category: 'management' },
  { id: 'users', label: 'Users', icon: 'users', category: 'management' },
  { id: 'queue', label: 'DLQ', icon: 'alertCircle', category: 'system' },
  { id: 'settings', label: 'Settings', icon: 'settings', category: 'system' },
  { id: 'feeds', label: 'Feeds', icon: 'newspaper', category: 'system' },
  { id: 'news', label: 'News', icon: 'newspaper', category: 'system' },
];

export const TAB_CATEGORIES = {
  overview: {
    label: 'Overview',
    tabs: TAB_CONFIGS.filter(t => t.category === 'overview').map(t => t.id),
  },
  content: {
    label: 'Content',
    tabs: TAB_CONFIGS.filter(t => t.category === 'content').map(t => t.id),
  },
  management: {
    label: 'Management',
    tabs: TAB_CONFIGS.filter(t => t.category === 'management').map(t => t.id),
  },
  system: {
    label: 'System',
    tabs: TAB_CONFIGS.filter(t => t.category === 'system').map(t => t.id),
  },
};

export const ALL_TABS = TAB_CONFIGS.map(t => t.id);


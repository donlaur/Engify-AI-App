/**
 * GitHub Integration
 * Allows users to connect their GitHub account and access repos
 */

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  size: number;
  updated_at: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  type: 'file' | 'dir';
  content?: string; // Base64 encoded
  encoding?: string;
}

export interface GitHubConnection {
  userId: string;
  accessToken: string;
  username: string;
  avatarUrl: string;
  connectedAt: Date;
  lastSyncedAt?: Date;
}

/**
 * GitHub API Client
 */
export class GitHubClient {
  private accessToken: string;
  private baseUrl = 'https://api.github.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get authenticated user
   */
  async getUser(): Promise<any> {
    return this.request('/user');
  }

  /**
   * List user's repositories
   */
  async listRepos(options: {
    type?: 'all' | 'owner' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    per_page?: number;
  } = {}): Promise<GitHubRepo[]> {
    const params = new URLSearchParams({
      type: options.type || 'all',
      sort: options.sort || 'updated',
      per_page: (options.per_page || 30).toString(),
    });

    return this.request(`/user/repos?${params}`);
  }

  /**
   * Get repository details
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  /**
   * List repository contents
   */
  async listContents(
    owner: string,
    repo: string,
    path: string = ''
  ): Promise<GitHubFile[]> {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`);
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<GitHubFile> {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`);
  }

  /**
   * Get file content decoded
   */
  async getFileContentDecoded(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    const file = await this.getFileContent(owner, repo, path);
    
    if (file.encoding === 'base64' && file.content) {
      return Buffer.from(file.content, 'base64').toString('utf-8');
    }
    
    return file.content || '';
  }

  /**
   * Search code in repository
   */
  async searchCode(
    owner: string,
    repo: string,
    query: string
  ): Promise<any> {
    const q = `${query} repo:${owner}/${repo}`;
    return this.request(`/search/code?q=${encodeURIComponent(q)}`);
  }

  /**
   * Get repository tree (all files)
   */
  async getTree(
    owner: string,
    repo: string,
    branch: string = 'main',
    recursive: boolean = true
  ): Promise<any> {
    const params = recursive ? '?recursive=1' : '';
    return this.request(`/repos/${owner}/${repo}/git/trees/${branch}${params}`);
  }

  /**
   * List branches
   */
  async listBranches(owner: string, repo: string): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/branches`);
  }

  /**
   * Get commit history
   */
  async listCommits(
    owner: string,
    repo: string,
    options: {
      sha?: string;
      path?: string;
      per_page?: number;
    } = {}
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (options.sha) params.append('sha', options.sha);
    if (options.path) params.append('path', options.path);
    if (options.per_page) params.append('per_page', options.per_page.toString());

    const query = params.toString();
    return this.request(`/repos/${owner}/${repo}/commits${query ? '?' + query : ''}`);
  }

  /**
   * Make authenticated request
   */
  private async request(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Engify-AI-App',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText} - ${error.message || ''}`
      );
    }

    return response.json();
  }
}

/**
 * GitHub OAuth helpers
 */
export const GITHUB_OAUTH = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3005/api/auth/github/callback',
  scopes: ['repo', 'read:user', 'user:email'],
};

/**
 * Get GitHub OAuth URL
 */
export function getGitHubAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH.clientId,
    redirect_uri: GITHUB_OAUTH.redirectUri,
    scope: GITHUB_OAUTH.scopes.join(' '),
    state: state || '',
  });

  return `https://github.com/login/oauth/authorize?${params}`;
}

/**
 * Exchange code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  scope: string;
}> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_OAUTH.clientId,
      client_secret: GITHUB_OAUTH.clientSecret,
      code,
      redirect_uri: GITHUB_OAUTH.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Extract code context for AI
 */
export async function extractCodeContext(
  client: GitHubClient,
  owner: string,
  repo: string,
  options: {
    maxFiles?: number;
    maxFileSize?: number; // bytes
    includePatterns?: string[]; // e.g., ['*.ts', '*.tsx']
    excludePatterns?: string[]; // e.g., ['node_modules', 'dist']
  } = {}
): Promise<{
  files: Array<{ path: string; content: string; language: string }>;
  summary: string;
}> {
  const {
    maxFiles = 50,
    maxFileSize = 100000, // 100KB
    includePatterns = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.py', '*.java'],
    excludePatterns = ['node_modules', 'dist', 'build', '.git', 'vendor'],
  } = options;

  // Get repository tree
  const tree = await client.getTree(owner, repo, 'main', true);
  
  const files: Array<{ path: string; content: string; language: string }> = [];
  let processedFiles = 0;

  for (const item of tree.tree) {
    if (processedFiles >= maxFiles) break;
    if (item.type !== 'blob') continue;
    if (item.size > maxFileSize) continue;

    // Check exclude patterns
    if (excludePatterns.some(pattern => item.path.includes(pattern))) {
      continue;
    }

    // Check include patterns
    const matchesInclude = includePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(item.path);
    });

    if (!matchesInclude) continue;

    try {
      const content = await client.getFileContentDecoded(owner, repo, item.path);
      const language = getLanguageFromPath(item.path);

      files.push({
        path: item.path,
        content,
        language,
      });

      processedFiles++;
    } catch (error) {
      console.error(`Failed to fetch ${item.path}:`, error);
    }
  }

  const summary = `Repository: ${owner}/${repo}\nFiles analyzed: ${files.length}\nLanguages: ${[...new Set(files.map(f => f.language))].join(', ')}`;

  return { files, summary };
}

/**
 * Get language from file path
 */
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    swift: 'swift',
    kt: 'kotlin',
  };

  return languageMap[ext || ''] || 'plaintext';
}

/**
 * Build AI prompt with code context
 */
export function buildPromptWithCodeContext(
  userPrompt: string,
  codeContext: {
    files: Array<{ path: string; content: string; language: string }>;
    summary: string;
  }
): string {
  let prompt = `${codeContext.summary}\n\n`;
  prompt += `User Request: ${userPrompt}\n\n`;
  prompt += `Code Context:\n\n`;

  codeContext.files.forEach(file => {
    prompt += `File: ${file.path}\n`;
    prompt += `Language: ${file.language}\n`;
    prompt += `\`\`\`${file.language}\n`;
    prompt += file.content;
    prompt += `\n\`\`\`\n\n`;
  });

  return prompt;
}

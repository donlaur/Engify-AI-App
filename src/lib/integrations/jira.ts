/**
 * Jira API Integration
 *
 * Foundation for Jira integration to support:
 * - DORA metrics tracking
 * - Sprint analytics
 * - Ticket completion time
 * - Productivity reporting
 */

export interface JiraConfig {
  domain: string; // e.g., "yourcompany.atlassian.net"
  email: string; // Jira user email
  apiToken: string; // Jira API token (not password)
  projectKey?: string; // Default project key
}

export interface JiraIssue {
  id: string;
  key: string; // e.g., "PROJ-123"
  summary: string;
  description?: string;
  status: string;
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
  };
  creator?: {
    accountId: string;
    displayName: string;
  };
  created: Date;
  updated: Date;
  resolved?: Date;
  priority?: string;
  labels: string[];
  components: Array<{ name: string }>;
  timeTracking?: {
    originalEstimate?: string;
    remainingEstimate?: string;
    timeSpent?: string;
  };
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: Date;
  endDate?: Date;
  completeDate?: Date;
  goal?: string;
}

export interface DORAMetrics {
  deploymentFrequency: number; // Deployments per day/week/month
  leadTimeForChanges: number; // Hours from commit to production
  meanTimeToRecovery: number; // Hours to recover from failure
  changeFailureRate: number; // Percentage of deployments causing failure
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

/**
 * Jira API Client
 *
 * Provides methods to interact with Jira REST API
 */
export class JiraClient {
  private _config: JiraConfig;
  private baseUrl: string;
  private authHeader: string;

  constructor(config: JiraConfig) {
    this._config = config;
    this.baseUrl = `https://${config.domain}/rest/api/3`;

    // Basic auth: email + API token
    const credentials = Buffer.from(
      `${config.email}:${config.apiToken}`
    ).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  /**
   * Make authenticated request to Jira API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jira API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get Jira issue by key (e.g., "PROJ-123")
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const data = await this.request<{
      id?: string;
      key?: string;
      fields: Record<string, unknown>;
    }>(`/issue/${issueKey}`);

    const fields = data.fields || {};
    const status = fields.status as { name?: string } | undefined;
    const description = fields.description as
      | {
          content?: Array<{ content?: Array<{ text?: string }> }>;
        }
      | undefined;
    const assignee = fields.assignee as
      | {
          accountId?: string;
          displayName?: string;
          emailAddress?: string;
        }
      | undefined;
    const creator = fields.creator as
      | {
          accountId?: string;
          displayName?: string;
        }
      | undefined;
    const timetracking = fields.timetracking as
      | {
          originalEstimate?: string;
          remainingEstimate?: string;
          timeSpent?: string;
        }
      | undefined;
    const priority = fields.priority as { name?: string } | undefined;
    const components = fields.components as
      | Array<{ name?: string }>
      | undefined;
    const labels = fields.labels as string[] | undefined;

    return {
      id: data.id || '',
      key: data.key || '',
      summary: (fields.summary as string) || '',
      description: description?.content?.[0]?.content?.[0]?.text || '',
      status: status?.name || '',
      assignee:
        assignee && assignee.accountId && assignee.displayName
          ? {
              accountId: assignee.accountId,
              displayName: assignee.displayName,
              emailAddress: assignee.emailAddress,
            }
          : undefined,
      creator:
        creator && creator.accountId && creator.displayName
          ? {
              accountId: creator.accountId,
              displayName: creator.displayName,
            }
          : undefined,
      created: new Date((fields.created as string | undefined) || Date.now()),
      updated: new Date((fields.updated as string | undefined) || Date.now()),
      resolved: fields.resolutiondate
        ? new Date(fields.resolutiondate as string)
        : undefined,
      priority: priority?.name,
      labels: (labels || []) as string[],
      components:
        components?.map((c) => ({
          name: c.name || '',
        })) || [],
      timeTracking: timetracking
        ? {
            originalEstimate: timetracking.originalEstimate,
            remainingEstimate: timetracking.remainingEstimate,
            timeSpent: timetracking.timeSpent,
          }
        : undefined,
    };
  }

  /**
   * Search issues using JQL (Jira Query Language)
   */
  async searchIssues(
    jql: string,
    startAt = 0,
    maxResults = 50
  ): Promise<{
    issues: JiraIssue[];
    total: number;
    startAt: number;
    maxResults: number;
  }> {
    const params = new URLSearchParams({
      jql,
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
      fields:
        'id,key,summary,status,assignee,creator,created,updated,resolutiondate,priority,labels,components,timetracking',
    });

    interface JiraIssueResponse {
      issues: Array<{
        id: string;
        key: string;
        fields: {
          summary?: string;
          status?: { name?: string };
          assignee?: {
            accountId?: string;
            displayName?: string;
            emailAddress?: string;
          };
          creator?: { accountId?: string; displayName?: string };
          created?: string;
          updated?: string;
          resolutiondate?: string;
          priority?: { name?: string };
          labels?: string[];
          components?: Array<{ name?: string }>;
          timetracking?: {
            originalEstimate?: string;
            remainingEstimate?: string;
            timeSpent?: string;
          };
        };
      }>;
      total: number;
      startAt: number;
      maxResults: number;
    }

    const data = await this.request<JiraIssueResponse>(`/search?${params}`);

    return {
      issues: data.issues.map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary || '',
        description: '',
        status: issue.fields.status?.name || '',
        assignee:
          issue.fields.assignee &&
          issue.fields.assignee.accountId &&
          issue.fields.assignee.displayName
            ? {
                accountId: issue.fields.assignee.accountId,
                displayName: issue.fields.assignee.displayName,
                emailAddress: issue.fields.assignee.emailAddress,
              }
            : undefined,
        creator:
          issue.fields.creator &&
          issue.fields.creator.accountId &&
          issue.fields.creator.displayName
            ? {
                accountId: issue.fields.creator.accountId,
                displayName: issue.fields.creator.displayName,
              }
            : undefined,
        created: new Date(issue.fields.created || Date.now()),
        updated: new Date(issue.fields.updated || Date.now()),
        resolved: issue.fields.resolutiondate
          ? new Date(issue.fields.resolutiondate)
          : undefined,
        priority: issue.fields.priority?.name,
        labels: issue.fields.labels || [],
        components:
          issue.fields.components
            ?.map((c: { name?: string }) => ({
              name: c.name || '',
            }))
            .filter((c) => c.name) || [],
        timeTracking: issue.fields.timetracking
          ? {
              originalEstimate: issue.fields.timetracking.originalEstimate,
              remainingEstimate: issue.fields.timetracking.remainingEstimate,
              timeSpent: issue.fields.timetracking.timeSpent,
            }
          : undefined,
      })),
      total: data.total,
      startAt: data.startAt,
      maxResults: data.maxResults,
    };
  }

  /**
   * Get active sprints for a board
   */
  async getActiveSprints(boardId: number): Promise<JiraSprint[]> {
    interface JiraSprintResponse {
      values: Array<{
        id?: number;
        name?: string;
        state?: string;
        startDate?: string;
        endDate?: string;
        completeDate?: string;
        goal?: string;
      }>;
    }

    const data = await this.request<JiraSprintResponse>(
      `/board/${boardId}/sprint?state=active`
    );

    return data.values.map((sprint) => ({
      id: sprint.id || 0,
      name: sprint.name || '',
      state: (sprint.state || 'future') as 'future' | 'active' | 'closed',
      startDate: sprint.startDate ? new Date(sprint.startDate) : undefined,
      endDate: sprint.endDate ? new Date(sprint.endDate) : undefined,
      completeDate: sprint.completeDate
        ? new Date(sprint.completeDate)
        : undefined,
      goal: sprint.goal || undefined,
    }));
  }

  /**
   * Calculate DORA metrics from Jira issues
   *
   * Note: This is a foundation. Real DORA metrics require:
   * - Integration with CI/CD (deployment frequency)
   * - Integration with monitoring (MTTR)
   * - Change failure tracking
   */
  async calculateDORAMetrics(
    projectKey: string,
    startDate: Date,
    endDate: Date
  ): Promise<DORAMetrics> {
    // Get all issues in date range
    const jql = `project = ${projectKey} AND updated >= "${startDate.toISOString().split('T')[0]}" AND updated <= "${endDate.toISOString().split('T')[0]}" ORDER BY updated DESC`;
    const searchResults = await this.searchIssues(jql, 0, 1000);

    // Calculate metrics (simplified - real implementation needs CI/CD data)
    const resolvedIssues = searchResults.issues.filter(
      (issue) => issue.resolved
    );
    const _totalIssues = searchResults.issues.length;

    // Lead time: average time from created to resolved
    const leadTimes = resolvedIssues
      .filter((issue) => issue.resolved && issue.created)
      .map((issue) => {
        if (!issue.resolved || !issue.created) return 0;
        const leadTime = issue.resolved.getTime() - issue.created.getTime();
        return leadTime / (1000 * 60 * 60); // Convert to hours
      })
      .filter((time) => time > 0);

    const avgLeadTime =
      leadTimes.length > 0
        ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length
        : 0;

    // For DORA metrics, you'd need:
    // - Deployment frequency: From CI/CD integration (GitHub Actions, etc.)
    // - MTTR: From monitoring/incident data
    // - Change failure rate: From deployment success/failure tracking

    return {
      deploymentFrequency: 0, // Requires CI/CD integration
      leadTimeForChanges: avgLeadTime,
      meanTimeToRecovery: 0, // Requires incident tracking
      changeFailureRate: 0, // Requires deployment tracking
      period: 'daily',
      startDate,
      endDate,
    };
  }
}

/**
 * Jira Connection Service
 * Stores Jira credentials securely per user
 */
import { getDb } from '@/lib/mongodb';
import { secretsManager } from '@/lib/aws/SecretsManager';
import crypto from 'crypto';

export interface JiraConnection {
  _id?: string;
  userId: string;
  domain: string;
  email: string;
  encryptedApiToken: string; // Encrypted API token
  projectKey?: string;
  connectedAt: Date;
  lastUsedAt?: Date;
}

const ALGORITHM = 'aes-256-gcm';

export class JiraConnectionService {
  private collectionName = 'jira_connections';

  private async getEncryptionKey(): Promise<string> {
    try {
      return await secretsManager.getSecret(
        'engify/jira-token-encryption-key',
        'JIRA_TOKEN_ENCRYPTION_KEY'
      );
    } catch (error) {
      const fallback =
        process.env.JIRA_TOKEN_ENCRYPTION_KEY ||
        'default-key-change-in-production';
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Jira encryption key not found!', error);
      }
      return fallback;
    }
  }

  private async encryptToken(
    token: string
  ): Promise<{ encrypted: string; iv: string; authTag: string }> {
    const encryptionKey = await this.getEncryptionKey();
    const keyBuffer = encryptionKey.startsWith('hex:')
      ? Buffer.from(encryptionKey.slice(4), 'hex')
      : crypto.createHash('sha256').update(encryptionKey).digest();

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer.slice(0, 32), iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  private async decryptToken(encryptedData: string): Promise<string> {
    const encryptionKey = await this.getEncryptionKey();
    const keyBuffer = encryptionKey.startsWith('hex:')
      ? Buffer.from(encryptionKey.slice(4), 'hex')
      : crypto.createHash('sha256').update(encryptionKey).digest();

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [encrypted, ivHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      keyBuffer.slice(0, 32),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Save Jira connection for user
   */
  async saveConnection(
    userId: string,
    config: {
      domain: string;
      email: string;
      apiToken: string;
      projectKey?: string;
    }
  ): Promise<JiraConnection> {
    const db = await getDb();
    const collection = db.collection<JiraConnection>(this.collectionName);

    const encrypted = await this.encryptToken(config.apiToken);
    const encryptedData = `${encrypted.encrypted}:${encrypted.iv}:${encrypted.authTag}`;

    const connection: JiraConnection = {
      userId,
      domain: config.domain,
      email: config.email,
      encryptedApiToken: encryptedData,
      projectKey: config.projectKey,
      connectedAt: new Date(),
      lastUsedAt: new Date(),
    };

    const existing = await collection.findOne({ userId });
    if (existing) {
      await collection.updateOne({ userId }, { $set: connection });
      return { ...connection, _id: existing._id?.toString() };
    } else {
      const result = await collection.insertOne(connection);
      return { ...connection, _id: result.insertedId.toString() };
    }
  }

  /**
   * Get Jira connection and create client
   */
  async getClient(userId: string): Promise<JiraClient | null> {
    const db = await getDb();
    const collection = db.collection<JiraConnection>(this.collectionName);

    const connection = await collection.findOne({ userId });
    if (!connection) {
      return null;
    }

    const apiToken = await this.decryptToken(connection.encryptedApiToken);

    // Update last used
    await collection.updateOne(
      { userId },
      { $set: { lastUsedAt: new Date() } }
    );

    return new JiraClient({
      domain: connection.domain,
      email: connection.email,
      apiToken,
      projectKey: connection.projectKey,
    });
  }

  /**
   * Check if user has Jira connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<JiraConnection>(this.collectionName);
    const connection = await collection.findOne({ userId });
    return connection !== null;
  }

  /**
   * Disconnect Jira
   */
  async disconnect(userId: string): Promise<boolean> {
    const db = await getDb();
    const collection = db.collection<JiraConnection>(this.collectionName);
    const result = await collection.deleteOne({ userId });
    return result.deletedCount > 0;
  }
}

export const jiraConnectionService = new JiraConnectionService();

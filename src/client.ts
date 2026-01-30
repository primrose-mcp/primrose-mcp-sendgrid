/**
 * SendGrid API Client
 *
 * Comprehensive client for SendGrid v3 API with all available endpoints.
 */

import type {
  Alert,
  AlertInput,
  ApiKey,
  ApiKeyInput,
  AuthenticatedDomain,
  Block,
  Bounce,
  BrandedLink,
  BrandedLinkInput,
  Contact,
  ContactInput,
  ContactList,
  ContactListInput,
  CustomField,
  CustomFieldInput,
  Design,
  DesignInput,
  DomainAuthInput,
  EmailValidationResult,
  EventWebhook,
  EventWebhookInput,
  GlobalSuppression,
  GroupSuppression,
  InboundParseWebhook,
  InboundParseWebhookInput,
  InvalidEmail,
  IpAddress,
  IpPool,
  IpPoolInput,
  PaginatedResponse,
  PaginationParams,
  ScheduledSend,
  Segment,
  SegmentInput,
  SendEmailInput,
  SenderIdentity,
  SenderIdentityInput,
  SingleSend,
  SingleSendInput,
  SpamReport,
  Stats,
  Subuser,
  SubuserInput,
  Teammate,
  TeammateInput,
  Template,
  TemplateInput,
  TemplateVersion,
  TemplateVersionInput,
  UnsubscribeGroup,
  UnsubscribeGroupInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, RateLimitError, SendGridApiError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://api.sendgrid.com/v3';

// =============================================================================
// SendGrid Client Interface
// =============================================================================

export interface SendGridClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Mail Send
  sendEmail(input: SendEmailInput): Promise<{ messageId?: string }>;

  // Contacts
  listContacts(params?: PaginationParams): Promise<PaginatedResponse<Contact>>;
  getContact(id: string): Promise<Contact>;
  addOrUpdateContacts(
    contacts: ContactInput[],
    listIds?: string[]
  ): Promise<{ jobId: string }>;
  deleteContacts(ids: string[], deleteAllContacts?: boolean): Promise<{ jobId: string }>;
  searchContacts(query: string): Promise<PaginatedResponse<Contact>>;
  getContactCount(): Promise<{ contactCount: number; billableCount: number }>;
  getContactByEmail(email: string): Promise<Contact | null>;

  // Contact Lists
  listContactLists(): Promise<PaginatedResponse<ContactList>>;
  getContactList(id: string): Promise<ContactList>;
  createContactList(input: ContactListInput): Promise<ContactList>;
  updateContactList(id: string, input: ContactListInput): Promise<ContactList>;
  deleteContactList(id: string, deleteContacts?: boolean): Promise<void>;
  getContactListCount(id: string): Promise<{ contactCount: number; billableCount: number }>;
  addContactsToList(listId: string, contactIds: string[]): Promise<{ jobId: string }>;
  removeContactsFromList(listId: string, contactIds: string[]): Promise<{ jobId: string }>;

  // Segments
  listSegments(parentListIds?: string[]): Promise<PaginatedResponse<Segment>>;
  getSegment(id: string): Promise<Segment>;
  createSegment(input: SegmentInput): Promise<Segment>;
  updateSegment(id: string, input: Partial<SegmentInput>): Promise<Segment>;
  deleteSegment(id: string): Promise<void>;

  // Custom Fields
  listCustomFields(): Promise<CustomField[]>;
  createCustomField(input: CustomFieldInput): Promise<CustomField>;
  updateCustomField(id: string, name: string): Promise<CustomField>;
  deleteCustomField(id: string): Promise<void>;

  // Templates
  listTemplates(
    generations?: 'legacy' | 'dynamic',
    pageSize?: number,
    pageToken?: string
  ): Promise<PaginatedResponse<Template>>;
  getTemplate(id: string): Promise<Template>;
  createTemplate(input: TemplateInput): Promise<Template>;
  updateTemplate(id: string, name: string): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  duplicateTemplate(id: string, name?: string): Promise<Template>;

  // Template Versions
  createTemplateVersion(templateId: string, input: TemplateVersionInput): Promise<TemplateVersion>;
  getTemplateVersion(templateId: string, versionId: string): Promise<TemplateVersion>;
  updateTemplateVersion(
    templateId: string,
    versionId: string,
    input: Partial<TemplateVersionInput>
  ): Promise<TemplateVersion>;
  deleteTemplateVersion(templateId: string, versionId: string): Promise<void>;
  activateTemplateVersion(templateId: string, versionId: string): Promise<TemplateVersion>;

  // Single Sends (Marketing Campaigns)
  listSingleSends(status?: string): Promise<PaginatedResponse<SingleSend>>;
  getSingleSend(id: string): Promise<SingleSend>;
  createSingleSend(input: SingleSendInput): Promise<SingleSend>;
  updateSingleSend(id: string, input: Partial<SingleSendInput>): Promise<SingleSend>;
  deleteSingleSend(id: string): Promise<void>;
  scheduleSingleSend(id: string, sendAt: string): Promise<SingleSend>;
  cancelScheduledSingleSend(id: string): Promise<void>;
  sendSingleSendNow(id: string): Promise<SingleSend>;

  // Sender Identities
  listSenderIdentities(): Promise<PaginatedResponse<SenderIdentity>>;
  getSenderIdentity(id: number): Promise<SenderIdentity>;
  createSenderIdentity(input: SenderIdentityInput): Promise<SenderIdentity>;
  updateSenderIdentity(id: number, input: Partial<SenderIdentityInput>): Promise<SenderIdentity>;
  deleteSenderIdentity(id: number): Promise<void>;
  resendSenderVerification(id: number): Promise<void>;

  // Statistics
  getGlobalStats(
    startDate: string,
    endDate?: string,
    aggregatedBy?: 'day' | 'week' | 'month'
  ): Promise<Stats[]>;
  getCategoryStats(
    categories: string[],
    startDate: string,
    endDate?: string,
    aggregatedBy?: 'day' | 'week' | 'month'
  ): Promise<Stats[]>;
  getMailboxProviderStats(
    startDate: string,
    endDate?: string,
    mailboxProviders?: string[]
  ): Promise<Stats[]>;
  getBrowserStats(startDate: string, endDate?: string): Promise<Stats[]>;
  getDeviceStats(startDate: string, endDate?: string): Promise<Stats[]>;
  getGeographyStats(startDate: string, endDate?: string, country?: string): Promise<Stats[]>;

  // Suppressions - Bounces
  listBounces(
    startTime?: number,
    endTime?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<Bounce>>;
  getBounce(email: string): Promise<Bounce[]>;
  deleteBounce(email: string): Promise<void>;
  deleteBounces(emails: string[], deleteAll?: boolean): Promise<void>;

  // Suppressions - Blocks
  listBlocks(
    startTime?: number,
    endTime?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<Block>>;
  getBlock(email: string): Promise<Block[]>;
  deleteBlock(email: string): Promise<void>;
  deleteBlocks(emails: string[], deleteAll?: boolean): Promise<void>;

  // Suppressions - Spam Reports
  listSpamReports(
    startTime?: number,
    endTime?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<SpamReport>>;
  getSpamReport(email: string): Promise<SpamReport[]>;
  deleteSpamReport(email: string): Promise<void>;
  deleteSpamReports(emails: string[], deleteAll?: boolean): Promise<void>;

  // Suppressions - Invalid Emails
  listInvalidEmails(
    startTime?: number,
    endTime?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<InvalidEmail>>;
  getInvalidEmail(email: string): Promise<InvalidEmail[]>;
  deleteInvalidEmail(email: string): Promise<void>;
  deleteInvalidEmails(emails: string[], deleteAll?: boolean): Promise<void>;

  // Global Suppressions
  listGlobalSuppressions(
    startTime?: number,
    endTime?: number,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<GlobalSuppression>>;
  getGlobalSuppression(email: string): Promise<GlobalSuppression | null>;
  addGlobalSuppression(emails: string[]): Promise<void>;
  deleteGlobalSuppression(email: string): Promise<void>;

  // Unsubscribe Groups
  listUnsubscribeGroups(): Promise<UnsubscribeGroup[]>;
  getUnsubscribeGroup(id: number): Promise<UnsubscribeGroup>;
  createUnsubscribeGroup(input: UnsubscribeGroupInput): Promise<UnsubscribeGroup>;
  updateUnsubscribeGroup(
    id: number,
    input: Partial<UnsubscribeGroupInput>
  ): Promise<UnsubscribeGroup>;
  deleteUnsubscribeGroup(id: number): Promise<void>;

  // Group Suppressions
  listGroupSuppressions(groupId: number): Promise<string[]>;
  addGroupSuppressions(groupId: number, emails: string[]): Promise<void>;
  deleteGroupSuppression(groupId: number, email: string): Promise<void>;
  searchGroupSuppressions(email: string): Promise<GroupSuppression[]>;

  // API Keys
  listApiKeys(): Promise<PaginatedResponse<ApiKey>>;
  getApiKey(id: string): Promise<ApiKey>;
  createApiKey(input: ApiKeyInput): Promise<ApiKey & { apiKey: string }>;
  updateApiKey(id: string, name: string, scopes?: string[]): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;

  // Event Webhooks
  getEventWebhook(): Promise<EventWebhook>;
  updateEventWebhook(input: EventWebhookInput): Promise<EventWebhook>;
  testEventWebhook(url: string): Promise<void>;

  // Domain Authentication
  listAuthenticatedDomains(): Promise<AuthenticatedDomain[]>;
  getAuthenticatedDomain(id: number): Promise<AuthenticatedDomain>;
  authenticateDomain(input: DomainAuthInput): Promise<AuthenticatedDomain>;
  deleteAuthenticatedDomain(id: number): Promise<void>;
  validateDomain(id: number): Promise<{ valid: boolean; validationResults: Record<string, unknown> }>;

  // Link Branding
  listBrandedLinks(): Promise<BrandedLink[]>;
  getBrandedLink(id: number): Promise<BrandedLink>;
  createBrandedLink(input: BrandedLinkInput): Promise<BrandedLink>;
  deleteBrandedLink(id: number): Promise<void>;
  validateBrandedLink(id: number): Promise<{ valid: boolean; validationResults: Record<string, unknown> }>;

  // IP Management
  listIpAddresses(): Promise<IpAddress[]>;
  getIpAddress(ip: string): Promise<IpAddress>;
  listIpPools(): Promise<IpPool[]>;
  getIpPool(name: string): Promise<IpPool>;
  createIpPool(input: IpPoolInput): Promise<IpPool>;
  updateIpPool(name: string, newName: string): Promise<IpPool>;
  deleteIpPool(name: string): Promise<void>;
  addIpToPool(poolName: string, ip: string): Promise<void>;
  removeIpFromPool(poolName: string, ip: string): Promise<void>;

  // IP Warmup
  listIpWarmup(): Promise<IpAddress[]>;
  startIpWarmup(ip: string): Promise<IpAddress>;
  stopIpWarmup(ip: string): Promise<void>;

  // Subusers
  listSubusers(limit?: number, offset?: number): Promise<Subuser[]>;
  getSubuser(username: string): Promise<Subuser>;
  createSubuser(input: SubuserInput): Promise<Subuser>;
  deleteSubuser(username: string): Promise<void>;
  enableSubuser(username: string): Promise<void>;
  disableSubuser(username: string): Promise<void>;

  // Teammates
  listTeammates(limit?: number, offset?: number): Promise<Teammate[]>;
  getTeammate(username: string): Promise<Teammate>;
  inviteTeammate(input: TeammateInput): Promise<{ token: string; email: string }>;
  updateTeammatePermissions(username: string, scopes: string[], isAdmin?: boolean): Promise<Teammate>;
  deleteTeammate(username: string): Promise<void>;

  // Inbound Parse
  listInboundParseWebhooks(): Promise<InboundParseWebhook[]>;
  getInboundParseWebhook(hostname: string): Promise<InboundParseWebhook>;
  createInboundParseWebhook(input: InboundParseWebhookInput): Promise<InboundParseWebhook>;
  updateInboundParseWebhook(
    hostname: string,
    input: Partial<InboundParseWebhookInput>
  ): Promise<InboundParseWebhook>;
  deleteInboundParseWebhook(hostname: string): Promise<void>;

  // Email Validation
  validateEmail(email: string, source?: string): Promise<EmailValidationResult>;

  // Scheduled Sends
  createBatchId(): Promise<{ batchId: string }>;
  validateBatchId(batchId: string): Promise<{ valid: boolean }>;
  listScheduledSends(): Promise<ScheduledSend[]>;
  getScheduledSend(batchId: string): Promise<ScheduledSend>;
  cancelScheduledSend(batchId: string): Promise<void>;
  pauseScheduledSend(batchId: string): Promise<void>;

  // Alerts
  listAlerts(): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert>;
  createAlert(input: AlertInput): Promise<Alert>;
  updateAlert(id: number, input: Partial<AlertInput>): Promise<Alert>;
  deleteAlert(id: number): Promise<void>;

  // Design Library
  listDesigns(pageSize?: number, pageToken?: string): Promise<PaginatedResponse<Design>>;
  getDesign(id: string): Promise<Design>;
  createDesign(input: DesignInput): Promise<Design>;
  updateDesign(id: string, input: Partial<DesignInput>): Promise<Design>;
  deleteDesign(id: string): Promise<void>;
  duplicateDesign(id: string, name?: string): Promise<Design>;
}

// =============================================================================
// SendGrid Client Implementation
// =============================================================================

class SendGridClientImpl implements SendGridClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.apiKey) {
      throw new AuthenticationError(
        'No API key provided. Include X-SendGrid-API-Key header.'
      );
    }

    return {
      Authorization: `Bearer ${this.credentials.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your API key.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          message = errorJson.errors.map((e: { message: string }) => e.message).join(', ');
        } else if (errorJson.message) {
          message = errorJson.message;
        }
      } catch {
        // Use default message
      }
      throw new SendGridApiError(message, response.status);
    }

    if (response.status === 204 || response.status === 202) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.request('/user/profile');
      return { connected: true, message: 'Successfully connected to SendGrid API' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Mail Send
  // ===========================================================================

  async sendEmail(input: SendEmailInput): Promise<{ messageId?: string }> {
    await this.request<void>('/mail/send', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { messageId: undefined };
  }

  // ===========================================================================
  // Contacts
  // ===========================================================================

  async listContacts(params?: PaginationParams): Promise<PaginatedResponse<Contact>> {
    const queryParams = new URLSearchParams();
    if (params?.pageToken) queryParams.set('page_token', params.pageToken);

    const result = await this.request<{
      result: Contact[];
      _metadata?: { next?: string };
      contact_count?: number;
    }>(`/marketing/contacts${queryParams.toString() ? `?${queryParams}` : ''}`);

    return {
      items: result.result || [],
      count: result.result?.length || 0,
      total: result.contact_count,
      hasMore: !!result._metadata?.next,
      nextPageToken: result._metadata?.next,
    };
  }

  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/marketing/contacts/${id}`);
  }

  async addOrUpdateContacts(
    contacts: ContactInput[],
    listIds?: string[]
  ): Promise<{ jobId: string }> {
    const body: { contacts: ContactInput[]; list_ids?: string[] } = { contacts };
    if (listIds) body.list_ids = listIds;

    const result = await this.request<{ job_id: string }>('/marketing/contacts', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return { jobId: result.job_id };
  }

  async deleteContacts(ids: string[], deleteAllContacts = false): Promise<{ jobId: string }> {
    const queryParams = new URLSearchParams();
    if (deleteAllContacts) {
      queryParams.set('delete_all_contacts', 'true');
    } else {
      queryParams.set('ids', ids.join(','));
    }

    const result = await this.request<{ job_id: string }>(
      `/marketing/contacts?${queryParams}`,
      { method: 'DELETE' }
    );
    return { jobId: result.job_id };
  }

  async searchContacts(query: string): Promise<PaginatedResponse<Contact>> {
    const result = await this.request<{
      result: Contact[];
      contact_count: number;
    }>('/marketing/contacts/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    return {
      items: result.result || [],
      count: result.result?.length || 0,
      total: result.contact_count,
      hasMore: false,
    };
  }

  async getContactCount(): Promise<{ contactCount: number; billableCount: number }> {
    const result = await this.request<{ contact_count: number; billable_count: number }>(
      '/marketing/contacts/count'
    );
    return {
      contactCount: result.contact_count,
      billableCount: result.billable_count,
    };
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    try {
      const result = await this.request<{ result: Record<string, Contact> }>(
        '/marketing/contacts/search/emails',
        {
          method: 'POST',
          body: JSON.stringify({ emails: [email] }),
        }
      );
      return result.result?.[email] || null;
    } catch {
      return null;
    }
  }

  // ===========================================================================
  // Contact Lists
  // ===========================================================================

  async listContactLists(): Promise<PaginatedResponse<ContactList>> {
    const result = await this.request<{ result: ContactList[] }>('/marketing/lists');
    return {
      items: result.result || [],
      count: result.result?.length || 0,
      hasMore: false,
    };
  }

  async getContactList(id: string): Promise<ContactList> {
    return this.request<ContactList>(`/marketing/lists/${id}`);
  }

  async createContactList(input: ContactListInput): Promise<ContactList> {
    return this.request<ContactList>('/marketing/lists', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateContactList(id: string, input: ContactListInput): Promise<ContactList> {
    return this.request<ContactList>(`/marketing/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteContactList(id: string, deleteContacts = false): Promise<void> {
    const queryParams = new URLSearchParams();
    if (deleteContacts) queryParams.set('delete_contacts', 'true');
    await this.request(`/marketing/lists/${id}${queryParams.toString() ? `?${queryParams}` : ''}`, {
      method: 'DELETE',
    });
  }

  async getContactListCount(
    id: string
  ): Promise<{ contactCount: number; billableCount: number }> {
    const result = await this.request<{ contact_count: number; billable_count: number }>(
      `/marketing/lists/${id}/contacts/count`
    );
    return {
      contactCount: result.contact_count,
      billableCount: result.billable_count,
    };
  }

  async addContactsToList(listId: string, contactIds: string[]): Promise<{ jobId: string }> {
    const result = await this.request<{ job_id: string }>(
      `/marketing/lists/${listId}/contacts`,
      {
        method: 'POST',
        body: JSON.stringify({ contact_ids: contactIds }),
      }
    );
    return { jobId: result.job_id };
  }

  async removeContactsFromList(
    listId: string,
    contactIds: string[]
  ): Promise<{ jobId: string }> {
    const queryParams = new URLSearchParams();
    queryParams.set('contact_ids', contactIds.join(','));
    const result = await this.request<{ job_id: string }>(
      `/marketing/lists/${listId}/contacts?${queryParams}`,
      { method: 'DELETE' }
    );
    return { jobId: result.job_id };
  }

  // ===========================================================================
  // Segments
  // ===========================================================================

  async listSegments(parentListIds?: string[]): Promise<PaginatedResponse<Segment>> {
    const queryParams = new URLSearchParams();
    if (parentListIds) queryParams.set('parent_list_ids', parentListIds.join(','));

    const result = await this.request<{ results: Segment[] }>(
      `/marketing/segments/2.0${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return {
      items: result.results || [],
      count: result.results?.length || 0,
      hasMore: false,
    };
  }

  async getSegment(id: string): Promise<Segment> {
    return this.request<Segment>(`/marketing/segments/2.0/${id}`);
  }

  async createSegment(input: SegmentInput): Promise<Segment> {
    return this.request<Segment>('/marketing/segments/2.0', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        query_dsl: input.queryDsl,
        parent_list_ids: input.parentListIds,
      }),
    });
  }

  async updateSegment(id: string, input: Partial<SegmentInput>): Promise<Segment> {
    const body: Record<string, unknown> = {};
    if (input.name) body.name = input.name;
    if (input.queryDsl) body.query_dsl = input.queryDsl;

    return this.request<Segment>(`/marketing/segments/2.0/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteSegment(id: string): Promise<void> {
    await this.request(`/marketing/segments/2.0/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Custom Fields
  // ===========================================================================

  async listCustomFields(): Promise<CustomField[]> {
    const result = await this.request<{ custom_fields: CustomField[] }>(
      '/marketing/field_definitions'
    );
    return result.custom_fields || [];
  }

  async createCustomField(input: CustomFieldInput): Promise<CustomField> {
    return this.request<CustomField>('/marketing/field_definitions', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        field_type: input.fieldType,
      }),
    });
  }

  async updateCustomField(id: string, name: string): Promise<CustomField> {
    return this.request<CustomField>(`/marketing/field_definitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCustomField(id: string): Promise<void> {
    await this.request(`/marketing/field_definitions/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Templates
  // ===========================================================================

  async listTemplates(
    generations?: 'legacy' | 'dynamic',
    pageSize = 50,
    pageToken?: string
  ): Promise<PaginatedResponse<Template>> {
    const queryParams = new URLSearchParams();
    if (generations) queryParams.set('generations', generations);
    queryParams.set('page_size', String(pageSize));
    if (pageToken) queryParams.set('page_token', pageToken);

    const result = await this.request<{
      result: Template[];
      _metadata?: { next?: string };
    }>(`/templates?${queryParams}`);

    return {
      items: result.result || [],
      count: result.result?.length || 0,
      hasMore: !!result._metadata?.next,
      nextPageToken: result._metadata?.next,
    };
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(input: TemplateInput): Promise<Template> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTemplate(id: string, name: string): Promise<Template> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.request(`/templates/${id}`, { method: 'DELETE' });
  }

  async duplicateTemplate(id: string, name?: string): Promise<Template> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'POST',
      body: name ? JSON.stringify({ name }) : undefined,
    });
  }

  // ===========================================================================
  // Template Versions
  // ===========================================================================

  async createTemplateVersion(
    templateId: string,
    input: TemplateVersionInput
  ): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(`/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        subject: input.subject,
        html_content: input.htmlContent,
        plain_content: input.plainContent,
        active: input.active ? 1 : 0,
        editor: input.editor,
        generate_plain_content: input.generatePlainContent,
        test_data: input.testData,
      }),
    });
  }

  async getTemplateVersion(templateId: string, versionId: string): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(`/templates/${templateId}/versions/${versionId}`);
  }

  async updateTemplateVersion(
    templateId: string,
    versionId: string,
    input: Partial<TemplateVersionInput>
  ): Promise<TemplateVersion> {
    const body: Record<string, unknown> = {};
    if (input.name) body.name = input.name;
    if (input.subject) body.subject = input.subject;
    if (input.htmlContent) body.html_content = input.htmlContent;
    if (input.plainContent) body.plain_content = input.plainContent;
    if (input.active !== undefined) body.active = input.active ? 1 : 0;
    if (input.editor) body.editor = input.editor;
    if (input.generatePlainContent !== undefined)
      body.generate_plain_content = input.generatePlainContent;

    return this.request<TemplateVersion>(`/templates/${templateId}/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteTemplateVersion(templateId: string, versionId: string): Promise<void> {
    await this.request(`/templates/${templateId}/versions/${versionId}`, { method: 'DELETE' });
  }

  async activateTemplateVersion(
    templateId: string,
    versionId: string
  ): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}/activate`,
      { method: 'POST' }
    );
  }

  // ===========================================================================
  // Single Sends (Marketing Campaigns)
  // ===========================================================================

  async listSingleSends(status?: string): Promise<PaginatedResponse<SingleSend>> {
    const queryParams = new URLSearchParams();
    if (status) queryParams.set('status', status);

    const result = await this.request<{ result: SingleSend[] }>(
      `/marketing/singlesends${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return {
      items: result.result || [],
      count: result.result?.length || 0,
      hasMore: false,
    };
  }

  async getSingleSend(id: string): Promise<SingleSend> {
    return this.request<SingleSend>(`/marketing/singlesends/${id}`);
  }

  async createSingleSend(input: SingleSendInput): Promise<SingleSend> {
    return this.request<SingleSend>('/marketing/singlesends', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateSingleSend(id: string, input: Partial<SingleSendInput>): Promise<SingleSend> {
    return this.request<SingleSend>(`/marketing/singlesends/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteSingleSend(id: string): Promise<void> {
    await this.request(`/marketing/singlesends/${id}`, { method: 'DELETE' });
  }

  async scheduleSingleSend(id: string, sendAt: string): Promise<SingleSend> {
    return this.request<SingleSend>(`/marketing/singlesends/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ send_at: sendAt }),
    });
  }

  async cancelScheduledSingleSend(id: string): Promise<void> {
    await this.request(`/marketing/singlesends/${id}/schedule`, { method: 'DELETE' });
  }

  async sendSingleSendNow(id: string): Promise<SingleSend> {
    return this.request<SingleSend>(`/marketing/singlesends/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ send_at: 'now' }),
    });
  }

  // ===========================================================================
  // Sender Identities
  // ===========================================================================

  async listSenderIdentities(): Promise<PaginatedResponse<SenderIdentity>> {
    const result = await this.request<SenderIdentity[]>('/senders');
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: false,
    };
  }

  async getSenderIdentity(id: number): Promise<SenderIdentity> {
    return this.request<SenderIdentity>(`/senders/${id}`);
  }

  async createSenderIdentity(input: SenderIdentityInput): Promise<SenderIdentity> {
    return this.request<SenderIdentity>('/senders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateSenderIdentity(
    id: number,
    input: Partial<SenderIdentityInput>
  ): Promise<SenderIdentity> {
    return this.request<SenderIdentity>(`/senders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteSenderIdentity(id: number): Promise<void> {
    await this.request(`/senders/${id}`, { method: 'DELETE' });
  }

  async resendSenderVerification(id: number): Promise<void> {
    await this.request(`/senders/${id}/resend_verification`, { method: 'POST' });
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  async getGlobalStats(
    startDate: string,
    endDate?: string,
    aggregatedBy?: 'day' | 'week' | 'month'
  ): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (aggregatedBy) queryParams.set('aggregated_by', aggregatedBy);

    return this.request<Stats[]>(`/stats?${queryParams}`);
  }

  async getCategoryStats(
    categories: string[],
    startDate: string,
    endDate?: string,
    aggregatedBy?: 'day' | 'week' | 'month'
  ): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    queryParams.set('categories', categories.join(','));
    if (endDate) queryParams.set('end_date', endDate);
    if (aggregatedBy) queryParams.set('aggregated_by', aggregatedBy);

    return this.request<Stats[]>(`/categories/stats?${queryParams}`);
  }

  async getMailboxProviderStats(
    startDate: string,
    endDate?: string,
    mailboxProviders?: string[]
  ): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (mailboxProviders) queryParams.set('mailbox_providers', mailboxProviders.join(','));

    return this.request<Stats[]>(`/mailbox_providers/stats?${queryParams}`);
  }

  async getBrowserStats(startDate: string, endDate?: string): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    return this.request<Stats[]>(`/browsers/stats?${queryParams}`);
  }

  async getDeviceStats(startDate: string, endDate?: string): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    return this.request<Stats[]>(`/devices/stats?${queryParams}`);
  }

  async getGeographyStats(
    startDate: string,
    endDate?: string,
    country?: string
  ): Promise<Stats[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (country) queryParams.set('country', country);

    return this.request<Stats[]>(`/geo/stats?${queryParams}`);
  }

  // ===========================================================================
  // Suppressions - Bounces
  // ===========================================================================

  async listBounces(
    startTime?: number,
    endTime?: number,
    limit = 500,
    offset = 0
  ): Promise<PaginatedResponse<Bounce>> {
    const queryParams = new URLSearchParams();
    if (startTime) queryParams.set('start_time', String(startTime));
    if (endTime) queryParams.set('end_time', String(endTime));
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<Bounce[]>(`/suppression/bounces?${queryParams}`);
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: result?.length === limit,
    };
  }

  async getBounce(email: string): Promise<Bounce[]> {
    return this.request<Bounce[]>(`/suppression/bounces/${email}`);
  }

  async deleteBounce(email: string): Promise<void> {
    await this.request(`/suppression/bounces/${email}`, { method: 'DELETE' });
  }

  async deleteBounces(emails: string[], deleteAll = false): Promise<void> {
    if (deleteAll) {
      await this.request('/suppression/bounces', {
        method: 'DELETE',
        body: JSON.stringify({ delete_all: true }),
      });
    } else {
      await this.request('/suppression/bounces', {
        method: 'DELETE',
        body: JSON.stringify({ emails }),
      });
    }
  }

  // ===========================================================================
  // Suppressions - Blocks
  // ===========================================================================

  async listBlocks(
    startTime?: number,
    endTime?: number,
    limit = 500,
    offset = 0
  ): Promise<PaginatedResponse<Block>> {
    const queryParams = new URLSearchParams();
    if (startTime) queryParams.set('start_time', String(startTime));
    if (endTime) queryParams.set('end_time', String(endTime));
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<Block[]>(`/suppression/blocks?${queryParams}`);
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: result?.length === limit,
    };
  }

  async getBlock(email: string): Promise<Block[]> {
    return this.request<Block[]>(`/suppression/blocks/${email}`);
  }

  async deleteBlock(email: string): Promise<void> {
    await this.request(`/suppression/blocks/${email}`, { method: 'DELETE' });
  }

  async deleteBlocks(emails: string[], deleteAll = false): Promise<void> {
    if (deleteAll) {
      await this.request('/suppression/blocks', {
        method: 'DELETE',
        body: JSON.stringify({ delete_all: true }),
      });
    } else {
      await this.request('/suppression/blocks', {
        method: 'DELETE',
        body: JSON.stringify({ emails }),
      });
    }
  }

  // ===========================================================================
  // Suppressions - Spam Reports
  // ===========================================================================

  async listSpamReports(
    startTime?: number,
    endTime?: number,
    limit = 500,
    offset = 0
  ): Promise<PaginatedResponse<SpamReport>> {
    const queryParams = new URLSearchParams();
    if (startTime) queryParams.set('start_time', String(startTime));
    if (endTime) queryParams.set('end_time', String(endTime));
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<SpamReport[]>(`/suppression/spam_reports?${queryParams}`);
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: result?.length === limit,
    };
  }

  async getSpamReport(email: string): Promise<SpamReport[]> {
    return this.request<SpamReport[]>(`/suppression/spam_reports/${email}`);
  }

  async deleteSpamReport(email: string): Promise<void> {
    await this.request(`/suppression/spam_reports/${email}`, { method: 'DELETE' });
  }

  async deleteSpamReports(emails: string[], deleteAll = false): Promise<void> {
    if (deleteAll) {
      await this.request('/suppression/spam_reports', {
        method: 'DELETE',
        body: JSON.stringify({ delete_all: true }),
      });
    } else {
      await this.request('/suppression/spam_reports', {
        method: 'DELETE',
        body: JSON.stringify({ emails }),
      });
    }
  }

  // ===========================================================================
  // Suppressions - Invalid Emails
  // ===========================================================================

  async listInvalidEmails(
    startTime?: number,
    endTime?: number,
    limit = 500,
    offset = 0
  ): Promise<PaginatedResponse<InvalidEmail>> {
    const queryParams = new URLSearchParams();
    if (startTime) queryParams.set('start_time', String(startTime));
    if (endTime) queryParams.set('end_time', String(endTime));
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<InvalidEmail[]>(`/suppression/invalid_emails?${queryParams}`);
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: result?.length === limit,
    };
  }

  async getInvalidEmail(email: string): Promise<InvalidEmail[]> {
    return this.request<InvalidEmail[]>(`/suppression/invalid_emails/${email}`);
  }

  async deleteInvalidEmail(email: string): Promise<void> {
    await this.request(`/suppression/invalid_emails/${email}`, { method: 'DELETE' });
  }

  async deleteInvalidEmails(emails: string[], deleteAll = false): Promise<void> {
    if (deleteAll) {
      await this.request('/suppression/invalid_emails', {
        method: 'DELETE',
        body: JSON.stringify({ delete_all: true }),
      });
    } else {
      await this.request('/suppression/invalid_emails', {
        method: 'DELETE',
        body: JSON.stringify({ emails }),
      });
    }
  }

  // ===========================================================================
  // Global Suppressions
  // ===========================================================================

  async listGlobalSuppressions(
    startTime?: number,
    endTime?: number,
    limit = 500,
    offset = 0
  ): Promise<PaginatedResponse<GlobalSuppression>> {
    const queryParams = new URLSearchParams();
    if (startTime) queryParams.set('start_time', String(startTime));
    if (endTime) queryParams.set('end_time', String(endTime));
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<GlobalSuppression[]>(
      `/suppression/unsubscribes?${queryParams}`
    );
    return {
      items: result || [],
      count: result?.length || 0,
      hasMore: result?.length === limit,
    };
  }

  async getGlobalSuppression(email: string): Promise<GlobalSuppression | null> {
    try {
      const result = await this.request<GlobalSuppression[]>(
        `/suppression/unsubscribes/${email}`
      );
      return result?.[0] || null;
    } catch {
      return null;
    }
  }

  async addGlobalSuppression(emails: string[]): Promise<void> {
    await this.request('/asm/suppressions/global', {
      method: 'POST',
      body: JSON.stringify({ recipient_emails: emails }),
    });
  }

  async deleteGlobalSuppression(email: string): Promise<void> {
    await this.request(`/asm/suppressions/global/${email}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Unsubscribe Groups
  // ===========================================================================

  async listUnsubscribeGroups(): Promise<UnsubscribeGroup[]> {
    return this.request<UnsubscribeGroup[]>('/asm/groups');
  }

  async getUnsubscribeGroup(id: number): Promise<UnsubscribeGroup> {
    return this.request<UnsubscribeGroup>(`/asm/groups/${id}`);
  }

  async createUnsubscribeGroup(input: UnsubscribeGroupInput): Promise<UnsubscribeGroup> {
    return this.request<UnsubscribeGroup>('/asm/groups', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateUnsubscribeGroup(
    id: number,
    input: Partial<UnsubscribeGroupInput>
  ): Promise<UnsubscribeGroup> {
    return this.request<UnsubscribeGroup>(`/asm/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteUnsubscribeGroup(id: number): Promise<void> {
    await this.request(`/asm/groups/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Group Suppressions
  // ===========================================================================

  async listGroupSuppressions(groupId: number): Promise<string[]> {
    const result = await this.request<string[]>(`/asm/groups/${groupId}/suppressions`);
    return result || [];
  }

  async addGroupSuppressions(groupId: number, emails: string[]): Promise<void> {
    await this.request(`/asm/groups/${groupId}/suppressions`, {
      method: 'POST',
      body: JSON.stringify({ recipient_emails: emails }),
    });
  }

  async deleteGroupSuppression(groupId: number, email: string): Promise<void> {
    await this.request(`/asm/groups/${groupId}/suppressions/${email}`, { method: 'DELETE' });
  }

  async searchGroupSuppressions(email: string): Promise<GroupSuppression[]> {
    const result = await this.request<{ suppressions: GroupSuppression[] }>(
      `/asm/suppressions/${email}`
    );
    return result.suppressions || [];
  }

  // ===========================================================================
  // API Keys
  // ===========================================================================

  async listApiKeys(): Promise<PaginatedResponse<ApiKey>> {
    const result = await this.request<{ result: ApiKey[] }>('/api_keys');
    return {
      items: result.result || [],
      count: result.result?.length || 0,
      hasMore: false,
    };
  }

  async getApiKey(id: string): Promise<ApiKey> {
    return this.request<ApiKey>(`/api_keys/${id}`);
  }

  async createApiKey(input: ApiKeyInput): Promise<ApiKey & { apiKey: string }> {
    return this.request<ApiKey & { apiKey: string }>('/api_keys', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateApiKey(id: string, name: string, scopes?: string[]): Promise<ApiKey> {
    const body: { name: string; scopes?: string[] } = { name };
    if (scopes) body.scopes = scopes;

    return this.request<ApiKey>(`/api_keys/${id}`, {
      method: scopes ? 'PUT' : 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.request(`/api_keys/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Event Webhooks
  // ===========================================================================

  async getEventWebhook(): Promise<EventWebhook> {
    return this.request<EventWebhook>('/user/webhooks/event/settings');
  }

  async updateEventWebhook(input: EventWebhookInput): Promise<EventWebhook> {
    return this.request<EventWebhook>('/user/webhooks/event/settings', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async testEventWebhook(url: string): Promise<void> {
    await this.request('/user/webhooks/event/test', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // ===========================================================================
  // Domain Authentication
  // ===========================================================================

  async listAuthenticatedDomains(): Promise<AuthenticatedDomain[]> {
    return this.request<AuthenticatedDomain[]>('/whitelabel/domains');
  }

  async getAuthenticatedDomain(id: number): Promise<AuthenticatedDomain> {
    return this.request<AuthenticatedDomain>(`/whitelabel/domains/${id}`);
  }

  async authenticateDomain(input: DomainAuthInput): Promise<AuthenticatedDomain> {
    return this.request<AuthenticatedDomain>('/whitelabel/domains', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteAuthenticatedDomain(id: number): Promise<void> {
    await this.request(`/whitelabel/domains/${id}`, { method: 'DELETE' });
  }

  async validateDomain(
    id: number
  ): Promise<{ valid: boolean; validationResults: Record<string, unknown> }> {
    const result = await this.request<{
      valid: boolean;
      validation_results: Record<string, unknown>;
    }>(`/whitelabel/domains/${id}/validate`, { method: 'POST' });
    return {
      valid: result.valid,
      validationResults: result.validation_results,
    };
  }

  // ===========================================================================
  // Link Branding
  // ===========================================================================

  async listBrandedLinks(): Promise<BrandedLink[]> {
    return this.request<BrandedLink[]>('/whitelabel/links');
  }

  async getBrandedLink(id: number): Promise<BrandedLink> {
    return this.request<BrandedLink>(`/whitelabel/links/${id}`);
  }

  async createBrandedLink(input: BrandedLinkInput): Promise<BrandedLink> {
    return this.request<BrandedLink>('/whitelabel/links', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteBrandedLink(id: number): Promise<void> {
    await this.request(`/whitelabel/links/${id}`, { method: 'DELETE' });
  }

  async validateBrandedLink(
    id: number
  ): Promise<{ valid: boolean; validationResults: Record<string, unknown> }> {
    const result = await this.request<{
      valid: boolean;
      validation_results: Record<string, unknown>;
    }>(`/whitelabel/links/${id}/validate`, { method: 'POST' });
    return {
      valid: result.valid,
      validationResults: result.validation_results,
    };
  }

  // ===========================================================================
  // IP Management
  // ===========================================================================

  async listIpAddresses(): Promise<IpAddress[]> {
    return this.request<IpAddress[]>('/ips');
  }

  async getIpAddress(ip: string): Promise<IpAddress> {
    return this.request<IpAddress>(`/ips/${ip}`);
  }

  async listIpPools(): Promise<IpPool[]> {
    return this.request<IpPool[]>('/ips/pools');
  }

  async getIpPool(name: string): Promise<IpPool> {
    return this.request<IpPool>(`/ips/pools/${name}`);
  }

  async createIpPool(input: IpPoolInput): Promise<IpPool> {
    return this.request<IpPool>('/ips/pools', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateIpPool(name: string, newName: string): Promise<IpPool> {
    return this.request<IpPool>(`/ips/pools/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });
  }

  async deleteIpPool(name: string): Promise<void> {
    await this.request(`/ips/pools/${name}`, { method: 'DELETE' });
  }

  async addIpToPool(poolName: string, ip: string): Promise<void> {
    await this.request(`/ips/pools/${poolName}/ips`, {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }

  async removeIpFromPool(poolName: string, ip: string): Promise<void> {
    await this.request(`/ips/pools/${poolName}/ips/${ip}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // IP Warmup
  // ===========================================================================

  async listIpWarmup(): Promise<IpAddress[]> {
    return this.request<IpAddress[]>('/ips/warmup');
  }

  async startIpWarmup(ip: string): Promise<IpAddress> {
    return this.request<IpAddress>('/ips/warmup', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }

  async stopIpWarmup(ip: string): Promise<void> {
    await this.request(`/ips/warmup/${ip}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Subusers
  // ===========================================================================

  async listSubusers(limit = 500, offset = 0): Promise<Subuser[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    return this.request<Subuser[]>(`/subusers?${queryParams}`);
  }

  async getSubuser(username: string): Promise<Subuser> {
    return this.request<Subuser>(`/subusers/${username}`);
  }

  async createSubuser(input: SubuserInput): Promise<Subuser> {
    return this.request<Subuser>('/subusers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteSubuser(username: string): Promise<void> {
    await this.request(`/subusers/${username}`, { method: 'DELETE' });
  }

  async enableSubuser(username: string): Promise<void> {
    await this.request(`/subusers/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({ disabled: false }),
    });
  }

  async disableSubuser(username: string): Promise<void> {
    await this.request(`/subusers/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({ disabled: true }),
    });
  }

  // ===========================================================================
  // Teammates
  // ===========================================================================

  async listTeammates(limit = 500, offset = 0): Promise<Teammate[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('limit', String(limit));
    queryParams.set('offset', String(offset));

    const result = await this.request<{ result: Teammate[] }>(`/teammates?${queryParams}`);
    return result.result || [];
  }

  async getTeammate(username: string): Promise<Teammate> {
    return this.request<Teammate>(`/teammates/${username}`);
  }

  async inviteTeammate(input: TeammateInput): Promise<{ token: string; email: string }> {
    return this.request<{ token: string; email: string }>('/teammates', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTeammatePermissions(
    username: string,
    scopes: string[],
    isAdmin?: boolean
  ): Promise<Teammate> {
    return this.request<Teammate>(`/teammates/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({ scopes, is_admin: isAdmin }),
    });
  }

  async deleteTeammate(username: string): Promise<void> {
    await this.request(`/teammates/${username}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Inbound Parse
  // ===========================================================================

  async listInboundParseWebhooks(): Promise<InboundParseWebhook[]> {
    const result = await this.request<{ result: InboundParseWebhook[] }>(
      '/user/webhooks/parse/settings'
    );
    return result.result || [];
  }

  async getInboundParseWebhook(hostname: string): Promise<InboundParseWebhook> {
    return this.request<InboundParseWebhook>(`/user/webhooks/parse/settings/${hostname}`);
  }

  async createInboundParseWebhook(input: InboundParseWebhookInput): Promise<InboundParseWebhook> {
    return this.request<InboundParseWebhook>('/user/webhooks/parse/settings', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateInboundParseWebhook(
    hostname: string,
    input: Partial<InboundParseWebhookInput>
  ): Promise<InboundParseWebhook> {
    return this.request<InboundParseWebhook>(`/user/webhooks/parse/settings/${hostname}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteInboundParseWebhook(hostname: string): Promise<void> {
    await this.request(`/user/webhooks/parse/settings/${hostname}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Email Validation
  // ===========================================================================

  async validateEmail(email: string, source?: string): Promise<EmailValidationResult> {
    const body: { email: string; source?: string } = { email };
    if (source) body.source = source;

    return this.request<EmailValidationResult>('/validations/email', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ===========================================================================
  // Scheduled Sends
  // ===========================================================================

  async createBatchId(): Promise<{ batchId: string }> {
    const result = await this.request<{ batch_id: string }>('/mail/batch', {
      method: 'POST',
    });
    return { batchId: result.batch_id };
  }

  async validateBatchId(batchId: string): Promise<{ valid: boolean }> {
    try {
      await this.request(`/mail/batch/${batchId}`);
      return { valid: true };
    } catch {
      return { valid: false };
    }
  }

  async listScheduledSends(): Promise<ScheduledSend[]> {
    return this.request<ScheduledSend[]>('/user/scheduled_sends');
  }

  async getScheduledSend(batchId: string): Promise<ScheduledSend> {
    const result = await this.request<ScheduledSend[]>(`/user/scheduled_sends/${batchId}`);
    return result[0];
  }

  async cancelScheduledSend(batchId: string): Promise<void> {
    await this.request(`/user/scheduled_sends/${batchId}`, {
      method: 'POST',
      body: JSON.stringify({ batch_id: batchId, status: 'cancel' }),
    });
  }

  async pauseScheduledSend(batchId: string): Promise<void> {
    await this.request(`/user/scheduled_sends/${batchId}`, {
      method: 'POST',
      body: JSON.stringify({ batch_id: batchId, status: 'pause' }),
    });
  }

  // ===========================================================================
  // Alerts
  // ===========================================================================

  async listAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/alerts');
  }

  async getAlert(id: number): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`);
  }

  async createAlert(input: AlertInput): Promise<Alert> {
    return this.request<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateAlert(id: number, input: Partial<AlertInput>): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteAlert(id: number): Promise<void> {
    await this.request(`/alerts/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Design Library
  // ===========================================================================

  async listDesigns(pageSize = 50, pageToken?: string): Promise<PaginatedResponse<Design>> {
    const queryParams = new URLSearchParams();
    queryParams.set('page_size', String(pageSize));
    if (pageToken) queryParams.set('page_token', pageToken);

    const result = await this.request<{
      result: Design[];
      _metadata?: { next?: string };
    }>(`/designs?${queryParams}`);

    return {
      items: result.result || [],
      count: result.result?.length || 0,
      hasMore: !!result._metadata?.next,
      nextPageToken: result._metadata?.next,
    };
  }

  async getDesign(id: string): Promise<Design> {
    return this.request<Design>(`/designs/${id}`);
  }

  async createDesign(input: DesignInput): Promise<Design> {
    return this.request<Design>('/designs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateDesign(id: string, input: Partial<DesignInput>): Promise<Design> {
    return this.request<Design>(`/designs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteDesign(id: string): Promise<void> {
    await this.request(`/designs/${id}`, { method: 'DELETE' });
  }

  async duplicateDesign(id: string, name?: string): Promise<Design> {
    return this.request<Design>(`/designs/${id}`, {
      method: 'POST',
      body: name ? JSON.stringify({ name }) : undefined,
    });
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a SendGrid client instance with tenant-specific credentials.
 */
export function createSendGridClient(credentials: TenantCredentials): SendGridClient {
  return new SendGridClientImpl(credentials);
}

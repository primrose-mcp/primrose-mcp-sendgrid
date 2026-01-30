/**
 * SendGrid Entity Types
 *
 * Type definitions for SendGrid API entities.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return */
  limit?: number;
  /** Page token for cursor-based pagination */
  pageToken?: string;
  /** Offset for offset-based pagination */
  offset?: number;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Total count (if available) */
  total?: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Token for next page */
  nextPageToken?: string;
}

// =============================================================================
// Mail Send
// =============================================================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailContent {
  type: 'text/plain' | 'text/html';
  value: string;
}

export interface Personalization {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  headers?: Record<string, string>;
  substitutions?: Record<string, string>;
  dynamicTemplateData?: Record<string, unknown>;
  customArgs?: Record<string, string>;
  sendAt?: number;
}

export interface Attachment {
  content: string; // Base64 encoded
  type?: string;
  filename: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface MailSettings {
  bypassListManagement?: { enable: boolean };
  bypassSpamManagement?: { enable: boolean };
  bypassBounceManagement?: { enable: boolean };
  bypassUnsubscribeManagement?: { enable: boolean };
  footer?: { enable: boolean; text?: string; html?: string };
  sandboxMode?: { enable: boolean };
}

export interface TrackingSettings {
  clickTracking?: { enable: boolean; enableText?: boolean };
  openTracking?: { enable: boolean; substitutionTag?: string };
  subscriptionTracking?: {
    enable: boolean;
    text?: string;
    html?: string;
    substitutionTag?: string;
  };
  ganalytics?: {
    enable: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmTerm?: string;
    utmContent?: string;
    utmCampaign?: string;
  };
}

export interface SendEmailInput {
  personalizations: Personalization[];
  from: EmailAddress;
  replyTo?: EmailAddress;
  replyToList?: EmailAddress[];
  subject?: string;
  content?: EmailContent[];
  attachments?: Attachment[];
  templateId?: string;
  headers?: Record<string, string>;
  categories?: string[];
  customArgs?: Record<string, string>;
  sendAt?: number;
  batchId?: string;
  asm?: {
    groupId: number;
    groupsToDisplay?: number[];
  };
  ipPoolName?: string;
  mailSettings?: MailSettings;
  trackingSettings?: TrackingSettings;
}

// =============================================================================
// Contacts (Marketing Campaigns)
// =============================================================================

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  alternateEmails?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvinceRegion?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  line?: string;
  facebook?: string;
  uniqueName?: string;
  listIds?: string[];
  segmentIds?: string[];
  customFields?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  alternateEmails?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvinceRegion?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  line?: string;
  facebook?: string;
  uniqueName?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Contact Lists
// =============================================================================

export interface ContactList {
  id: string;
  name: string;
  contactCount: number;
  sampleContacts?: Contact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactListInput {
  name: string;
}

// =============================================================================
// Segments
// =============================================================================

export interface Segment {
  id: string;
  name: string;
  queryDsl?: string;
  contactsCount?: number;
  sampleContacts?: Contact[];
  createdAt?: string;
  updatedAt?: string;
  parentListIds?: string[];
}

export interface SegmentInput {
  name: string;
  queryDsl: string;
  parentListIds?: string[];
}

// =============================================================================
// Custom Fields
// =============================================================================

export interface CustomField {
  id: string;
  name: string;
  fieldType: 'Text' | 'Number' | 'Date';
  readOnly?: boolean;
}

export interface CustomFieldInput {
  name: string;
  fieldType: 'Text' | 'Number' | 'Date';
}

// =============================================================================
// Templates
// =============================================================================

export interface Template {
  id: string;
  name: string;
  generation: 'legacy' | 'dynamic';
  updatedAt?: string;
  versions?: TemplateVersion[];
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  name: string;
  active: boolean;
  htmlContent?: string;
  plainContent?: string;
  subject?: string;
  editor?: 'code' | 'design';
  generatePlainContent?: boolean;
  updatedAt?: string;
  thumbnailUrl?: string;
}

export interface TemplateInput {
  name: string;
  generation?: 'legacy' | 'dynamic';
}

export interface TemplateVersionInput {
  name: string;
  subject?: string;
  htmlContent?: string;
  plainContent?: string;
  active?: boolean;
  editor?: 'code' | 'design';
  generatePlainContent?: boolean;
  testData?: string;
}

// =============================================================================
// Single Sends (Marketing Campaigns)
// =============================================================================

export interface SingleSend {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'triggered';
  categories?: string[];
  sendAt?: string;
  sendTo?: {
    listIds?: string[];
    segmentIds?: string[];
    all?: boolean;
  };
  emailConfig?: {
    subject?: string;
    htmlContent?: string;
    plainContent?: string;
    generatePlainContent?: boolean;
    designId?: string;
    editor?: 'code' | 'design';
    suppressionGroupId?: number;
    customUnsubscribeUrl?: string;
    senderId?: number;
    ipPool?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SingleSendInput {
  name: string;
  categories?: string[];
  sendAt?: string;
  sendTo?: {
    listIds?: string[];
    segmentIds?: string[];
    all?: boolean;
  };
  emailConfig?: {
    subject?: string;
    htmlContent?: string;
    plainContent?: string;
    generatePlainContent?: boolean;
    designId?: string;
    editor?: 'code' | 'design';
    suppressionGroupId?: number;
    customUnsubscribeUrl?: string;
    senderId?: number;
    ipPool?: string;
  };
}

// =============================================================================
// Sender Identities
// =============================================================================

export interface SenderIdentity {
  id: number;
  nickname: string;
  from: EmailAddress;
  replyTo?: EmailAddress;
  address: string;
  address2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  verified: boolean;
  locked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SenderIdentityInput {
  nickname: string;
  from: EmailAddress;
  replyTo?: EmailAddress;
  address: string;
  address2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

// =============================================================================
// Statistics
// =============================================================================

export interface Stats {
  date: string;
  stats: StatMetrics[];
}

export interface StatMetrics {
  metrics: {
    blocks?: number;
    bounceDrops?: number;
    bounces?: number;
    clicks?: number;
    deferred?: number;
    delivered?: number;
    invalidEmails?: number;
    opens?: number;
    processed?: number;
    requests?: number;
    spamReportDrops?: number;
    spamReports?: number;
    uniqueClicks?: number;
    uniqueOpens?: number;
    unsubscribeDrops?: number;
    unsubscribes?: number;
  };
  name?: string; // For category stats
  type?: string; // For browser/device stats
}

// =============================================================================
// Suppressions
// =============================================================================

export interface Bounce {
  email: string;
  reason: string;
  status: string;
  created: number;
}

export interface Block {
  email: string;
  reason: string;
  status: string;
  created: number;
}

export interface SpamReport {
  email: string;
  ip?: string;
  created: number;
}

export interface InvalidEmail {
  email: string;
  reason: string;
  created: number;
}

export interface GlobalSuppression {
  email: string;
  created: number;
}

// =============================================================================
// Unsubscribe Groups (Suppression Groups)
// =============================================================================

export interface UnsubscribeGroup {
  id: number;
  name: string;
  description: string;
  isDefault?: boolean;
  unsubscribes?: number;
}

export interface UnsubscribeGroupInput {
  name: string;
  description: string;
  isDefault?: boolean;
}

export interface GroupSuppression {
  email: string;
  groupId: number;
  groupName?: string;
  createdAt?: number;
}

// =============================================================================
// API Keys
// =============================================================================

export interface ApiKey {
  apiKeyId: string;
  name: string;
  scopes?: string[];
}

export interface ApiKeyInput {
  name: string;
  scopes?: string[];
}

// =============================================================================
// Webhooks (Event Webhook)
// =============================================================================

export interface EventWebhook {
  enabled: boolean;
  url: string;
  groupResubscribe?: boolean;
  delivered?: boolean;
  groupUnsubscribe?: boolean;
  spamReport?: boolean;
  bounce?: boolean;
  deferred?: boolean;
  unsubscribe?: boolean;
  processed?: boolean;
  open?: boolean;
  click?: boolean;
  dropped?: boolean;
  oauthClientId?: string;
  oauthTokenUrl?: string;
}

export interface EventWebhookInput {
  enabled: boolean;
  url: string;
  groupResubscribe?: boolean;
  delivered?: boolean;
  groupUnsubscribe?: boolean;
  spamReport?: boolean;
  bounce?: boolean;
  deferred?: boolean;
  unsubscribe?: boolean;
  processed?: boolean;
  open?: boolean;
  click?: boolean;
  dropped?: boolean;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthTokenUrl?: string;
}

// =============================================================================
// Domain Authentication
// =============================================================================

export interface AuthenticatedDomain {
  id: number;
  domain: string;
  subdomain?: string;
  username: string;
  userId: number;
  ips?: string[];
  customSpf?: boolean;
  default?: boolean;
  legacy?: boolean;
  automaticSecurity?: boolean;
  valid?: boolean;
  dns: {
    mailCname?: DnsRecord;
    dkim1?: DnsRecord;
    dkim2?: DnsRecord;
  };
}

export interface DnsRecord {
  valid: boolean;
  type: string;
  host: string;
  data: string;
}

export interface DomainAuthInput {
  domain: string;
  subdomain?: string;
  customSpf?: boolean;
  default?: boolean;
  automaticSecurity?: boolean;
}

// =============================================================================
// Link Branding
// =============================================================================

export interface BrandedLink {
  id: number;
  domain: string;
  subdomain?: string;
  username: string;
  userId: number;
  default?: boolean;
  legacy?: boolean;
  valid?: boolean;
  dns: {
    domainCname: DnsRecord;
    ownerCname?: DnsRecord;
  };
}

export interface BrandedLinkInput {
  domain: string;
  subdomain?: string;
  default?: boolean;
}

// =============================================================================
// IP Management
// =============================================================================

export interface IpAddress {
  ip: string;
  pools?: string[];
  warmup?: boolean;
  startDate?: number;
  subusers?: string[];
  rdns?: string;
  assignedAt?: number;
}

export interface IpPool {
  name: string;
  ips?: string[];
}

export interface IpPoolInput {
  name: string;
}

// =============================================================================
// Subusers
// =============================================================================

export interface Subuser {
  id: number;
  username: string;
  email: string;
  disabled?: boolean;
  creditAllocation?: {
    type: 'unlimited' | 'recurring' | 'nonrecurring';
  };
}

export interface SubuserInput {
  username: string;
  email: string;
  password: string;
  ips: string[];
}

// =============================================================================
// Teammates
// =============================================================================

export interface Teammate {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  website?: string;
  company?: string;
  isAdmin?: boolean;
  scopes?: string[];
}

export interface TeammateInput {
  email: string;
  scopes: string[];
  isAdmin?: boolean;
}

// =============================================================================
// Inbound Parse
// =============================================================================

export interface InboundParseWebhook {
  url: string;
  hostname: string;
  spamCheck?: boolean;
  sendRaw?: boolean;
}

export interface InboundParseWebhookInput {
  url: string;
  hostname: string;
  spamCheck?: boolean;
  sendRaw?: boolean;
}

// =============================================================================
// Email Validation
// =============================================================================

export interface EmailValidationResult {
  email: string;
  verdict: 'Valid' | 'Risky' | 'Invalid';
  score: number;
  local: string;
  host: string;
  suggestion?: string;
  checks: {
    domain: {
      hasValidAddressSyntax: boolean;
      hasMxOrARecord: boolean;
      isSuspectedDisposableAddress: boolean;
    };
    localPart: {
      isSuspectedRoleAddress: boolean;
    };
    additional: {
      hasKnownBounces: boolean;
      hasSuspectedBounces: boolean;
    };
  };
  ipAddress?: string;
}

// =============================================================================
// Scheduled Sends
// =============================================================================

export interface ScheduledSend {
  batchId: string;
  status: 'cancel' | 'pause';
}

// =============================================================================
// Alerts
// =============================================================================

export interface Alert {
  id: number;
  type: 'stats_notification' | 'usage_limit';
  emailTo: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  percentage?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface AlertInput {
  type: 'stats_notification' | 'usage_limit';
  emailTo: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  percentage?: number;
}

// =============================================================================
// Design Library
// =============================================================================

export interface Design {
  id: string;
  name: string;
  generatePlainContent?: boolean;
  subject?: string;
  categories?: string[];
  htmlContent?: string;
  plainContent?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  editor?: 'code' | 'design';
}

export interface DesignInput {
  name: string;
  htmlContent?: string;
  plainContent?: string;
  generatePlainContent?: boolean;
  subject?: string;
  categories?: string[];
  editor?: 'code' | 'design';
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Contact,
  ContactList,
  PaginatedResponse,
  ResponseFormat,
  Segment,
  Template,
  UnsubscribeGroup,
  Stats,
  Bounce,
  Block,
  SpamReport,
  SenderIdentity,
  ApiKey,
  Design,
  SingleSend,
} from '../types/entities.js';
import { SendGridApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof SendGridApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.total !== undefined) {
    lines.push(`**Total:** ${data.total} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore && data.nextPageToken) {
    lines.push(`**More available:** Yes (token: \`${data.nextPageToken}\`)`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  switch (entityType) {
    case 'contacts':
      lines.push(formatContactsTable(data.items as Contact[]));
      break;
    case 'lists':
      lines.push(formatListsTable(data.items as ContactList[]));
      break;
    case 'segments':
      lines.push(formatSegmentsTable(data.items as Segment[]));
      break;
    case 'templates':
      lines.push(formatTemplatesTable(data.items as Template[]));
      break;
    case 'senders':
      lines.push(formatSendersTable(data.items as SenderIdentity[]));
      break;
    case 'suppressionGroups':
      lines.push(formatSuppressionGroupsTable(data.items as UnsubscribeGroup[]));
      break;
    case 'bounces':
      lines.push(formatBouncesTable(data.items as Bounce[]));
      break;
    case 'blocks':
      lines.push(formatBlocksTable(data.items as Block[]));
      break;
    case 'spamReports':
      lines.push(formatSpamReportsTable(data.items as SpamReport[]));
      break;
    case 'apiKeys':
      lines.push(formatApiKeysTable(data.items as ApiKey[]));
      break;
    case 'designs':
      lines.push(formatDesignsTable(data.items as Design[]));
      break;
    case 'singleSends':
      lines.push(formatSingleSendsTable(data.items as SingleSend[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format contacts as Markdown table
 */
function formatContactsTable(contacts: Contact[]): string {
  const lines: string[] = [];
  lines.push('| ID | Email | First Name | Last Name | Phone |');
  lines.push('|---|---|---|---|---|');

  for (const contact of contacts) {
    lines.push(
      `| ${contact.id} | ${contact.email || '-'} | ${contact.firstName || '-'} | ${contact.lastName || '-'} | ${contact.phone || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format lists as Markdown table
 */
function formatListsTable(lists: ContactList[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Contact Count |');
  lines.push('|---|---|---|');

  for (const list of lists) {
    lines.push(`| ${list.id} | ${list.name} | ${list.contactCount} |`);
  }

  return lines.join('\n');
}

/**
 * Format segments as Markdown table
 */
function formatSegmentsTable(segments: Segment[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Contact Count |');
  lines.push('|---|---|---|');

  for (const segment of segments) {
    lines.push(`| ${segment.id} | ${segment.name} | ${segment.contactsCount || '-'} |`);
  }

  return lines.join('\n');
}

/**
 * Format templates as Markdown table
 */
function formatTemplatesTable(templates: Template[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Generation | Updated |');
  lines.push('|---|---|---|---|');

  for (const template of templates) {
    lines.push(
      `| ${template.id} | ${template.name} | ${template.generation} | ${template.updatedAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format senders as Markdown table
 */
function formatSendersTable(senders: SenderIdentity[]): string {
  const lines: string[] = [];
  lines.push('| ID | Nickname | From Email | Verified |');
  lines.push('|---|---|---|---|');

  for (const sender of senders) {
    lines.push(
      `| ${sender.id} | ${sender.nickname} | ${sender.from.email} | ${sender.verified ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format suppression groups as Markdown table
 */
function formatSuppressionGroupsTable(groups: UnsubscribeGroup[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Description | Default |');
  lines.push('|---|---|---|---|');

  for (const group of groups) {
    lines.push(
      `| ${group.id} | ${group.name} | ${group.description} | ${group.isDefault ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format bounces as Markdown table
 */
function formatBouncesTable(bounces: Bounce[]): string {
  const lines: string[] = [];
  lines.push('| Email | Reason | Status | Created |');
  lines.push('|---|---|---|---|');

  for (const bounce of bounces) {
    const created = new Date(bounce.created * 1000).toISOString();
    lines.push(`| ${bounce.email} | ${bounce.reason} | ${bounce.status} | ${created} |`);
  }

  return lines.join('\n');
}

/**
 * Format blocks as Markdown table
 */
function formatBlocksTable(blocks: Block[]): string {
  const lines: string[] = [];
  lines.push('| Email | Reason | Status | Created |');
  lines.push('|---|---|---|---|');

  for (const block of blocks) {
    const created = new Date(block.created * 1000).toISOString();
    lines.push(`| ${block.email} | ${block.reason} | ${block.status} | ${created} |`);
  }

  return lines.join('\n');
}

/**
 * Format spam reports as Markdown table
 */
function formatSpamReportsTable(reports: SpamReport[]): string {
  const lines: string[] = [];
  lines.push('| Email | IP | Created |');
  lines.push('|---|---|---|');

  for (const report of reports) {
    const created = new Date(report.created * 1000).toISOString();
    lines.push(`| ${report.email} | ${report.ip || '-'} | ${created} |`);
  }

  return lines.join('\n');
}

/**
 * Format API keys as Markdown table
 */
function formatApiKeysTable(keys: ApiKey[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Scopes |');
  lines.push('|---|---|---|');

  for (const key of keys) {
    const scopes = key.scopes?.slice(0, 3).join(', ') || '-';
    lines.push(`| ${key.apiKeyId} | ${key.name} | ${scopes}${key.scopes && key.scopes.length > 3 ? '...' : ''} |`);
  }

  return lines.join('\n');
}

/**
 * Format designs as Markdown table
 */
function formatDesignsTable(designs: Design[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Editor | Updated |');
  lines.push('|---|---|---|---|');

  for (const design of designs) {
    lines.push(
      `| ${design.id} | ${design.name} | ${design.editor || '-'} | ${design.updatedAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format single sends as Markdown table
 */
function formatSingleSendsTable(sends: SingleSend[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Send At |');
  lines.push('|---|---|---|---|');

  for (const send of sends) {
    lines.push(`| ${send.id} | ${send.name} | ${send.status} | ${send.sendAt || '-'} |`);
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  if (entityType === 'stats') {
    return formatStatsAsMarkdown(data as Stats[]);
  }
  return formatGenericTable(data);
}

/**
 * Format stats as Markdown
 */
function formatStatsAsMarkdown(stats: Stats[]): string {
  const lines: string[] = [];

  lines.push('## Email Statistics');
  lines.push('');

  for (const stat of stats) {
    lines.push(`### ${stat.date}`);
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|---|---|');

    for (const s of stat.stats) {
      const metrics = s.metrics;
      if (metrics.requests !== undefined) lines.push(`| Requests | ${metrics.requests} |`);
      if (metrics.delivered !== undefined) lines.push(`| Delivered | ${metrics.delivered} |`);
      if (metrics.opens !== undefined) lines.push(`| Opens | ${metrics.opens} |`);
      if (metrics.uniqueOpens !== undefined) lines.push(`| Unique Opens | ${metrics.uniqueOpens} |`);
      if (metrics.clicks !== undefined) lines.push(`| Clicks | ${metrics.clicks} |`);
      if (metrics.uniqueClicks !== undefined)
        lines.push(`| Unique Clicks | ${metrics.uniqueClicks} |`);
      if (metrics.bounces !== undefined) lines.push(`| Bounces | ${metrics.bounces} |`);
      if (metrics.blocks !== undefined) lines.push(`| Blocks | ${metrics.blocks} |`);
      if (metrics.spamReports !== undefined) lines.push(`| Spam Reports | ${metrics.spamReports} |`);
      if (metrics.unsubscribes !== undefined)
        lines.push(`| Unsubscribes | ${metrics.unsubscribes} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

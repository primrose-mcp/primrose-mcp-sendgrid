/**
 * Statistics Tools
 *
 * MCP tools for retrieving SendGrid email statistics.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register statistics tools
 */
export function registerStatsTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // Get Global Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_stats',
    `Get global email statistics.

Args:
  - startDate: Start date (YYYY-MM-DD format, required)
  - endDate: End date (YYYY-MM-DD format, optional)
  - aggregatedBy: Aggregation period ('day', 'week', or 'month')
  - format: Response format

Returns:
  Email statistics including requests, delivered, opens, clicks, bounces, etc.`,
    {
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
      aggregatedBy: z.enum(['day', 'week', 'month']).optional().describe('Aggregation period'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startDate, endDate, aggregatedBy, format }) => {
      try {
        const stats = await client.getGlobalStats(startDate, endDate, aggregatedBy);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Category Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_category_stats',
    `Get email statistics by category.

Categories are tags you assign when sending emails for tracking purposes.

Args:
  - categories: Array of category names to get stats for
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (YYYY-MM-DD, optional)
  - aggregatedBy: Aggregation period
  - format: Response format

Returns:
  Statistics broken down by category.`,
    {
      categories: z.array(z.string()).min(1).describe('Category names'),
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date'),
      aggregatedBy: z.enum(['day', 'week', 'month']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ categories, startDate, endDate, aggregatedBy, format }) => {
      try {
        const stats = await client.getCategoryStats(categories, startDate, endDate, aggregatedBy);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Mailbox Provider Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_mailbox_provider_stats',
    `Get statistics by mailbox provider (Gmail, Yahoo, Outlook, etc.).

Args:
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (optional)
  - mailboxProviders: Filter to specific providers (optional)
  - format: Response format

Returns:
  Statistics broken down by mailbox provider.`,
    {
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date'),
      mailboxProviders: z.array(z.string()).optional().describe('Specific providers to include'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startDate, endDate, mailboxProviders, format }) => {
      try {
        const stats = await client.getMailboxProviderStats(startDate, endDate, mailboxProviders);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Browser Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_browser_stats',
    `Get statistics by browser type for link clicks.

Args:
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (optional)
  - format: Response format

Returns:
  Click statistics broken down by browser.`,
    {
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startDate, endDate, format }) => {
      try {
        const stats = await client.getBrowserStats(startDate, endDate);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Device Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_device_stats',
    `Get statistics by device type (desktop, phone, tablet, etc.).

Args:
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (optional)
  - format: Response format

Returns:
  Statistics broken down by device type.`,
    {
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startDate, endDate, format }) => {
      try {
        const stats = await client.getDeviceStats(startDate, endDate);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Geography Stats
  // ===========================================================================
  server.tool(
    'sendgrid_get_geography_stats',
    `Get statistics by geographic location.

Args:
  - startDate: Start date (YYYY-MM-DD)
  - endDate: End date (optional)
  - country: Filter to a specific country (optional)
  - format: Response format

Returns:
  Statistics broken down by geography.`,
    {
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date'),
      country: z.string().optional().describe('Country code to filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startDate, endDate, country, format }) => {
      try {
        const stats = await client.getGeographyStats(startDate, endDate, country);
        return formatResponse(stats, format, 'stats');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

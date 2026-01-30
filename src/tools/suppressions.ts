/**
 * Suppression Tools
 *
 * MCP tools for managing SendGrid suppressions (bounces, blocks, spam reports, etc.).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register suppression tools
 */
export function registerSuppressionTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Bounces
  // ===========================================================================
  server.tool(
    'sendgrid_list_bounces',
    `List email addresses that have bounced.

Args:
  - startTime: Unix timestamp for start time filter
  - endTime: Unix timestamp for end time filter
  - limit: Number of results (default 500)
  - offset: Offset for pagination
  - format: Response format

Returns:
  List of bounced email addresses with reasons.`,
    {
      startTime: z.number().int().optional().describe('Start time (Unix timestamp)'),
      endTime: z.number().int().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startTime, endTime, limit, offset, format }) => {
      try {
        const result = await client.listBounces(startTime, endTime, limit, offset);
        return formatResponse(result, format, 'bounces');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Bounce
  // ===========================================================================
  server.tool(
    'sendgrid_get_bounce',
    `Get bounce information for a specific email address.

Args:
  - email: Email address to look up

Returns:
  Bounce details if the email has bounced.`,
    {
      email: z.string().email().describe('Email address'),
    },
    async ({ email }) => {
      try {
        const bounces = await client.getBounce(email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ email, bounces }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Bounces
  // ===========================================================================
  server.tool(
    'sendgrid_delete_bounces',
    `Delete bounce records to allow re-sending to those addresses.

Args:
  - emails: Array of email addresses to remove from bounces
  - deleteAll: Delete ALL bounce records (use with caution!)

Returns:
  Confirmation of deletion.`,
    {
      emails: z.array(z.string().email()).optional().describe('Emails to delete'),
      deleteAll: z.boolean().optional().describe('Delete all bounces'),
    },
    async ({ emails, deleteAll }) => {
      try {
        if (!emails && !deleteAll) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { error: 'Either emails or deleteAll must be provided' },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
        await client.deleteBounces(emails || [], deleteAll || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: deleteAll
                    ? 'All bounces deleted'
                    : `${emails?.length} bounce(s) deleted`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Blocks
  // ===========================================================================
  server.tool(
    'sendgrid_list_blocks',
    `List email addresses that have been blocked.

Blocks occur when the receiving server rejects the email (different from bounces).

Args:
  - startTime: Unix timestamp for start time
  - endTime: Unix timestamp for end time
  - limit: Number of results
  - offset: Pagination offset
  - format: Response format

Returns:
  List of blocked email addresses.`,
    {
      startTime: z.number().int().optional(),
      endTime: z.number().int().optional(),
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startTime, endTime, limit, offset, format }) => {
      try {
        const result = await client.listBlocks(startTime, endTime, limit, offset);
        return formatResponse(result, format, 'blocks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Blocks
  // ===========================================================================
  server.tool(
    'sendgrid_delete_blocks',
    `Delete block records.

Args:
  - emails: Array of email addresses to remove from blocks
  - deleteAll: Delete ALL block records

Returns:
  Confirmation of deletion.`,
    {
      emails: z.array(z.string().email()).optional(),
      deleteAll: z.boolean().optional(),
    },
    async ({ emails, deleteAll }) => {
      try {
        if (!emails && !deleteAll) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Either emails or deleteAll required' }, null, 2),
              },
            ],
            isError: true,
          };
        }
        await client.deleteBlocks(emails || [], deleteAll || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Blocks deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Spam Reports
  // ===========================================================================
  server.tool(
    'sendgrid_list_spam_reports',
    `List email addresses that have reported emails as spam.

Args:
  - startTime: Unix timestamp for start time
  - endTime: Unix timestamp for end time
  - limit: Number of results
  - offset: Pagination offset
  - format: Response format

Returns:
  List of spam reports.`,
    {
      startTime: z.number().int().optional(),
      endTime: z.number().int().optional(),
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startTime, endTime, limit, offset, format }) => {
      try {
        const result = await client.listSpamReports(startTime, endTime, limit, offset);
        return formatResponse(result, format, 'spamReports');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Spam Reports
  // ===========================================================================
  server.tool(
    'sendgrid_delete_spam_reports',
    `Delete spam report records.

Warning: Sending to addresses that reported spam may harm your sender reputation.

Args:
  - emails: Array of email addresses to remove
  - deleteAll: Delete ALL spam reports

Returns:
  Confirmation of deletion.`,
    {
      emails: z.array(z.string().email()).optional(),
      deleteAll: z.boolean().optional(),
    },
    async ({ emails, deleteAll }) => {
      try {
        if (!emails && !deleteAll) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Either emails or deleteAll required' }, null, 2),
              },
            ],
            isError: true,
          };
        }
        await client.deleteSpamReports(emails || [], deleteAll || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Spam reports deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Invalid Emails
  // ===========================================================================
  server.tool(
    'sendgrid_list_invalid_emails',
    `List email addresses that are invalid.

Args:
  - startTime: Unix timestamp for start time
  - endTime: Unix timestamp for end time
  - limit: Number of results
  - offset: Pagination offset
  - format: Response format

Returns:
  List of invalid email addresses.`,
    {
      startTime: z.number().int().optional(),
      endTime: z.number().int().optional(),
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startTime, endTime, limit, offset, format }) => {
      try {
        const result = await client.listInvalidEmails(startTime, endTime, limit, offset);
        return formatResponse(result, format, 'invalidEmails');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Invalid Emails
  // ===========================================================================
  server.tool(
    'sendgrid_delete_invalid_emails',
    `Delete invalid email records.

Args:
  - emails: Array of email addresses to remove
  - deleteAll: Delete ALL invalid emails

Returns:
  Confirmation of deletion.`,
    {
      emails: z.array(z.string().email()).optional(),
      deleteAll: z.boolean().optional(),
    },
    async ({ emails, deleteAll }) => {
      try {
        if (!emails && !deleteAll) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Either emails or deleteAll required' }, null, 2),
              },
            ],
            isError: true,
          };
        }
        await client.deleteInvalidEmails(emails || [], deleteAll || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Invalid emails deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Global Suppressions (Unsubscribes)
  // ===========================================================================
  server.tool(
    'sendgrid_list_global_unsubscribes',
    `List email addresses that have globally unsubscribed.

These addresses will not receive any emails until removed.

Args:
  - startTime: Unix timestamp for start time
  - endTime: Unix timestamp for end time
  - limit: Number of results
  - offset: Pagination offset
  - format: Response format

Returns:
  List of globally unsubscribed addresses.`,
    {
      startTime: z.number().int().optional(),
      endTime: z.number().int().optional(),
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ startTime, endTime, limit, offset, format }) => {
      try {
        const result = await client.listGlobalSuppressions(startTime, endTime, limit, offset);
        return formatResponse(result, format, 'globalUnsubscribes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Global Suppression
  // ===========================================================================
  server.tool(
    'sendgrid_add_global_unsubscribe',
    `Add email addresses to the global unsubscribe list.

Args:
  - emails: Array of email addresses to add

Returns:
  Confirmation of addition.`,
    {
      emails: z.array(z.string().email()).min(1).describe('Email addresses to add'),
    },
    async ({ emails }) => {
      try {
        await client.addGlobalSuppression(emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `${emails.length} email(s) added to global unsubscribe`,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Global Suppression
  // ===========================================================================
  server.tool(
    'sendgrid_delete_global_unsubscribe',
    `Remove an email address from the global unsubscribe list.

Args:
  - email: Email address to remove

Returns:
  Confirmation of removal.`,
    {
      email: z.string().email().describe('Email address to remove'),
    },
    async ({ email }) => {
      try {
        await client.deleteGlobalSuppression(email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `${email} removed from global unsubscribe` },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

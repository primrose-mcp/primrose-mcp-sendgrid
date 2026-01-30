/**
 * Single Sends Tools (Marketing Campaigns)
 *
 * MCP tools for managing SendGrid Single Sends.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register single send tools
 */
export function registerSingleSendTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Single Sends
  // ===========================================================================
  server.tool(
    'sendgrid_list_single_sends',
    `List marketing single sends (campaigns).

Args:
  - status: Filter by status ('draft', 'scheduled', 'triggered')
  - format: Response format

Returns:
  List of single sends.`,
    {
      status: z.enum(['draft', 'scheduled', 'triggered']).optional().describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ status, format }) => {
      try {
        const result = await client.listSingleSends(status);
        return formatResponse(result, format, 'singleSends');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_get_single_send',
    `Get a single send by ID.

Args:
  - id: Single send ID
  - format: Response format

Returns:
  Single send details.`,
    {
      id: z.string().describe('Single send ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const singleSend = await client.getSingleSend(id);
        return formatResponse(singleSend, format, 'singleSend');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_create_single_send',
    `Create a new single send (marketing campaign).

Args:
  - name: Campaign name
  - subject: Email subject
  - htmlContent: HTML email body
  - plainContent: Plain text body (optional, can be auto-generated)
  - senderId: Sender identity ID
  - listIds: List IDs to send to
  - segmentIds: Segment IDs to send to
  - sendToAll: Send to all contacts
  - categories: Tracking categories
  - suppressionGroupId: Unsubscribe group ID

Returns:
  The created single send.`,
    {
      name: z.string().min(1).describe('Campaign name'),
      subject: z.string().optional().describe('Email subject'),
      htmlContent: z.string().optional().describe('HTML content'),
      plainContent: z.string().optional().describe('Plain text content'),
      senderId: z.number().int().optional().describe('Sender identity ID'),
      listIds: z.array(z.string()).optional().describe('List IDs'),
      segmentIds: z.array(z.string()).optional().describe('Segment IDs'),
      sendToAll: z.boolean().optional().describe('Send to all contacts'),
      categories: z.array(z.string()).optional().describe('Categories'),
      suppressionGroupId: z.number().int().optional().describe('Suppression group ID'),
    },
    async ({
      name,
      subject,
      htmlContent,
      plainContent,
      senderId,
      listIds,
      segmentIds,
      sendToAll,
      categories,
      suppressionGroupId,
    }) => {
      try {
        const singleSend = await client.createSingleSend({
          name,
          categories,
          sendTo:
            listIds || segmentIds || sendToAll
              ? {
                  listIds,
                  segmentIds,
                  all: sendToAll,
                }
              : undefined,
          emailConfig:
            subject || htmlContent
              ? {
                  subject,
                  htmlContent,
                  plainContent,
                  generatePlainContent: !plainContent && !!htmlContent,
                  senderId,
                  suppressionGroupId,
                }
              : undefined,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Single send created', singleSend },
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
  // Update Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_update_single_send',
    `Update a single send.

Args:
  - id: Single send ID
  - name: New name
  - subject: New subject
  - htmlContent: New HTML content
  - listIds: New list IDs
  - segmentIds: New segment IDs

Returns:
  The updated single send.`,
    {
      id: z.string().describe('Single send ID'),
      name: z.string().optional().describe('Campaign name'),
      subject: z.string().optional().describe('Subject'),
      htmlContent: z.string().optional().describe('HTML content'),
      listIds: z.array(z.string()).optional().describe('List IDs'),
      segmentIds: z.array(z.string()).optional().describe('Segment IDs'),
    },
    async ({ id, name, subject, htmlContent, listIds, segmentIds }) => {
      try {
        const singleSend = await client.updateSingleSend(id, {
          name,
          sendTo: listIds || segmentIds ? { listIds, segmentIds } : undefined,
          emailConfig: subject || htmlContent ? { subject, htmlContent } : undefined,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Single send updated', singleSend },
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
  // Delete Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_delete_single_send',
    `Delete a single send.

Args:
  - id: Single send ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('Single send ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteSingleSend(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Single send ${id} deleted` },
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
  // Schedule Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_schedule_single_send',
    `Schedule a single send for future delivery.

Args:
  - id: Single send ID
  - sendAt: ISO 8601 datetime string

Returns:
  The scheduled single send.`,
    {
      id: z.string().describe('Single send ID'),
      sendAt: z.string().describe('ISO 8601 datetime (e.g., 2024-12-25T10:00:00Z)'),
    },
    async ({ id, sendAt }) => {
      try {
        const singleSend = await client.scheduleSingleSend(id, sendAt);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Single send scheduled for ${sendAt}`, singleSend },
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
  // Cancel Scheduled Single Send
  // ===========================================================================
  server.tool(
    'sendgrid_cancel_single_send_schedule',
    `Cancel a scheduled single send.

Returns the single send to draft status.

Args:
  - id: Single send ID

Returns:
  Confirmation of cancellation.`,
    {
      id: z.string().describe('Single send ID'),
    },
    async ({ id }) => {
      try {
        await client.cancelScheduledSingleSend(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Single send ${id} schedule cancelled` },
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
  // Send Single Send Now
  // ===========================================================================
  server.tool(
    'sendgrid_send_single_send_now',
    `Send a single send immediately.

Args:
  - id: Single send ID

Returns:
  The triggered single send.`,
    {
      id: z.string().describe('Single send ID'),
    },
    async ({ id }) => {
      try {
        const singleSend = await client.sendSingleSendNow(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Single send triggered', singleSend },
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

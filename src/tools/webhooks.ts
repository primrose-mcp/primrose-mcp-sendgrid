/**
 * Webhook Tools
 *
 * MCP tools for managing SendGrid webhooks.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register webhook tools
 */
export function registerWebhookTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // Get Event Webhook Settings
  // ===========================================================================
  server.tool(
    'sendgrid_get_event_webhook',
    `Get the current event webhook configuration.

Event webhooks send real-time notifications about email events (delivered, opened, clicked, etc.).

Returns:
  Current webhook configuration including URL and enabled events.`,
    {},
    async () => {
      try {
        const webhook = await client.getEventWebhook();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhook, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Event Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_update_event_webhook',
    `Update the event webhook configuration.

Args:
  - enabled: Enable or disable the webhook
  - url: Webhook URL to receive events
  - delivered: Receive delivered events
  - open: Receive open events
  - click: Receive click events
  - bounce: Receive bounce events
  - deferred: Receive deferred events
  - dropped: Receive dropped events
  - spamReport: Receive spam report events
  - unsubscribe: Receive unsubscribe events
  - groupUnsubscribe: Receive group unsubscribe events
  - groupResubscribe: Receive group resubscribe events
  - processed: Receive processed events

Returns:
  The updated webhook configuration.`,
    {
      enabled: z.boolean().describe('Enable webhook'),
      url: z.string().url().describe('Webhook URL'),
      delivered: z.boolean().optional().describe('Delivered events'),
      open: z.boolean().optional().describe('Open events'),
      click: z.boolean().optional().describe('Click events'),
      bounce: z.boolean().optional().describe('Bounce events'),
      deferred: z.boolean().optional().describe('Deferred events'),
      dropped: z.boolean().optional().describe('Dropped events'),
      spamReport: z.boolean().optional().describe('Spam report events'),
      unsubscribe: z.boolean().optional().describe('Unsubscribe events'),
      groupUnsubscribe: z.boolean().optional().describe('Group unsubscribe events'),
      groupResubscribe: z.boolean().optional().describe('Group resubscribe events'),
      processed: z.boolean().optional().describe('Processed events'),
    },
    async ({
      enabled,
      url,
      delivered,
      open,
      click,
      bounce,
      deferred,
      dropped,
      spamReport,
      unsubscribe,
      groupUnsubscribe,
      groupResubscribe,
      processed,
    }) => {
      try {
        const webhook = await client.updateEventWebhook({
          enabled,
          url,
          delivered,
          open,
          click,
          bounce,
          deferred,
          dropped,
          spamReport,
          unsubscribe,
          groupUnsubscribe,
          groupResubscribe,
          processed,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Event webhook updated', webhook },
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
  // Test Event Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_test_event_webhook',
    `Send a test event to the webhook URL.

Args:
  - url: Webhook URL to test

Returns:
  Confirmation that test was sent.`,
    {
      url: z.string().url().describe('Webhook URL to test'),
    },
    async ({ url }) => {
      try {
        await client.testEventWebhook(url);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Test event sent to ${url}` },
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
  // List Inbound Parse Webhooks
  // ===========================================================================
  server.tool(
    'sendgrid_list_inbound_parse_webhooks',
    `List all inbound parse webhook configurations.

Inbound Parse allows you to receive emails and process them via webhook.

Returns:
  All inbound parse configurations.`,
    {},
    async () => {
      try {
        const webhooks = await client.listInboundParseWebhooks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ webhooks }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Inbound Parse Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_get_inbound_parse_webhook',
    `Get an inbound parse webhook by hostname.

Args:
  - hostname: The hostname/domain configured for inbound parse

Returns:
  Webhook configuration.`,
    {
      hostname: z.string().describe('Hostname'),
    },
    async ({ hostname }) => {
      try {
        const webhook = await client.getInboundParseWebhook(hostname);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhook, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Inbound Parse Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_create_inbound_parse_webhook',
    `Create an inbound parse webhook.

Note: You must configure MX records for the hostname to point to mx.sendgrid.net.

Args:
  - hostname: Domain to receive emails on (e.g., parse.example.com)
  - url: Webhook URL to receive parsed emails
  - spamCheck: Check for spam before parsing
  - sendRaw: Send raw MIME message instead of parsed

Returns:
  The created webhook configuration.`,
    {
      hostname: z.string().describe('Hostname/domain'),
      url: z.string().url().describe('Webhook URL'),
      spamCheck: z.boolean().default(false).describe('Enable spam check'),
      sendRaw: z.boolean().default(false).describe('Send raw MIME'),
    },
    async ({ hostname, url, spamCheck, sendRaw }) => {
      try {
        const webhook = await client.createInboundParseWebhook({
          hostname,
          url,
          spamCheck,
          sendRaw,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Inbound parse webhook created', webhook },
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
  // Update Inbound Parse Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_update_inbound_parse_webhook',
    `Update an inbound parse webhook.

Args:
  - hostname: Hostname to update
  - url: New webhook URL
  - spamCheck: Enable spam check
  - sendRaw: Send raw MIME

Returns:
  The updated webhook configuration.`,
    {
      hostname: z.string().describe('Hostname'),
      url: z.string().url().optional().describe('New URL'),
      spamCheck: z.boolean().optional().describe('Spam check'),
      sendRaw: z.boolean().optional().describe('Send raw'),
    },
    async ({ hostname, url, spamCheck, sendRaw }) => {
      try {
        const webhook = await client.updateInboundParseWebhook(hostname, {
          url,
          spamCheck,
          sendRaw,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Inbound parse webhook updated', webhook },
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
  // Delete Inbound Parse Webhook
  // ===========================================================================
  server.tool(
    'sendgrid_delete_inbound_parse_webhook',
    `Delete an inbound parse webhook.

Args:
  - hostname: Hostname to delete

Returns:
  Confirmation of deletion.`,
    {
      hostname: z.string().describe('Hostname'),
    },
    async ({ hostname }) => {
      try {
        await client.deleteInboundParseWebhook(hostname);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Inbound parse webhook for ${hostname} deleted` },
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

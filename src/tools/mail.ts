/**
 * Mail Send Tools
 *
 * MCP tools for sending emails via SendGrid.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register mail send tools
 */
export function registerMailTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // Send Email
  // ===========================================================================
  server.tool(
    'sendgrid_send_email',
    `Send an email using SendGrid.

Args:
  - to: Array of recipient email addresses (required)
  - from: Sender email address (required)
  - fromName: Sender name (optional)
  - subject: Email subject line (required, unless using a template with subject)
  - text: Plain text email body (optional)
  - html: HTML email body (optional)
  - templateId: SendGrid template ID for dynamic templates (optional)
  - dynamicTemplateData: Data for template substitution (optional)
  - cc: Array of CC email addresses (optional)
  - bcc: Array of BCC email addresses (optional)
  - replyTo: Reply-to email address (optional)
  - categories: Array of categories for tracking (optional)
  - sendAt: Unix timestamp for scheduled sending (optional)
  - attachments: Array of attachments with base64 content (optional)

Returns:
  Confirmation of email being accepted for delivery.`,
    {
      to: z.array(z.string().email()).min(1).describe('Recipient email addresses'),
      from: z.string().email().describe('Sender email address'),
      fromName: z.string().optional().describe('Sender name'),
      subject: z.string().optional().describe('Email subject line'),
      text: z.string().optional().describe('Plain text email body'),
      html: z.string().optional().describe('HTML email body'),
      templateId: z.string().optional().describe('SendGrid template ID'),
      dynamicTemplateData: z.record(z.string(), z.unknown()).optional().describe('Template substitution data'),
      cc: z.array(z.string().email()).optional().describe('CC email addresses'),
      bcc: z.array(z.string().email()).optional().describe('BCC email addresses'),
      replyTo: z.string().email().optional().describe('Reply-to email address'),
      categories: z.array(z.string()).optional().describe('Tracking categories'),
      sendAt: z.number().int().optional().describe('Unix timestamp for scheduled send'),
      attachments: z
        .array(
          z.object({
            content: z.string().describe('Base64 encoded file content'),
            filename: z.string().describe('Filename'),
            type: z.string().optional().describe('MIME type'),
            disposition: z.enum(['attachment', 'inline']).optional(),
          })
        )
        .optional()
        .describe('File attachments'),
    },
    async ({
      to,
      from,
      fromName,
      subject,
      text,
      html,
      templateId,
      dynamicTemplateData,
      cc,
      bcc,
      replyTo,
      categories,
      sendAt,
      attachments,
    }) => {
      try {
        const content: Array<{ type: 'text/plain' | 'text/html'; value: string }> = [];
        if (text) content.push({ type: 'text/plain', value: text });
        if (html) content.push({ type: 'text/html', value: html });

        const personalization: {
          to: Array<{ email: string }>;
          cc?: Array<{ email: string }>;
          bcc?: Array<{ email: string }>;
          dynamicTemplateData?: Record<string, unknown>;
        } = {
          to: to.map((email) => ({ email })),
        };

        if (cc) personalization.cc = cc.map((email) => ({ email }));
        if (bcc) personalization.bcc = bcc.map((email) => ({ email }));
        if (dynamicTemplateData) personalization.dynamicTemplateData = dynamicTemplateData;

        const result = await client.sendEmail({
          personalizations: [personalization],
          from: { email: from, name: fromName },
          subject,
          content: content.length > 0 ? content : undefined,
          templateId,
          replyTo: replyTo ? { email: replyTo } : undefined,
          categories,
          sendAt,
          attachments: attachments?.map((a) => ({
            content: a.content,
            filename: a.filename,
            type: a.type,
            disposition: a.disposition,
          })),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Email accepted for delivery',
                  ...result,
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
  // Send Batch Email
  // ===========================================================================
  server.tool(
    'sendgrid_send_batch_email',
    `Send personalized emails to multiple recipients in a single API call.

Each recipient can have their own substitution data for dynamic content.

Args:
  - from: Sender email address (required)
  - fromName: Sender name (optional)
  - subject: Default email subject (can be overridden per recipient)
  - text: Plain text email body
  - html: HTML email body
  - templateId: SendGrid template ID
  - personalizations: Array of recipient customizations with to, cc, bcc, subject, dynamicTemplateData
  - categories: Tracking categories
  - sendAt: Unix timestamp for scheduled send

Returns:
  Confirmation of batch email being accepted.`,
    {
      from: z.string().email().describe('Sender email address'),
      fromName: z.string().optional().describe('Sender name'),
      subject: z.string().optional().describe('Default subject line'),
      text: z.string().optional().describe('Plain text body'),
      html: z.string().optional().describe('HTML body'),
      templateId: z.string().optional().describe('Template ID'),
      personalizations: z
        .array(
          z.object({
            to: z.array(z.string().email()).min(1),
            cc: z.array(z.string().email()).optional(),
            bcc: z.array(z.string().email()).optional(),
            subject: z.string().optional(),
            dynamicTemplateData: z.record(z.string(), z.unknown()).optional(),
          })
        )
        .min(1)
        .max(1000)
        .describe('Recipient personalizations'),
      categories: z.array(z.string()).optional(),
      sendAt: z.number().int().optional(),
    },
    async ({
      from,
      fromName,
      subject,
      text,
      html,
      templateId,
      personalizations,
      categories,
      sendAt,
    }) => {
      try {
        const content: Array<{ type: 'text/plain' | 'text/html'; value: string }> = [];
        if (text) content.push({ type: 'text/plain', value: text });
        if (html) content.push({ type: 'text/html', value: html });

        const result = await client.sendEmail({
          personalizations: personalizations.map((p) => ({
            to: p.to.map((email) => ({ email })),
            cc: p.cc?.map((email) => ({ email })),
            bcc: p.bcc?.map((email) => ({ email })),
            subject: p.subject,
            dynamicTemplateData: p.dynamicTemplateData,
          })),
          from: { email: from, name: fromName },
          subject,
          content: content.length > 0 ? content : undefined,
          templateId,
          categories,
          sendAt,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Batch email to ${personalizations.length} recipients accepted`,
                  ...result,
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
  // Create Batch ID
  // ===========================================================================
  server.tool(
    'sendgrid_create_batch_id',
    `Create a batch ID for scheduling or canceling emails.

Use this batch ID when sending emails to be able to cancel or pause them later.

Returns:
  A unique batch ID to use with sendgrid_send_email's batchId parameter.`,
    {},
    async () => {
      try {
        const result = await client.createBatchId();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, ...result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Validate Batch ID
  // ===========================================================================
  server.tool(
    'sendgrid_validate_batch_id',
    `Validate that a batch ID exists and is valid.

Args:
  - batchId: The batch ID to validate

Returns:
  Whether the batch ID is valid.`,
    {
      batchId: z.string().describe('Batch ID to validate'),
    },
    async ({ batchId }) => {
      try {
        const result = await client.validateBatchId(batchId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, batchId, ...result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Scheduled Sends
  // ===========================================================================
  server.tool(
    'sendgrid_list_scheduled_sends',
    `List all scheduled sends that have been paused or cancelled.

Returns:
  List of scheduled sends with their batch IDs and statuses.`,
    {},
    async () => {
      try {
        const result = await client.listScheduledSends();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, scheduledSends: result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Cancel Scheduled Send
  // ===========================================================================
  server.tool(
    'sendgrid_cancel_scheduled_send',
    `Cancel a scheduled send by batch ID.

Emails that have already been sent cannot be cancelled.

Args:
  - batchId: The batch ID of the scheduled send

Returns:
  Confirmation of cancellation.`,
    {
      batchId: z.string().describe('Batch ID to cancel'),
    },
    async ({ batchId }) => {
      try {
        await client.cancelScheduledSend(batchId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Scheduled send ${batchId} cancelled` },
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
  // Pause Scheduled Send
  // ===========================================================================
  server.tool(
    'sendgrid_pause_scheduled_send',
    `Pause a scheduled send by batch ID.

Args:
  - batchId: The batch ID of the scheduled send

Returns:
  Confirmation of pause.`,
    {
      batchId: z.string().describe('Batch ID to pause'),
    },
    async ({ batchId }) => {
      try {
        await client.pauseScheduledSend(batchId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Scheduled send ${batchId} paused` },
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

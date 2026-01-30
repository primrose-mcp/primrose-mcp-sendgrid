/**
 * Alert Tools
 *
 * MCP tools for managing SendGrid alerts.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register alert tools
 */
export function registerAlertTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Alerts
  // ===========================================================================
  server.tool(
    'sendgrid_list_alerts',
    `List all configured alerts.

Returns:
  All alerts with their types and settings.`,
    {},
    async () => {
      try {
        const alerts = await client.listAlerts();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ alerts }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Alert
  // ===========================================================================
  server.tool(
    'sendgrid_get_alert',
    `Get details of a specific alert.

Args:
  - id: Alert ID

Returns:
  Alert details.`,
    {
      id: z.number().int().describe('Alert ID'),
    },
    async ({ id }) => {
      try {
        const alert = await client.getAlert(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(alert, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Alert
  // ===========================================================================
  server.tool(
    'sendgrid_create_alert',
    `Create a new alert.

Alert types:
  - stats_notification: Receive email stats at specified frequency
  - usage_limit: Alert when approaching credit limit

Args:
  - type: Alert type ('stats_notification' or 'usage_limit')
  - emailTo: Email address to send alerts to
  - frequency: For stats alerts: 'daily', 'weekly', or 'monthly'
  - percentage: For usage alerts: percentage threshold (e.g., 90)

Returns:
  The created alert.`,
    {
      type: z.enum(['stats_notification', 'usage_limit']).describe('Alert type'),
      emailTo: z.string().email().describe('Alert recipient email'),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional().describe('Stats frequency'),
      percentage: z.number().int().min(1).max(100).optional().describe('Usage threshold %'),
    },
    async ({ type, emailTo, frequency, percentage }) => {
      try {
        const alert = await client.createAlert({ type, emailTo, frequency, percentage });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Alert created', alert },
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
  // Update Alert
  // ===========================================================================
  server.tool(
    'sendgrid_update_alert',
    `Update an existing alert.

Args:
  - id: Alert ID
  - emailTo: New recipient email
  - frequency: New frequency for stats alerts
  - percentage: New threshold for usage alerts

Returns:
  The updated alert.`,
    {
      id: z.number().int().describe('Alert ID'),
      emailTo: z.string().email().optional().describe('Recipient email'),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional().describe('Stats frequency'),
      percentage: z.number().int().min(1).max(100).optional().describe('Usage threshold'),
    },
    async ({ id, emailTo, frequency, percentage }) => {
      try {
        const alert = await client.updateAlert(id, { emailTo, frequency, percentage });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Alert updated', alert },
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
  // Delete Alert
  // ===========================================================================
  server.tool(
    'sendgrid_delete_alert',
    `Delete an alert.

Args:
  - id: Alert ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.number().int().describe('Alert ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteAlert(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Alert ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

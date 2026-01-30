/**
 * Unsubscribe Group Tools
 *
 * MCP tools for managing SendGrid unsubscribe groups (suppression groups).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register unsubscribe group tools
 */
export function registerUnsubscribeGroupTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Unsubscribe Groups
  // ===========================================================================
  server.tool(
    'sendgrid_list_unsubscribe_groups',
    `List all unsubscribe groups (suppression groups).

Unsubscribe groups allow recipients to opt out of specific types of emails.

Args:
  - format: Response format

Returns:
  All unsubscribe groups.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const groups = await client.listUnsubscribeGroups();
        return formatResponse({ items: groups, count: groups.length, hasMore: false }, format, 'suppressionGroups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Unsubscribe Group
  // ===========================================================================
  server.tool(
    'sendgrid_get_unsubscribe_group',
    `Get an unsubscribe group by ID.

Args:
  - id: Group ID
  - format: Response format

Returns:
  Group details.`,
    {
      id: z.number().int().describe('Group ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const group = await client.getUnsubscribeGroup(id);
        return formatResponse(group, format, 'unsubscribeGroup');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Unsubscribe Group
  // ===========================================================================
  server.tool(
    'sendgrid_create_unsubscribe_group',
    `Create a new unsubscribe group.

Args:
  - name: Group name (shown to recipients)
  - description: Description (shown to recipients)
  - isDefault: Set as the default group

Returns:
  The created group.`,
    {
      name: z.string().min(1).describe('Group name'),
      description: z.string().min(1).describe('Group description'),
      isDefault: z.boolean().default(false).describe('Set as default'),
    },
    async ({ name, description, isDefault }) => {
      try {
        const group = await client.createUnsubscribeGroup({ name, description, isDefault });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Unsubscribe group created', group },
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
  // Update Unsubscribe Group
  // ===========================================================================
  server.tool(
    'sendgrid_update_unsubscribe_group',
    `Update an unsubscribe group.

Args:
  - id: Group ID
  - name: New name
  - description: New description

Returns:
  The updated group.`,
    {
      id: z.number().int().describe('Group ID'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional().describe('New description'),
    },
    async ({ id, name, description }) => {
      try {
        const group = await client.updateUnsubscribeGroup(id, { name, description });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Unsubscribe group updated', group },
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
  // Delete Unsubscribe Group
  // ===========================================================================
  server.tool(
    'sendgrid_delete_unsubscribe_group',
    `Delete an unsubscribe group.

Args:
  - id: Group ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.number().int().describe('Group ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteUnsubscribeGroup(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Unsubscribe group ${id} deleted` },
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
  // List Group Suppressions
  // ===========================================================================
  server.tool(
    'sendgrid_list_group_suppressions',
    `List email addresses that have unsubscribed from a specific group.

Args:
  - groupId: Unsubscribe group ID

Returns:
  List of email addresses.`,
    {
      groupId: z.number().int().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        const emails = await client.listGroupSuppressions(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ groupId, count: emails.length, emails }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Group Suppressions
  // ===========================================================================
  server.tool(
    'sendgrid_add_group_suppressions',
    `Add email addresses to an unsubscribe group.

Args:
  - groupId: Unsubscribe group ID
  - emails: Array of email addresses to add

Returns:
  Confirmation of addition.`,
    {
      groupId: z.number().int().describe('Group ID'),
      emails: z.array(z.string().email()).min(1).describe('Email addresses'),
    },
    async ({ groupId, emails }) => {
      try {
        await client.addGroupSuppressions(groupId, emails);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `${emails.length} email(s) added to group ${groupId}`,
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
  // Delete Group Suppression
  // ===========================================================================
  server.tool(
    'sendgrid_delete_group_suppression',
    `Remove an email from an unsubscribe group.

Args:
  - groupId: Unsubscribe group ID
  - email: Email address to remove

Returns:
  Confirmation of removal.`,
    {
      groupId: z.number().int().describe('Group ID'),
      email: z.string().email().describe('Email address'),
    },
    async ({ groupId, email }) => {
      try {
        await client.deleteGroupSuppression(groupId, email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `${email} removed from group ${groupId}` },
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
  // Search Group Suppressions
  // ===========================================================================
  server.tool(
    'sendgrid_search_group_suppressions',
    `Search for all groups an email is suppressed from.

Args:
  - email: Email address to search

Returns:
  List of groups the email is suppressed from.`,
    {
      email: z.string().email().describe('Email address'),
    },
    async ({ email }) => {
      try {
        const suppressions = await client.searchGroupSuppressions(email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ email, suppressions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

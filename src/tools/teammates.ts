/**
 * Teammate Tools
 *
 * MCP tools for managing SendGrid teammates.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register teammate tools
 */
export function registerTeammateTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Teammates
  // ===========================================================================
  server.tool(
    'sendgrid_list_teammates',
    `List all teammates on the account.

Teammates are users who can access the SendGrid account with specific permissions.

Args:
  - limit: Number of results
  - offset: Pagination offset

Returns:
  List of teammates.`,
    {
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
    },
    async ({ limit, offset }) => {
      try {
        const teammates = await client.listTeammates(limit, offset);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ teammates }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Teammate
  // ===========================================================================
  server.tool(
    'sendgrid_get_teammate',
    `Get details of a teammate.

Args:
  - username: Teammate username

Returns:
  Teammate details including permissions.`,
    {
      username: z.string().describe('Teammate username'),
    },
    async ({ username }) => {
      try {
        const teammate = await client.getTeammate(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(teammate, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Invite Teammate
  // ===========================================================================
  server.tool(
    'sendgrid_invite_teammate',
    `Invite a new teammate to the account.

Common scopes include:
  - mail.send
  - stats.read
  - suppressions.read, suppressions.update, suppressions.delete
  - templates.read, templates.create, templates.update, templates.delete
  - marketing.read, marketing.update
  - user.profile.read

Args:
  - email: Email address to invite
  - scopes: Array of permission scopes
  - isAdmin: Grant admin access

Returns:
  Invitation details.`,
    {
      email: z.string().email().describe('Email to invite'),
      scopes: z.array(z.string()).min(1).describe('Permission scopes'),
      isAdmin: z.boolean().default(false).describe('Admin access'),
    },
    async ({ email, scopes, isAdmin }) => {
      try {
        const result = await client.inviteTeammate({ email, scopes, isAdmin });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Invitation sent to ${email}`,
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
  // Update Teammate Permissions
  // ===========================================================================
  server.tool(
    'sendgrid_update_teammate_permissions',
    `Update a teammate's permissions.

Args:
  - username: Teammate username
  - scopes: New permission scopes
  - isAdmin: Grant or revoke admin access

Returns:
  The updated teammate.`,
    {
      username: z.string().describe('Username'),
      scopes: z.array(z.string()).min(1).describe('New scopes'),
      isAdmin: z.boolean().optional().describe('Admin status'),
    },
    async ({ username, scopes, isAdmin }) => {
      try {
        const teammate = await client.updateTeammatePermissions(username, scopes, isAdmin);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Teammate permissions updated', teammate },
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
  // Delete Teammate
  // ===========================================================================
  server.tool(
    'sendgrid_delete_teammate',
    `Remove a teammate from the account.

Args:
  - username: Teammate username

Returns:
  Confirmation of removal.`,
    {
      username: z.string().describe('Username'),
    },
    async ({ username }) => {
      try {
        await client.deleteTeammate(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Teammate ${username} removed` },
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

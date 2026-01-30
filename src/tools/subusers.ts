/**
 * Subuser Tools
 *
 * MCP tools for managing SendGrid subusers.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register subuser tools
 */
export function registerSubuserTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Subusers
  // ===========================================================================
  server.tool(
    'sendgrid_list_subusers',
    `List all subusers.

Subusers allow you to segment your email sending and statistics.

Args:
  - limit: Number of results (default 500)
  - offset: Pagination offset

Returns:
  List of subusers.`,
    {
      limit: z.number().int().min(1).max(500).default(500),
      offset: z.number().int().min(0).default(0),
    },
    async ({ limit, offset }) => {
      try {
        const subusers = await client.listSubusers(limit, offset);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ subusers }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Subuser
  // ===========================================================================
  server.tool(
    'sendgrid_get_subuser',
    `Get details of a subuser.

Args:
  - username: Subuser username

Returns:
  Subuser details.`,
    {
      username: z.string().describe('Subuser username'),
    },
    async ({ username }) => {
      try {
        const subuser = await client.getSubuser(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subuser, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Subuser
  // ===========================================================================
  server.tool(
    'sendgrid_create_subuser',
    `Create a new subuser.

Args:
  - username: Unique username
  - email: Email address for the subuser
  - password: Password (min 8 characters)
  - ips: Array of IP addresses to assign

Returns:
  The created subuser.`,
    {
      username: z.string().min(1).describe('Username'),
      email: z.string().email().describe('Email'),
      password: z.string().min(8).describe('Password'),
      ips: z.array(z.string()).min(1).describe('IP addresses'),
    },
    async ({ username, email, password, ips }) => {
      try {
        const subuser = await client.createSubuser({ username, email, password, ips });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Subuser created', subuser },
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
  // Delete Subuser
  // ===========================================================================
  server.tool(
    'sendgrid_delete_subuser',
    `Delete a subuser.

Warning: This cannot be undone.

Args:
  - username: Subuser username

Returns:
  Confirmation of deletion.`,
    {
      username: z.string().describe('Username'),
    },
    async ({ username }) => {
      try {
        await client.deleteSubuser(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Subuser ${username} deleted` },
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
  // Enable Subuser
  // ===========================================================================
  server.tool(
    'sendgrid_enable_subuser',
    `Enable a disabled subuser.

Args:
  - username: Subuser username

Returns:
  Confirmation.`,
    {
      username: z.string().describe('Username'),
    },
    async ({ username }) => {
      try {
        await client.enableSubuser(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Subuser ${username} enabled` },
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
  // Disable Subuser
  // ===========================================================================
  server.tool(
    'sendgrid_disable_subuser',
    `Disable a subuser (prevents sending).

Args:
  - username: Subuser username

Returns:
  Confirmation.`,
    {
      username: z.string().describe('Username'),
    },
    async ({ username }) => {
      try {
        await client.disableSubuser(username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Subuser ${username} disabled` },
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

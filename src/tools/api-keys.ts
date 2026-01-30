/**
 * API Key Tools
 *
 * MCP tools for managing SendGrid API keys.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register API key tools
 */
export function registerApiKeyTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List API Keys
  // ===========================================================================
  server.tool(
    'sendgrid_list_api_keys',
    `List all API keys for the account.

Note: The actual key values are not returned, only metadata.

Args:
  - format: Response format

Returns:
  List of API keys with their IDs, names, and scopes.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const result = await client.listApiKeys();
        return formatResponse(result, format, 'apiKeys');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get API Key
  // ===========================================================================
  server.tool(
    'sendgrid_get_api_key',
    `Get metadata for a specific API key.

Args:
  - id: API key ID

Returns:
  API key metadata (not the actual key value).`,
    {
      id: z.string().describe('API key ID'),
    },
    async ({ id }) => {
      try {
        const key = await client.getApiKey(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(key, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create API Key
  // ===========================================================================
  server.tool(
    'sendgrid_create_api_key',
    `Create a new API key.

IMPORTANT: The actual key value is only returned once during creation. Save it immediately!

Common scopes include:
  - mail.send
  - alerts.create, alerts.read, alerts.update, alerts.delete
  - marketing.automation.create, marketing.automation.read, marketing.automation.update, marketing.automation.delete
  - stats.read
  - suppressions.create, suppressions.read, suppressions.update, suppressions.delete
  - templates.create, templates.read, templates.update, templates.delete
  - user.profile.read, user.profile.update

Args:
  - name: Name for the API key
  - scopes: Array of permission scopes (optional, full access if not specified)

Returns:
  The created API key including the actual key value (SAVE THIS!).`,
    {
      name: z.string().min(1).describe('API key name'),
      scopes: z.array(z.string()).optional().describe('Permission scopes'),
    },
    async ({ name, scopes }) => {
      try {
        const key = await client.createApiKey({ name, scopes });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'API key created. SAVE THE KEY VALUE - it will not be shown again!',
                  apiKeyId: key.apiKeyId,
                  name: key.name,
                  apiKey: key.apiKey, // This is the actual key value!
                  scopes: key.scopes,
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
  // Update API Key
  // ===========================================================================
  server.tool(
    'sendgrid_update_api_key',
    `Update an API key's name and/or scopes.

Args:
  - id: API key ID
  - name: New name for the key
  - scopes: New scopes (if provided, replaces all existing scopes)

Returns:
  The updated API key.`,
    {
      id: z.string().describe('API key ID'),
      name: z.string().min(1).describe('New name'),
      scopes: z.array(z.string()).optional().describe('New scopes (replaces existing)'),
    },
    async ({ id, name, scopes }) => {
      try {
        const key = await client.updateApiKey(id, name, scopes);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'API key updated', key }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete API Key
  // ===========================================================================
  server.tool(
    'sendgrid_delete_api_key',
    `Delete an API key.

Warning: This action cannot be undone. Any applications using this key will lose access.

Args:
  - id: API key ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('API key ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteApiKey(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `API key ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

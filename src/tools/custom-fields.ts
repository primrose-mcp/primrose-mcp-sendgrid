/**
 * Custom Field Tools
 *
 * MCP tools for managing SendGrid custom fields.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register custom field tools
 */
export function registerCustomFieldTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Custom Fields
  // ===========================================================================
  server.tool(
    'sendgrid_list_custom_fields',
    `List all custom field definitions.

Returns:
  All custom fields with their IDs, names, and types.`,
    {},
    async () => {
      try {
        const fields = await client.listCustomFields();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ customFields: fields }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Custom Field
  // ===========================================================================
  server.tool(
    'sendgrid_create_custom_field',
    `Create a new custom field for contacts.

Args:
  - name: Field name (must be unique)
  - fieldType: Field type (Text, Number, or Date)

Returns:
  The created custom field.`,
    {
      name: z.string().min(1).describe('Field name'),
      fieldType: z.enum(['Text', 'Number', 'Date']).describe('Field type'),
    },
    async ({ name, fieldType }) => {
      try {
        const field = await client.createCustomField({ name, fieldType });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field created', field }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Custom Field
  // ===========================================================================
  server.tool(
    'sendgrid_update_custom_field',
    `Update a custom field name.

Args:
  - id: Field ID
  - name: New field name

Returns:
  The updated custom field.`,
    {
      id: z.string().describe('Field ID'),
      name: z.string().min(1).describe('New field name'),
    },
    async ({ id, name }) => {
      try {
        const field = await client.updateCustomField(id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field updated', field }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Custom Field
  // ===========================================================================
  server.tool(
    'sendgrid_delete_custom_field',
    `Delete a custom field.

Warning: This will remove the field from all contacts.

Args:
  - id: Field ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('Field ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteCustomField(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Custom field ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

/**
 * Contact List Tools
 *
 * MCP tools for managing SendGrid contact lists.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register contact list tools
 */
export function registerListTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Contact Lists
  // ===========================================================================
  server.tool(
    'sendgrid_list_contact_lists',
    `List all contact lists in SendGrid Marketing.

Args:
  - format: Response format ('json' or 'markdown')

Returns:
  All contact lists with their IDs, names, and contact counts.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const result = await client.listContactLists();
        return formatResponse(result, format, 'lists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Contact List
  // ===========================================================================
  server.tool(
    'sendgrid_get_contact_list',
    `Get details of a specific contact list.

Args:
  - id: The list ID
  - format: Response format

Returns:
  List details including contact count.`,
    {
      id: z.string().describe('List ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const list = await client.getContactList(id);
        return formatResponse(list, format, 'list');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Contact List
  // ===========================================================================
  server.tool(
    'sendgrid_create_contact_list',
    `Create a new contact list.

Args:
  - name: Name for the list (required)

Returns:
  The created list.`,
    {
      name: z.string().min(1).describe('List name'),
    },
    async ({ name }) => {
      try {
        const list = await client.createContactList({ name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List created', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Contact List
  // ===========================================================================
  server.tool(
    'sendgrid_update_contact_list',
    `Update a contact list name.

Args:
  - id: List ID to update
  - name: New name for the list

Returns:
  The updated list.`,
    {
      id: z.string().describe('List ID'),
      name: z.string().min(1).describe('New list name'),
    },
    async ({ id, name }) => {
      try {
        const list = await client.updateContactList(id, { name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List updated', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Contact List
  // ===========================================================================
  server.tool(
    'sendgrid_delete_contact_list',
    `Delete a contact list.

Args:
  - id: List ID to delete
  - deleteContacts: Also delete contacts that are only in this list

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('List ID'),
      deleteContacts: z.boolean().default(false).describe('Also delete contacts'),
    },
    async ({ id, deleteContacts }) => {
      try {
        await client.deleteContactList(id, deleteContacts);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `List ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get List Contact Count
  // ===========================================================================
  server.tool(
    'sendgrid_get_list_contact_count',
    `Get the number of contacts in a specific list.

Args:
  - id: List ID

Returns:
  Contact count and billable count for the list.`,
    {
      id: z.string().describe('List ID'),
    },
    async ({ id }) => {
      try {
        const result = await client.getContactListCount(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ listId: id, ...result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Contacts to List
  // ===========================================================================
  server.tool(
    'sendgrid_add_contacts_to_list',
    `Add existing contacts to a list.

Args:
  - listId: The list ID
  - contactIds: Array of contact IDs to add

Returns:
  Job ID for tracking.`,
    {
      listId: z.string().describe('List ID'),
      contactIds: z.array(z.string()).min(1).describe('Contact IDs to add'),
    },
    async ({ listId, contactIds }) => {
      try {
        const result = await client.addContactsToList(listId, contactIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `${contactIds.length} contact(s) queued to add to list`,
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
  // Remove Contacts from List
  // ===========================================================================
  server.tool(
    'sendgrid_remove_contacts_from_list',
    `Remove contacts from a list (does not delete the contacts).

Args:
  - listId: The list ID
  - contactIds: Array of contact IDs to remove

Returns:
  Job ID for tracking.`,
    {
      listId: z.string().describe('List ID'),
      contactIds: z.array(z.string()).min(1).describe('Contact IDs to remove'),
    },
    async ({ listId, contactIds }) => {
      try {
        const result = await client.removeContactsFromList(listId, contactIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `${contactIds.length} contact(s) queued for removal from list`,
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
}

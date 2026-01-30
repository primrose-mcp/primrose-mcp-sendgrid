/**
 * Contact Management Tools
 *
 * MCP tools for managing SendGrid Marketing contacts.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register contact management tools
 */
export function registerContactTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Contacts
  // ===========================================================================
  server.tool(
    'sendgrid_list_contacts',
    `List contacts from SendGrid Marketing.

Args:
  - pageToken: Token for pagination (optional)
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of contacts.`,
    {
      pageToken: z.string().optional().describe('Pagination token'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageToken, format }) => {
      try {
        const result = await client.listContacts({ pageToken });
        return formatResponse(result, format, 'contacts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Contact
  // ===========================================================================
  server.tool(
    'sendgrid_get_contact',
    `Get a single contact by ID.

Args:
  - id: The contact ID
  - format: Response format

Returns:
  The contact details.`,
    {
      id: z.string().describe('Contact ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const contact = await client.getContact(id);
        return formatResponse(contact, format, 'contact');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Contact by Email
  // ===========================================================================
  server.tool(
    'sendgrid_get_contact_by_email',
    `Find a contact by email address.

Args:
  - email: The email address to search for

Returns:
  The contact if found, or null.`,
    {
      email: z.string().email().describe('Email address'),
    },
    async ({ email }) => {
      try {
        const contact = await client.getContactByEmail(email);
        if (!contact) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ found: false, message: `No contact found with email ${email}` }, null, 2),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ found: true, contact }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add or Update Contacts
  // ===========================================================================
  server.tool(
    'sendgrid_add_contacts',
    `Add or update contacts in SendGrid Marketing.

This is an upsert operation - existing contacts are updated, new contacts are created.

Args:
  - contacts: Array of contact objects with email (required) and optional fields
  - listIds: Optional array of list IDs to add contacts to

Returns:
  A job ID for tracking the import.`,
    {
      contacts: z
        .array(
          z.object({
            email: z.string().email().describe('Contact email (required)'),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            phone: z.string().optional(),
            addressLine1: z.string().optional(),
            addressLine2: z.string().optional(),
            city: z.string().optional(),
            stateProvinceRegion: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          })
        )
        .min(1)
        .describe('Contacts to add/update'),
      listIds: z.array(z.string()).optional().describe('List IDs to add contacts to'),
    },
    async ({ contacts, listIds }) => {
      try {
        const result = await client.addOrUpdateContacts(
          contacts.map((c) => ({
            email: c.email,
            firstName: c.firstName,
            lastName: c.lastName,
            phone: c.phone,
            addressLine1: c.addressLine1,
            addressLine2: c.addressLine2,
            city: c.city,
            stateProvinceRegion: c.stateProvinceRegion,
            postalCode: c.postalCode,
            country: c.country,
            customFields: c.customFields,
          })),
          listIds
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `${contacts.length} contact(s) queued for import`,
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
  // Delete Contacts
  // ===========================================================================
  server.tool(
    'sendgrid_delete_contacts',
    `Delete contacts from SendGrid Marketing.

Args:
  - ids: Array of contact IDs to delete
  - deleteAll: Set to true to delete ALL contacts (use with caution!)

Returns:
  A job ID for tracking the deletion.`,
    {
      ids: z.array(z.string()).optional().describe('Contact IDs to delete'),
      deleteAll: z.boolean().optional().describe('Delete all contacts'),
    },
    async ({ ids, deleteAll }) => {
      try {
        if (!ids && !deleteAll) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Either ids or deleteAll must be provided' }, null, 2),
              },
            ],
            isError: true,
          };
        }
        const result = await client.deleteContacts(ids || [], deleteAll || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: deleteAll ? 'All contacts queued for deletion' : `${ids?.length} contact(s) queued for deletion`,
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
  // Search Contacts
  // ===========================================================================
  server.tool(
    'sendgrid_search_contacts',
    `Search contacts using SGQL (SendGrid Query Language).

Examples:
  - email LIKE '%@example.com%'
  - first_name = 'John' AND last_name = 'Doe'
  - created_at > '2024-01-01T00:00:00Z'

Args:
  - query: SGQL query string
  - format: Response format

Returns:
  Matching contacts.`,
    {
      query: z.string().describe('SGQL query string'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, format }) => {
      try {
        const result = await client.searchContacts(query);
        return formatResponse(result, format, 'contacts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Contact Count
  // ===========================================================================
  server.tool(
    'sendgrid_get_contact_count',
    `Get the total number of contacts in your account.

Returns:
  Contact count and billable count.`,
    {},
    async () => {
      try {
        const result = await client.getContactCount();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

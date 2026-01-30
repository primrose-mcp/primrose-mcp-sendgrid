/**
 * Sender Identity Tools
 *
 * MCP tools for managing SendGrid sender identities.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register sender identity tools
 */
export function registerSenderTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Sender Identities
  // ===========================================================================
  server.tool(
    'sendgrid_list_senders',
    `List all sender identities.

Args:
  - format: Response format

Returns:
  All sender identities with verification status.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const result = await client.listSenderIdentities();
        return formatResponse(result, format, 'senders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Sender Identity
  // ===========================================================================
  server.tool(
    'sendgrid_get_sender',
    `Get a sender identity by ID.

Args:
  - id: Sender ID
  - format: Response format

Returns:
  Sender identity details.`,
    {
      id: z.number().int().describe('Sender ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const sender = await client.getSenderIdentity(id);
        return formatResponse(sender, format, 'sender');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Sender Identity
  // ===========================================================================
  server.tool(
    'sendgrid_create_sender',
    `Create a new sender identity.

A verification email will be sent to the from address.

Args:
  - nickname: Display name for the sender
  - fromEmail: From email address
  - fromName: From display name
  - replyToEmail: Reply-to email address (optional)
  - address: Physical address (required for CAN-SPAM compliance)
  - address2: Address line 2
  - city: City
  - state: State/Province
  - zip: ZIP/Postal code
  - country: Country

Returns:
  The created sender identity.`,
    {
      nickname: z.string().min(1).describe('Sender nickname'),
      fromEmail: z.string().email().describe('From email address'),
      fromName: z.string().optional().describe('From display name'),
      replyToEmail: z.string().email().optional().describe('Reply-to email'),
      address: z.string().min(1).describe('Street address'),
      address2: z.string().optional().describe('Address line 2'),
      city: z.string().min(1).describe('City'),
      state: z.string().optional().describe('State/Province'),
      zip: z.string().optional().describe('ZIP/Postal code'),
      country: z.string().min(1).describe('Country'),
    },
    async ({
      nickname,
      fromEmail,
      fromName,
      replyToEmail,
      address,
      address2,
      city,
      state,
      zip,
      country,
    }) => {
      try {
        const sender = await client.createSenderIdentity({
          nickname,
          from: { email: fromEmail, name: fromName },
          replyTo: replyToEmail ? { email: replyToEmail } : undefined,
          address,
          address2,
          city,
          state,
          zip,
          country,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Sender created. Verification email sent.',
                  sender,
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
  // Update Sender Identity
  // ===========================================================================
  server.tool(
    'sendgrid_update_sender',
    `Update a sender identity.

Args:
  - id: Sender ID
  - nickname: New nickname
  - fromName: New from display name
  - replyToEmail: New reply-to email
  - address: New address
  - city: New city
  - country: New country

Returns:
  The updated sender identity.`,
    {
      id: z.number().int().describe('Sender ID'),
      nickname: z.string().optional().describe('Nickname'),
      fromName: z.string().optional().describe('From name'),
      replyToEmail: z.string().email().optional().describe('Reply-to email'),
      address: z.string().optional().describe('Address'),
      city: z.string().optional().describe('City'),
      country: z.string().optional().describe('Country'),
    },
    async ({ id, nickname, fromName, replyToEmail, address, city, country }) => {
      try {
        const updateData: Record<string, unknown> = {};
        if (nickname) updateData.nickname = nickname;
        if (fromName) updateData.from = { name: fromName };
        if (replyToEmail) updateData.replyTo = { email: replyToEmail };
        if (address) updateData.address = address;
        if (city) updateData.city = city;
        if (country) updateData.country = country;

        const sender = await client.updateSenderIdentity(id, updateData as never);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Sender updated', sender },
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
  // Delete Sender Identity
  // ===========================================================================
  server.tool(
    'sendgrid_delete_sender',
    `Delete a sender identity.

Args:
  - id: Sender ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.number().int().describe('Sender ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteSenderIdentity(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Sender ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Resend Sender Verification
  // ===========================================================================
  server.tool(
    'sendgrid_resend_sender_verification',
    `Resend the verification email for a sender identity.

Args:
  - id: Sender ID

Returns:
  Confirmation that verification email was sent.`,
    {
      id: z.number().int().describe('Sender ID'),
    },
    async ({ id }) => {
      try {
        await client.resendSenderVerification(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Verification email sent' },
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

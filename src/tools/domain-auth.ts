/**
 * Domain Authentication & Link Branding Tools
 *
 * MCP tools for managing SendGrid domain authentication and branded links.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register domain authentication tools
 */
export function registerDomainAuthTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Authenticated Domains
  // ===========================================================================
  server.tool(
    'sendgrid_list_authenticated_domains',
    `List all authenticated domains.

Domain authentication (DKIM/SPF) improves deliverability and prevents spoofing.

Returns:
  All authenticated domains with their DNS records and validation status.`,
    {},
    async () => {
      try {
        const domains = await client.listAuthenticatedDomains();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ domains }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Authenticated Domain
  // ===========================================================================
  server.tool(
    'sendgrid_get_authenticated_domain',
    `Get details of an authenticated domain.

Args:
  - id: Domain ID

Returns:
  Domain details including DNS records to configure.`,
    {
      id: z.number().int().describe('Domain ID'),
    },
    async ({ id }) => {
      try {
        const domain = await client.getAuthenticatedDomain(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(domain, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Authenticate Domain
  // ===========================================================================
  server.tool(
    'sendgrid_authenticate_domain',
    `Start domain authentication process.

This will generate DNS records that you need to add to your domain.

Args:
  - domain: Domain to authenticate (e.g., example.com)
  - subdomain: Subdomain for DKIM (optional, defaults to em)
  - customSpf: Use custom SPF instead of SendGrid's
  - default: Set as the default sending domain
  - automaticSecurity: Enable automatic security (recommended)

Returns:
  The domain with DNS records to configure.`,
    {
      domain: z.string().min(1).describe('Domain name'),
      subdomain: z.string().optional().describe('Subdomain'),
      customSpf: z.boolean().default(false).describe('Custom SPF'),
      default: z.boolean().default(false).describe('Set as default'),
      automaticSecurity: z.boolean().default(true).describe('Automatic security'),
    },
    async ({ domain, subdomain, customSpf, default: isDefault, automaticSecurity }) => {
      try {
        const result = await client.authenticateDomain({
          domain,
          subdomain,
          customSpf,
          default: isDefault,
          automaticSecurity,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Domain authentication started. Add the DNS records below.',
                  domain: result,
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
  // Validate Domain
  // ===========================================================================
  server.tool(
    'sendgrid_validate_domain',
    `Validate DNS records for an authenticated domain.

Run this after adding DNS records to verify configuration.

Args:
  - id: Domain ID

Returns:
  Validation results for each DNS record.`,
    {
      id: z.number().int().describe('Domain ID'),
    },
    async ({ id }) => {
      try {
        const result = await client.validateDomain(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.valid,
                  message: result.valid
                    ? 'Domain validated successfully!'
                    : 'Domain validation failed. Check DNS records.',
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
  // Delete Authenticated Domain
  // ===========================================================================
  server.tool(
    'sendgrid_delete_authenticated_domain',
    `Delete domain authentication.

Args:
  - id: Domain ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.number().int().describe('Domain ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteAuthenticatedDomain(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Domain ${id} authentication deleted` },
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
  // List Branded Links
  // ===========================================================================
  server.tool(
    'sendgrid_list_branded_links',
    `List all branded links.

Branded links replace sendgrid.net tracking links with your domain.

Returns:
  All branded links with their DNS records.`,
    {},
    async () => {
      try {
        const links = await client.listBrandedLinks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ links }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Branded Link
  // ===========================================================================
  server.tool(
    'sendgrid_get_branded_link',
    `Get details of a branded link.

Args:
  - id: Branded link ID

Returns:
  Link details including DNS records.`,
    {
      id: z.number().int().describe('Link ID'),
    },
    async ({ id }) => {
      try {
        const link = await client.getBrandedLink(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(link, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Branded Link
  // ===========================================================================
  server.tool(
    'sendgrid_create_branded_link',
    `Create a branded link.

Args:
  - domain: Domain for branded links (e.g., link.example.com)
  - subdomain: Subdomain (optional)
  - default: Set as the default branded link

Returns:
  The branded link with DNS records to configure.`,
    {
      domain: z.string().min(1).describe('Domain'),
      subdomain: z.string().optional().describe('Subdomain'),
      default: z.boolean().default(false).describe('Set as default'),
    },
    async ({ domain, subdomain, default: isDefault }) => {
      try {
        const link = await client.createBrandedLink({
          domain,
          subdomain,
          default: isDefault,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Branded link created. Add the DNS records below.',
                  link,
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
  // Validate Branded Link
  // ===========================================================================
  server.tool(
    'sendgrid_validate_branded_link',
    `Validate DNS records for a branded link.

Args:
  - id: Branded link ID

Returns:
  Validation results.`,
    {
      id: z.number().int().describe('Link ID'),
    },
    async ({ id }) => {
      try {
        const result = await client.validateBrandedLink(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.valid,
                  message: result.valid
                    ? 'Branded link validated!'
                    : 'Validation failed. Check DNS records.',
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
  // Delete Branded Link
  // ===========================================================================
  server.tool(
    'sendgrid_delete_branded_link',
    `Delete a branded link.

Args:
  - id: Branded link ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.number().int().describe('Link ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteBrandedLink(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Branded link ${id} deleted` },
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

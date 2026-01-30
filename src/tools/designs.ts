/**
 * Design Library Tools
 *
 * MCP tools for managing SendGrid design library.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register design library tools
 */
export function registerDesignTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Designs
  // ===========================================================================
  server.tool(
    'sendgrid_list_designs',
    `List designs from the design library.

Designs are reusable email templates that can be used with Single Sends.

Args:
  - pageSize: Number of results (default 50)
  - pageToken: Pagination token
  - format: Response format

Returns:
  Paginated list of designs.`,
    {
      pageSize: z.number().int().min(1).max(100).default(50),
      pageToken: z.string().optional().describe('Pagination token'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageToken, format }) => {
      try {
        const result = await client.listDesigns(pageSize, pageToken);
        return formatResponse(result, format, 'designs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Design
  // ===========================================================================
  server.tool(
    'sendgrid_get_design',
    `Get a design by ID.

Args:
  - id: Design ID
  - format: Response format

Returns:
  Design details including HTML content.`,
    {
      id: z.string().describe('Design ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const design = await client.getDesign(id);
        return formatResponse(design, format, 'design');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Design
  // ===========================================================================
  server.tool(
    'sendgrid_create_design',
    `Create a new design in the design library.

Args:
  - name: Design name
  - subject: Email subject line
  - htmlContent: HTML email content
  - plainContent: Plain text content (optional)
  - generatePlainContent: Auto-generate plain text from HTML
  - editor: Editor type ('code' or 'design')
  - categories: Categories for organization

Returns:
  The created design.`,
    {
      name: z.string().min(1).describe('Design name'),
      subject: z.string().optional().describe('Subject line'),
      htmlContent: z.string().optional().describe('HTML content'),
      plainContent: z.string().optional().describe('Plain text content'),
      generatePlainContent: z.boolean().default(true).describe('Auto-generate plain text'),
      editor: z.enum(['code', 'design']).optional().describe('Editor type'),
      categories: z.array(z.string()).optional().describe('Categories'),
    },
    async ({
      name,
      subject,
      htmlContent,
      plainContent,
      generatePlainContent,
      editor,
      categories,
    }) => {
      try {
        const design = await client.createDesign({
          name,
          subject,
          htmlContent,
          plainContent,
          generatePlainContent,
          editor,
          categories,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Design created', design },
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
  // Update Design
  // ===========================================================================
  server.tool(
    'sendgrid_update_design',
    `Update an existing design.

Args:
  - id: Design ID
  - name: New name
  - subject: New subject line
  - htmlContent: New HTML content
  - plainContent: New plain text content
  - categories: New categories

Returns:
  The updated design.`,
    {
      id: z.string().describe('Design ID'),
      name: z.string().optional().describe('Name'),
      subject: z.string().optional().describe('Subject'),
      htmlContent: z.string().optional().describe('HTML content'),
      plainContent: z.string().optional().describe('Plain text'),
      categories: z.array(z.string()).optional().describe('Categories'),
    },
    async ({ id, name, subject, htmlContent, plainContent, categories }) => {
      try {
        const design = await client.updateDesign(id, {
          name,
          subject,
          htmlContent,
          plainContent,
          categories,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Design updated', design },
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
  // Delete Design
  // ===========================================================================
  server.tool(
    'sendgrid_delete_design',
    `Delete a design from the library.

Args:
  - id: Design ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('Design ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteDesign(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Design ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Duplicate Design
  // ===========================================================================
  server.tool(
    'sendgrid_duplicate_design',
    `Duplicate an existing design.

Args:
  - id: Design ID to duplicate
  - name: Name for the new design (optional)

Returns:
  The duplicated design.`,
    {
      id: z.string().describe('Design ID'),
      name: z.string().optional().describe('New design name'),
    },
    async ({ id, name }) => {
      try {
        const design = await client.duplicateDesign(id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Design duplicated', design },
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

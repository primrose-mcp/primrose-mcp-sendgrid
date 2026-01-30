/**
 * Template Tools
 *
 * MCP tools for managing SendGrid transactional templates.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register template tools
 */
export function registerTemplateTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Templates
  // ===========================================================================
  server.tool(
    'sendgrid_list_templates',
    `List transactional templates.

Args:
  - generations: Filter by template type ('legacy' or 'dynamic')
  - pageSize: Number of templates per page (default 50)
  - pageToken: Pagination token
  - format: Response format

Returns:
  Paginated list of templates.`,
    {
      generations: z.enum(['legacy', 'dynamic']).optional().describe('Template generation type'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Page size'),
      pageToken: z.string().optional().describe('Pagination token'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ generations, pageSize, pageToken, format }) => {
      try {
        const result = await client.listTemplates(generations, pageSize, pageToken);
        return formatResponse(result, format, 'templates');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Template
  // ===========================================================================
  server.tool(
    'sendgrid_get_template',
    `Get a template by ID with all versions.

Args:
  - id: Template ID
  - format: Response format

Returns:
  Template details including all versions.`,
    {
      id: z.string().describe('Template ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const template = await client.getTemplate(id);
        return formatResponse(template, format, 'template');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Template
  // ===========================================================================
  server.tool(
    'sendgrid_create_template',
    `Create a new transactional template.

Args:
  - name: Template name
  - generation: Template type ('legacy' or 'dynamic', default 'dynamic')

Returns:
  The created template (without versions).`,
    {
      name: z.string().min(1).describe('Template name'),
      generation: z.enum(['legacy', 'dynamic']).default('dynamic').describe('Template type'),
    },
    async ({ name, generation }) => {
      try {
        const template = await client.createTemplate({ name, generation });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template created', template },
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
  // Update Template
  // ===========================================================================
  server.tool(
    'sendgrid_update_template',
    `Update a template name.

Args:
  - id: Template ID
  - name: New template name

Returns:
  The updated template.`,
    {
      id: z.string().describe('Template ID'),
      name: z.string().min(1).describe('New name'),
    },
    async ({ id, name }) => {
      try {
        const template = await client.updateTemplate(id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template updated', template },
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
  // Delete Template
  // ===========================================================================
  server.tool(
    'sendgrid_delete_template',
    `Delete a template and all its versions.

Args:
  - id: Template ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('Template ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteTemplate(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Template ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Duplicate Template
  // ===========================================================================
  server.tool(
    'sendgrid_duplicate_template',
    `Duplicate an existing template.

Args:
  - id: Template ID to duplicate
  - name: Name for the new template (optional)

Returns:
  The duplicated template.`,
    {
      id: z.string().describe('Template ID'),
      name: z.string().optional().describe('New template name'),
    },
    async ({ id, name }) => {
      try {
        const template = await client.duplicateTemplate(id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template duplicated', template },
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
  // Create Template Version
  // ===========================================================================
  server.tool(
    'sendgrid_create_template_version',
    `Create a new version for a template.

For dynamic templates, use Handlebars syntax for substitution:
  - {{variable}} for plain text
  - {{{variable}}} for HTML content
  - {{#if condition}}...{{/if}} for conditionals
  - {{#each array}}...{{/each}} for loops

Args:
  - templateId: Parent template ID
  - name: Version name
  - subject: Email subject line (can include substitutions)
  - htmlContent: HTML email body
  - plainContent: Plain text email body
  - active: Set as active version (default true)
  - editor: Editor type ('code' or 'design')
  - generatePlainContent: Auto-generate plain text from HTML

Returns:
  The created version.`,
    {
      templateId: z.string().describe('Template ID'),
      name: z.string().min(1).describe('Version name'),
      subject: z.string().optional().describe('Email subject'),
      htmlContent: z.string().optional().describe('HTML content'),
      plainContent: z.string().optional().describe('Plain text content'),
      active: z.boolean().default(true).describe('Set as active'),
      editor: z.enum(['code', 'design']).optional().describe('Editor type'),
      generatePlainContent: z.boolean().optional().describe('Auto-generate plain text'),
    },
    async ({
      templateId,
      name,
      subject,
      htmlContent,
      plainContent,
      active,
      editor,
      generatePlainContent,
    }) => {
      try {
        const version = await client.createTemplateVersion(templateId, {
          name,
          subject,
          htmlContent,
          plainContent,
          active,
          editor,
          generatePlainContent,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template version created', version },
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
  // Get Template Version
  // ===========================================================================
  server.tool(
    'sendgrid_get_template_version',
    `Get a specific template version.

Args:
  - templateId: Template ID
  - versionId: Version ID

Returns:
  The template version with content.`,
    {
      templateId: z.string().describe('Template ID'),
      versionId: z.string().describe('Version ID'),
    },
    async ({ templateId, versionId }) => {
      try {
        const version = await client.getTemplateVersion(templateId, versionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(version, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Template Version
  // ===========================================================================
  server.tool(
    'sendgrid_update_template_version',
    `Update a template version.

Args:
  - templateId: Template ID
  - versionId: Version ID
  - name: New version name
  - subject: New subject line
  - htmlContent: New HTML content
  - plainContent: New plain text content
  - active: Set as active version

Returns:
  The updated version.`,
    {
      templateId: z.string().describe('Template ID'),
      versionId: z.string().describe('Version ID'),
      name: z.string().optional().describe('Version name'),
      subject: z.string().optional().describe('Subject line'),
      htmlContent: z.string().optional().describe('HTML content'),
      plainContent: z.string().optional().describe('Plain text content'),
      active: z.boolean().optional().describe('Active status'),
    },
    async ({ templateId, versionId, name, subject, htmlContent, plainContent, active }) => {
      try {
        const version = await client.updateTemplateVersion(templateId, versionId, {
          name,
          subject,
          htmlContent,
          plainContent,
          active,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template version updated', version },
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
  // Delete Template Version
  // ===========================================================================
  server.tool(
    'sendgrid_delete_template_version',
    `Delete a template version.

Args:
  - templateId: Template ID
  - versionId: Version ID

Returns:
  Confirmation of deletion.`,
    {
      templateId: z.string().describe('Template ID'),
      versionId: z.string().describe('Version ID'),
    },
    async ({ templateId, versionId }) => {
      try {
        await client.deleteTemplateVersion(templateId, versionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Template version ${versionId} deleted` },
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
  // Activate Template Version
  // ===========================================================================
  server.tool(
    'sendgrid_activate_template_version',
    `Activate a template version.

The active version is used when sending emails with the template.

Args:
  - templateId: Template ID
  - versionId: Version ID to activate

Returns:
  The activated version.`,
    {
      templateId: z.string().describe('Template ID'),
      versionId: z.string().describe('Version ID'),
    },
    async ({ templateId, versionId }) => {
      try {
        const version = await client.activateTemplateVersion(templateId, versionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Template version activated', version },
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

/**
 * Segment Tools
 *
 * MCP tools for managing SendGrid segments.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register segment tools
 */
export function registerSegmentTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List Segments
  // ===========================================================================
  server.tool(
    'sendgrid_list_segments',
    `List all segments in SendGrid Marketing.

Args:
  - parentListIds: Filter by parent list IDs (optional)
  - format: Response format

Returns:
  All segments with their IDs, names, and contact counts.`,
    {
      parentListIds: z.array(z.string()).optional().describe('Filter by parent list IDs'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ parentListIds, format }) => {
      try {
        const result = await client.listSegments(parentListIds);
        return formatResponse(result, format, 'segments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Segment
  // ===========================================================================
  server.tool(
    'sendgrid_get_segment',
    `Get details of a specific segment.

Args:
  - id: Segment ID
  - format: Response format

Returns:
  Segment details including query and contact count.`,
    {
      id: z.string().describe('Segment ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const segment = await client.getSegment(id);
        return formatResponse(segment, format, 'segment');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Segment
  // ===========================================================================
  server.tool(
    'sendgrid_create_segment',
    `Create a new segment using SGQL query.

Example queries:
  - email LIKE '%@example.com'
  - first_name = 'John'
  - created_at > '2024-01-01T00:00:00Z'
  - (first_name = 'John' OR first_name = 'Jane') AND last_name = 'Doe'

Args:
  - name: Segment name
  - queryDsl: SGQL query defining the segment
  - parentListIds: Optional list IDs to scope the segment

Returns:
  The created segment.`,
    {
      name: z.string().min(1).describe('Segment name'),
      queryDsl: z.string().describe('SGQL query'),
      parentListIds: z.array(z.string()).optional().describe('Parent list IDs'),
    },
    async ({ name, queryDsl, parentListIds }) => {
      try {
        const segment = await client.createSegment({ name, queryDsl, parentListIds });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Segment created', segment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Segment
  // ===========================================================================
  server.tool(
    'sendgrid_update_segment',
    `Update an existing segment.

Args:
  - id: Segment ID
  - name: New name (optional)
  - queryDsl: New SGQL query (optional)

Returns:
  The updated segment.`,
    {
      id: z.string().describe('Segment ID'),
      name: z.string().optional().describe('New name'),
      queryDsl: z.string().optional().describe('New SGQL query'),
    },
    async ({ id, name, queryDsl }) => {
      try {
        const segment = await client.updateSegment(id, { name, queryDsl });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Segment updated', segment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Segment
  // ===========================================================================
  server.tool(
    'sendgrid_delete_segment',
    `Delete a segment.

Args:
  - id: Segment ID

Returns:
  Confirmation of deletion.`,
    {
      id: z.string().describe('Segment ID'),
    },
    async ({ id }) => {
      try {
        await client.deleteSegment(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Segment ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

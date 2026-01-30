/**
 * Email Validation Tools
 *
 * MCP tools for validating email addresses.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register email validation tools
 */
export function registerValidationTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // Validate Email
  // ===========================================================================
  server.tool(
    'sendgrid_validate_email',
    `Validate an email address.

Returns detailed information about the email's validity including:
- Verdict (Valid, Risky, Invalid)
- Score (0-1)
- Domain validity
- Syntax checks
- Disposable address detection
- Known bounce history

Note: This feature requires SendGrid Email Validation to be enabled.

Args:
  - email: Email address to validate
  - source: Source identifier for tracking (optional)

Returns:
  Detailed validation results.`,
    {
      email: z.string().email().describe('Email to validate'),
      source: z.string().optional().describe('Source identifier'),
    },
    async ({ email, source }) => {
      try {
        const result = await client.validateEmail(email, source);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  email,
                  verdict: result.verdict,
                  score: result.score,
                  suggestion: result.suggestion,
                  checks: result.checks,
                  details: {
                    local: result.local,
                    host: result.host,
                  },
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

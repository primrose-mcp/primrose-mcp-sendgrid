/**
 * SendGrid MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API keys) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-SendGrid-API-Key: API key for SendGrid authentication
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createSendGridClient } from './client.js';
import {
  registerAlertTools,
  registerApiKeyTools,
  registerContactTools,
  registerCustomFieldTools,
  registerDesignTools,
  registerDomainAuthTools,
  registerIpManagementTools,
  registerListTools,
  registerMailTools,
  registerSegmentTools,
  registerSenderTools,
  registerSingleSendTools,
  registerStatsTools,
  registerSubuserTools,
  registerSuppressionTools,
  registerTeammateTools,
  registerTemplateTools,
  registerUnsubscribeGroupTools,
  registerValidationTools,
  registerWebhookTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-sendgrid';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 */
export class SendGridMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-SendGrid-API-Key header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createSendGridClient(credentials);

  // Register all SendGrid tools
  registerMailTools(server, client);
  registerContactTools(server, client);
  registerListTools(server, client);
  registerSegmentTools(server, client);
  registerCustomFieldTools(server, client);
  registerTemplateTools(server, client);
  registerSingleSendTools(server, client);
  registerSenderTools(server, client);
  registerStatsTools(server, client);
  registerSuppressionTools(server, client);
  registerUnsubscribeGroupTools(server, client);
  registerApiKeyTools(server, client);
  registerWebhookTools(server, client);
  registerDomainAuthTools(server, client);
  registerIpManagementTools(server, client);
  registerSubuserTools(server, client);
  registerTeammateTools(server, client);
  registerValidationTools(server, client);
  registerAlertTools(server, client);
  registerDesignTools(server, client);

  // Test connection tool
  server.tool(
    'sendgrid_test_connection',
    'Test the connection to the SendGrid API',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-SendGrid-API-Key'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'SendGrid MCP Server - Comprehensive email API integration',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass SendGrid API key via request header',
          required_headers: {
            'X-SendGrid-API-Key': 'Your SendGrid API key',
          },
        },
        tools: {
          mail: [
            'sendgrid_send_email',
            'sendgrid_send_batch_email',
            'sendgrid_create_batch_id',
            'sendgrid_validate_batch_id',
            'sendgrid_list_scheduled_sends',
            'sendgrid_cancel_scheduled_send',
            'sendgrid_pause_scheduled_send',
          ],
          contacts: [
            'sendgrid_list_contacts',
            'sendgrid_get_contact',
            'sendgrid_get_contact_by_email',
            'sendgrid_add_contacts',
            'sendgrid_delete_contacts',
            'sendgrid_search_contacts',
            'sendgrid_get_contact_count',
          ],
          lists: [
            'sendgrid_list_contact_lists',
            'sendgrid_get_contact_list',
            'sendgrid_create_contact_list',
            'sendgrid_update_contact_list',
            'sendgrid_delete_contact_list',
            'sendgrid_get_list_contact_count',
            'sendgrid_add_contacts_to_list',
            'sendgrid_remove_contacts_from_list',
          ],
          segments: [
            'sendgrid_list_segments',
            'sendgrid_get_segment',
            'sendgrid_create_segment',
            'sendgrid_update_segment',
            'sendgrid_delete_segment',
          ],
          templates: [
            'sendgrid_list_templates',
            'sendgrid_get_template',
            'sendgrid_create_template',
            'sendgrid_update_template',
            'sendgrid_delete_template',
            'sendgrid_duplicate_template',
            'sendgrid_create_template_version',
            'sendgrid_get_template_version',
            'sendgrid_update_template_version',
            'sendgrid_delete_template_version',
            'sendgrid_activate_template_version',
          ],
          campaigns: [
            'sendgrid_list_single_sends',
            'sendgrid_get_single_send',
            'sendgrid_create_single_send',
            'sendgrid_update_single_send',
            'sendgrid_delete_single_send',
            'sendgrid_schedule_single_send',
            'sendgrid_cancel_single_send_schedule',
            'sendgrid_send_single_send_now',
          ],
          stats: [
            'sendgrid_get_stats',
            'sendgrid_get_category_stats',
            'sendgrid_get_mailbox_provider_stats',
            'sendgrid_get_browser_stats',
            'sendgrid_get_device_stats',
            'sendgrid_get_geography_stats',
          ],
          suppressions: [
            'sendgrid_list_bounces',
            'sendgrid_get_bounce',
            'sendgrid_delete_bounces',
            'sendgrid_list_blocks',
            'sendgrid_delete_blocks',
            'sendgrid_list_spam_reports',
            'sendgrid_delete_spam_reports',
            'sendgrid_list_invalid_emails',
            'sendgrid_delete_invalid_emails',
            'sendgrid_list_global_unsubscribes',
            'sendgrid_add_global_unsubscribe',
            'sendgrid_delete_global_unsubscribe',
          ],
          unsubscribeGroups: [
            'sendgrid_list_unsubscribe_groups',
            'sendgrid_get_unsubscribe_group',
            'sendgrid_create_unsubscribe_group',
            'sendgrid_update_unsubscribe_group',
            'sendgrid_delete_unsubscribe_group',
            'sendgrid_list_group_suppressions',
            'sendgrid_add_group_suppressions',
            'sendgrid_delete_group_suppression',
            'sendgrid_search_group_suppressions',
          ],
          senders: [
            'sendgrid_list_senders',
            'sendgrid_get_sender',
            'sendgrid_create_sender',
            'sendgrid_update_sender',
            'sendgrid_delete_sender',
            'sendgrid_resend_sender_verification',
          ],
          apiKeys: [
            'sendgrid_list_api_keys',
            'sendgrid_get_api_key',
            'sendgrid_create_api_key',
            'sendgrid_update_api_key',
            'sendgrid_delete_api_key',
          ],
          webhooks: [
            'sendgrid_get_event_webhook',
            'sendgrid_update_event_webhook',
            'sendgrid_test_event_webhook',
            'sendgrid_list_inbound_parse_webhooks',
            'sendgrid_get_inbound_parse_webhook',
            'sendgrid_create_inbound_parse_webhook',
            'sendgrid_update_inbound_parse_webhook',
            'sendgrid_delete_inbound_parse_webhook',
          ],
          domainAuth: [
            'sendgrid_list_authenticated_domains',
            'sendgrid_get_authenticated_domain',
            'sendgrid_authenticate_domain',
            'sendgrid_validate_domain',
            'sendgrid_delete_authenticated_domain',
            'sendgrid_list_branded_links',
            'sendgrid_get_branded_link',
            'sendgrid_create_branded_link',
            'sendgrid_validate_branded_link',
            'sendgrid_delete_branded_link',
          ],
          ipManagement: [
            'sendgrid_list_ips',
            'sendgrid_get_ip',
            'sendgrid_list_ip_pools',
            'sendgrid_get_ip_pool',
            'sendgrid_create_ip_pool',
            'sendgrid_update_ip_pool',
            'sendgrid_delete_ip_pool',
            'sendgrid_add_ip_to_pool',
            'sendgrid_remove_ip_from_pool',
            'sendgrid_list_ip_warmup',
            'sendgrid_start_ip_warmup',
            'sendgrid_stop_ip_warmup',
          ],
          subusers: [
            'sendgrid_list_subusers',
            'sendgrid_get_subuser',
            'sendgrid_create_subuser',
            'sendgrid_delete_subuser',
            'sendgrid_enable_subuser',
            'sendgrid_disable_subuser',
          ],
          teammates: [
            'sendgrid_list_teammates',
            'sendgrid_get_teammate',
            'sendgrid_invite_teammate',
            'sendgrid_update_teammate_permissions',
            'sendgrid_delete_teammate',
          ],
          validation: ['sendgrid_validate_email'],
          alerts: [
            'sendgrid_list_alerts',
            'sendgrid_get_alert',
            'sendgrid_create_alert',
            'sendgrid_update_alert',
            'sendgrid_delete_alert',
          ],
          designs: [
            'sendgrid_list_designs',
            'sendgrid_get_design',
            'sendgrid_create_design',
            'sendgrid_update_design',
            'sendgrid_delete_design',
            'sendgrid_duplicate_design',
          ],
          customFields: [
            'sendgrid_list_custom_fields',
            'sendgrid_create_custom_field',
            'sendgrid_update_custom_field',
            'sendgrid_delete_custom_field',
          ],
          utility: ['sendgrid_test_connection'],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};

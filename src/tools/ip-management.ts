/**
 * IP Management Tools
 *
 * MCP tools for managing SendGrid IP addresses and pools.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SendGridClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register IP management tools
 */
export function registerIpManagementTools(server: McpServer, client: SendGridClient): void {
  // ===========================================================================
  // List IP Addresses
  // ===========================================================================
  server.tool(
    'sendgrid_list_ips',
    `List all IP addresses in your account.

Returns:
  All IP addresses with their pools and warmup status.`,
    {},
    async () => {
      try {
        const ips = await client.listIpAddresses();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ ips }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get IP Address
  // ===========================================================================
  server.tool(
    'sendgrid_get_ip',
    `Get details of a specific IP address.

Args:
  - ip: IP address

Returns:
  IP details including pools and warmup status.`,
    {
      ip: z.string().describe('IP address'),
    },
    async ({ ip }) => {
      try {
        const result = await client.getIpAddress(ip);
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

  // ===========================================================================
  // List IP Pools
  // ===========================================================================
  server.tool(
    'sendgrid_list_ip_pools',
    `List all IP pools.

IP pools allow you to group IPs for different sending purposes.

Returns:
  All IP pools with their assigned IPs.`,
    {},
    async () => {
      try {
        const pools = await client.listIpPools();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ pools }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get IP Pool
  // ===========================================================================
  server.tool(
    'sendgrid_get_ip_pool',
    `Get details of an IP pool.

Args:
  - name: Pool name

Returns:
  Pool details with assigned IPs.`,
    {
      name: z.string().describe('Pool name'),
    },
    async ({ name }) => {
      try {
        const pool = await client.getIpPool(name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pool, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create IP Pool
  // ===========================================================================
  server.tool(
    'sendgrid_create_ip_pool',
    `Create a new IP pool.

Args:
  - name: Pool name

Returns:
  The created pool.`,
    {
      name: z.string().min(1).describe('Pool name'),
    },
    async ({ name }) => {
      try {
        const pool = await client.createIpPool({ name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'IP pool created', pool },
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
  // Update IP Pool
  // ===========================================================================
  server.tool(
    'sendgrid_update_ip_pool',
    `Rename an IP pool.

Args:
  - name: Current pool name
  - newName: New pool name

Returns:
  The updated pool.`,
    {
      name: z.string().describe('Current name'),
      newName: z.string().min(1).describe('New name'),
    },
    async ({ name, newName }) => {
      try {
        const pool = await client.updateIpPool(name, newName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'IP pool renamed', pool },
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
  // Delete IP Pool
  // ===========================================================================
  server.tool(
    'sendgrid_delete_ip_pool',
    `Delete an IP pool.

IPs in the pool will not be deleted, just removed from the pool.

Args:
  - name: Pool name

Returns:
  Confirmation of deletion.`,
    {
      name: z.string().describe('Pool name'),
    },
    async ({ name }) => {
      try {
        await client.deleteIpPool(name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `IP pool ${name} deleted` },
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
  // Add IP to Pool
  // ===========================================================================
  server.tool(
    'sendgrid_add_ip_to_pool',
    `Add an IP address to a pool.

Args:
  - poolName: Pool name
  - ip: IP address to add

Returns:
  Confirmation of addition.`,
    {
      poolName: z.string().describe('Pool name'),
      ip: z.string().describe('IP address'),
    },
    async ({ poolName, ip }) => {
      try {
        await client.addIpToPool(poolName, ip);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `IP ${ip} added to pool ${poolName}` },
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
  // Remove IP from Pool
  // ===========================================================================
  server.tool(
    'sendgrid_remove_ip_from_pool',
    `Remove an IP address from a pool.

Args:
  - poolName: Pool name
  - ip: IP address to remove

Returns:
  Confirmation of removal.`,
    {
      poolName: z.string().describe('Pool name'),
      ip: z.string().describe('IP address'),
    },
    async ({ poolName, ip }) => {
      try {
        await client.removeIpFromPool(poolName, ip);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `IP ${ip} removed from pool ${poolName}` },
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
  // List IPs in Warmup
  // ===========================================================================
  server.tool(
    'sendgrid_list_ip_warmup',
    `List all IPs currently in warmup.

Returns:
  IPs in warmup with their status.`,
    {},
    async () => {
      try {
        const ips = await client.listIpWarmup();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ ipsInWarmup: ips }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Start IP Warmup
  // ===========================================================================
  server.tool(
    'sendgrid_start_ip_warmup',
    `Start the warmup process for an IP.

Warmup gradually increases sending volume to build reputation.

Args:
  - ip: IP address to warm up

Returns:
  The IP with warmup status.`,
    {
      ip: z.string().describe('IP address'),
    },
    async ({ ip }) => {
      try {
        const result = await client.startIpWarmup(ip);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `IP warmup started for ${ip}`, ip: result },
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
  // Stop IP Warmup
  // ===========================================================================
  server.tool(
    'sendgrid_stop_ip_warmup',
    `Stop the warmup process for an IP.

Args:
  - ip: IP address

Returns:
  Confirmation.`,
    {
      ip: z.string().describe('IP address'),
    },
    async ({ ip }) => {
      try {
        await client.stopIpWarmup(ip);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `IP warmup stopped for ${ip}` },
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

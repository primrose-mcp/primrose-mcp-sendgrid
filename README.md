# SendGrid MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/sendgrid)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

A Model Context Protocol (MCP) server for SendGrid, enabling email delivery, contact management, and marketing campaign automation.

## Features

- **Mail** - Send transactional and marketing emails
- **Contacts** - Contact management
- **Lists** - Contact list management
- **Segments** - Dynamic contact segments
- **Custom Fields** - Custom contact attributes
- **Templates** - Email template management
- **Single Sends** - Marketing campaign sends
- **Senders** - Sender identity management
- **Stats** - Email statistics and analytics
- **Suppressions** - Bounce and spam management
- **Unsubscribe Groups** - Subscription preferences
- **API Keys** - API key management
- **Webhooks** - Event webhook configuration
- **Domain Auth** - Domain authentication (SPF, DKIM)
- **IP Management** - IP address management
- **Subusers** - Subuser account management
- **Teammates** - Team member access
- **Validation** - Email address validation
- **Alerts** - Alert configuration
- **Designs** - Email design library

## Quick Start

### Recommended: Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const client = new PrimroseMCP({
  server: 'sendgrid',
  credentials: {
    apiKey: 'SG.your-sendgrid-api-key'
  }
});
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-SendGrid-API-Key` | Your SendGrid API key |

## Available Tools

### Mail
- `sendgrid_send_email` - Send an email
- `sendgrid_send_template_email` - Send using a template
- `sendgrid_send_bulk_email` - Send bulk emails

### Contacts
- `sendgrid_list_contacts` - List all contacts
- `sendgrid_get_contact` - Get contact details
- `sendgrid_create_contact` - Add a new contact
- `sendgrid_update_contact` - Update contact
- `sendgrid_delete_contact` - Delete contact
- `sendgrid_search_contacts` - Search contacts

### Lists
- `sendgrid_list_contact_lists` - List all contact lists
- `sendgrid_get_contact_list` - Get list details
- `sendgrid_create_contact_list` - Create a new list
- `sendgrid_update_contact_list` - Update list
- `sendgrid_delete_contact_list` - Delete list
- `sendgrid_add_contacts_to_list` - Add contacts to list

### Templates
- `sendgrid_list_templates` - List email templates
- `sendgrid_get_template` - Get template details
- `sendgrid_create_template` - Create template
- `sendgrid_update_template` - Update template
- `sendgrid_delete_template` - Delete template

### Single Sends
- `sendgrid_list_single_sends` - List marketing campaigns
- `sendgrid_get_single_send` - Get campaign details
- `sendgrid_create_single_send` - Create campaign
- `sendgrid_schedule_single_send` - Schedule campaign
- `sendgrid_delete_single_send` - Delete campaign

### Stats
- `sendgrid_get_global_stats` - Get global email stats
- `sendgrid_get_category_stats` - Get stats by category
- `sendgrid_get_mailbox_provider_stats` - Stats by provider
- `sendgrid_get_browser_stats` - Stats by browser

### Suppressions
- `sendgrid_list_bounces` - List bounced emails
- `sendgrid_list_spam_reports` - List spam reports
- `sendgrid_list_blocks` - List blocked emails
- `sendgrid_list_invalid_emails` - List invalid emails

### Domain Authentication
- `sendgrid_list_authenticated_domains` - List domains
- `sendgrid_authenticate_domain` - Authenticate domain
- `sendgrid_validate_domain` - Validate domain settings

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type checking
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [SendGrid Developer Portal](https://sendgrid.com/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

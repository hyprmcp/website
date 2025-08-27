---
title: 'Getting Started with MCP Servers: A Complete Guide'
description: 'Learn how to build, deploy, and manage your first Model Context Protocol server with Hypr MCP.'
publishDate: 2025-01-18
updateDate: 2025-01-18
slug: 'getting-started-with-mcp-servers'
author: 'Engineering Team'
image: '/src/assets/blog/getting-started-mcp.svg'
tags:
  - a
---

Model Context Protocol (MCP) servers are revolutionizing how AI agents interact with external tools and data.
In this comprehensive guide, we'll walk you through creating, deploying, and managing your first MCP server using Hypr MCP.

## What is an MCP Server?

An MCP server is a standardized interface that allows AI models like Claude and ChatGPT to interact with external tools, databases, and APIs.
Think of it as a bridge between AI capabilities and your custom functionality.

## Prerequisites

Before we begin, make sure you have:

- Node.js 18+ installed
- Basic JavaScript/TypeScript knowledge
- A Hypr MCP account (free tier is perfect for getting started)

## Step 1: Install the Hypr CLI

First, install the Hypr MCP CLI globally:

```bash
npm install -g @hyprmcp/cli
```

Verify the installation:

```bash
hypr --version
```

## Step 2: Create Your First MCP Server

Let's create a simple weather MCP server that provides weather information to AI agents:

```bash
hypr init weather-mcp --template basic
cd weather-mcp
```

This creates a basic MCP server structure with:

- `server.js` - Main server logic
- `tools.json` - Tool definitions
- `hypr.config.json` - Deployment configuration

## Step 3: Define Your Tools

Edit `tools.json` to define what tools your MCP server exposes:

```json
{
  "name": "weather-mcp",
  "version": "1.0.0",
  "tools": [
    {
      "name": "getWeather",
      "description": "Get current weather for a location",
      "parameters": {
        "location": {
          "type": "string",
          "description": "City name or coordinates",
          "required": true
        },
        "units": {
          "type": "string",
          "description": "Temperature units (celsius or fahrenheit)",
          "enum": ["celsius", "fahrenheit"],
          "default": "celsius"
        }
      }
    }
  ]
}
```

## Step 4: Implement the Server Logic

Update `server.js` with your tool implementation:

```javascript
import {MCPServer} from '@hyprmcp/sdk';

const server = new MCPServer({
  name: 'weather-mcp',
  version: '1.0.0',
});

server.tool('getWeather', async ({location, units = 'celsius'}) => {
  // Your weather API logic here
  const weatherData = await fetchWeatherAPI(location);

  return {
    location,
    temperature: convertUnits(weatherData.temp, units),
    conditions: weatherData.conditions,
    humidity: weatherData.humidity,
  };
});

server.start();
```

## Step 5: Test Locally

Before deploying, test your MCP server locally:

```bash
npm run dev
```

Use the Hypr MCP testing tool to verify your tools work correctly:

```bash
hypr test getWeather --location "San Francisco"
```

## Step 6: Configure Authentication

Hypr MCP provides OAuth2 authentication out of the box.
Configure allowed users in `hypr.config.json`:

```json
{
  "auth": {
    "providers": ["google", "github"],
    "allowedDomains": ["yourcompany.com"],
    "publicAccess": false
  }
}
```

## Step 7: Deploy to Production

Deploy your MCP server with a single command:

```bash
hypr deploy
```

You'll receive:

- A unique URL for your MCP server
- OAuth2 client credentials
- Analytics dashboard access

Example output:

```
🚀 Deployment successful!
Server URL: https://weather-mcp.hyprmcp.com
Dashboard: https://dashboard.hyprmcp.com/weather-mcp
```

## Step 8: Connect to AI Clients

### Using with Claude

1. Open Claude settings
2. Navigate to MCP Servers
3. Add your server URL
4. Authenticate with OAuth2

### Using with Custom Applications

```javascript
import {MCPClient} from '@hyprmcp/client';

const client = new MCPClient({
  serverUrl: 'https://weather-mcp.hyprmcp.com',
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});

const weather = await client.call('getWeather', {
  location: 'Tokyo',
});
```

## Best Practices

### 1. Error Handling

Always implement robust error handling:

```javascript
server.tool('getWeather', async params => {
  try {
    const data = await fetchWeatherAPI(params.location);
    return {success: true, data};
  } catch (error) {
    return {
      success: false,
      error: error.message,
      retryable: error.code === 'RATE_LIMIT',
    };
  }
});
```

### 2. Rate Limiting

Protect your resources with built-in rate limiting:

```json
{
  "rateLimits": {
    "perMinute": 60,
    "perHour": 1000,
    "perUser": {
      "perMinute": 10
    }
  }
}
```

### 3. Monitoring

Use the analytics dashboard to monitor:

- Tool call frequency
- Error rates
- Response times
- User patterns

## Advanced Features

### Environment Variables

Store sensitive data securely:

```bash
hypr secrets set WEATHER_API_KEY=your-api-key
```

Access in your code:

```javascript
const apiKey = process.env.WEATHER_API_KEY;
```

### Custom Domains

Use your own domain:

```bash
hypr domain add weather.yourcompany.com
```

### Webhooks

Set up webhooks for real-time notifications:

```javascript
server.on('toolCall', async event => {
  await notifyWebhook({
    tool: event.toolName,
    user: event.userId,
    timestamp: event.timestamp,
  });
});
```

## Troubleshooting

### Common Issues

**Authentication Errors**

- Verify OAuth2 credentials
- Check allowed domains configuration
- Ensure user has proper permissions

**Tool Not Found**

- Verify tool name in tools.json
- Check server deployment status
- Clear client cache

**Rate Limit Exceeded**

- Review rate limit configuration
- Implement exponential backoff
- Consider upgrading your plan

## Next Steps

Congratulations!
You've successfully created and deployed your first MCP server.
Here are some next steps:

1. **Explore Templates**: Check out our [template gallery](https://hyprmcp.com/templates) for more complex examples
2. **Join the Community**: Connect with other developers in our [Discord](https://discord.gg/hyprmcp)
3. **Read the Docs**: Deep dive into our [documentation](https://hyprmcp.com/docs)
4. **Build Something Amazing**: Share your creations with #BuiltWithHyprMCP

## Conclusion

MCP servers open up endless possibilities for extending AI capabilities.
With Hypr MCP, deploying and managing these servers is simpler than ever.
Start building today and join the growing community of MCP developers!

Have questions?
Reach out to our support team at support@hyprmcp.com or join our Discord community.

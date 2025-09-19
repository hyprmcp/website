---
title: 'Prompt Analytics for MCP Servers'
description: 'How to intercept the prompt that triggered the MCP Server tool call for MCP prompt analytics.'
publishDate: 2025-09-22
lastUpdated: 2025-09-22
slug: 'mcp-server-prompt-analytics'
authors:
  - name: 'Philip Miglinci'
    role: 'Co-founder'
    image: '/src/assets/blog/authors/philip.jpg'
    linkedIn: https://www.linkedin.com/in/pmigat/
    gitHub: https://github.com/pmig
image: '/src/assets/blog/mcp-server-prompt-analytics.svg'
tags:
  - mcp
  - analytics
  - mcp-gateway
---


I am Philip, an Engineer at Hypr MCP, where we help companies connect their internal applications to LLM-based workflows with the power of MCP servers.
[Join our waitlist](/waitlist/) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.
Every time we showcase our Hypr MCP platform, this is the most frequently asked question: How did we manage to get the prompt analytics?
In this blog post, I want to show you how and why we built prompt analytics into our MCP server Gateway.

## Introduction

The Model Context Protocol (MCP) allows LLM clients and agents to dynamically add context to the prompt and even perform method calls.
Typical use cases for dynamically adding additional context to LLM prompts can be found in the engineering domain.
MCP servers like Context7 and GitMCP can provide dynamic documentation based on prompts, while MCP servers from specific software vendors like
Stack Auth (https://mcp.stack-auth.com/) can directly add relevant information to the prompts if a tool description matches a prompt's problem.
On the other side, MCP servers can be used to let LLMs instruct LLM clients to perform actions on third-party systems like the GitHub or HubSpot MCP server.

## MCP Server Analytics—MCP Servers Often Run in the Dark

Previously, MCP servers mostly ran on the client side with stdio being the default method of how JSON-RPC messages were sent from and to the clients.
A benefit for these servers has been simplicity - MCP server developers didn't need to care about the runtime and connectivity constraints as the user needed to make sure they start the server program.
With the migration to remote MCP servers, thanks to the streamable HTTP transport method for JSON-RPC messages, new analytics methods become possible.

In the next sections, we will focus exclusively on remote MCP servers.

### Application Layer Analytics for MCP Servers

Application layer analytics means adding a logging or metrics library directly into your MCP server's application code.
As remote MCP servers follow the same principles as traditional MCP servers, traditional logging or analytics libraries can be used to send events about tool method usage and tool arguments.
Getting analytics for system calls like `tools/list` or `initialize` is not that easy, as these calls are often abstracted by the frameworks.
But especially analyzing these requests will help you improve your MCP server and spot errors where clients might abort the session after the initialize request because authentication might fail.

### Gateway-Level Analytics for MCP Servers

Similar to how WAFs (Web Application Firewalls) work, MCP servers can be put behind a gateway that is able to unwrap and analyze requests and responses.

_Tip:_ MCP Gateways can also be used to [add authentication for your MCP server](/blog/mcp-server-authentication/).

As MCP supports various transport protocols, traditional gateways are not built to unwrap and analyze MCP Server tool calls.
While the client establishes an HTTP connection with the server and sends multiple JSON-RPC requests, it is not possible to perform the analytics on an HTTP level.
MCP Gateways need to be able to constantly hold both connections to the client and server, receive and analyze a JSON-RPC request, and then forward it to the second connection.

Initially our Gateway used a basic `io.TeeReader` from the Golang standard library to simply fork off the request and response body for further analysis.
However, as you will see in the next section, this approach has its limitations as it does not allow us to modify the response body.
We therefore switched processing of the response body to a custom `io.Reader` implementation that parses each SSE event from the upstream body reader, allows for modifications and makes the modified event available downstream with a backing buffer.
This is necessary as we want to handle each event individually, without having to buffer the entire response body.

As you can see in the gateway configuration, you are able to configure a webhook for each MCP server.
The gateway will forward every JSON-RPC request and its response directly to the webhook endpoint.

```yaml
host: http://localhost:9000/
proxy:
  - path: /path/mcp
    http:
      url: http://localhost:3000/mcp/
    webhook:
      url: http://localhost:8080/webhook/gateway/87dd8dde-c7aa-4535-a6d7-3b313ffb1d0c
```

### Prompt Analytics

After successfully analyzing the JSON-RPC requests and responses, you can extract valuable insights about how your MCP server is being used.

Every time someone sees the [HyprMCP Analytics Dashboard](/mcp-analytics/) for the first time, they immediately ask us how we have been able to get prompt insights.


![HyprMCP Dashboard](/src/assets/screenshots/mcp-prompt-analytics-dark.webp)


Most MCP clients that are embedded into agentic workflows don't ask for permission every time a tool calling operation gets executed.
The HyprMCP Gateway is already able to intercept the MCP operations, so if activated, we are adding additional optional arguments to all tool operations, which clients will happily fill in.


## Conclusion

If you are looking for a battle-tested, batteries-included MCP server gateway, check out our [MCP Gateway](https://github.com/hyprmcp/mcp-gateway), which implements everything we discussed above, and more.

[Join our waitlist](/waitlist/) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.

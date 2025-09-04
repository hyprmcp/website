---
title: 'Prompt analytics for MCP Servers'
description: 'How to intercept the prompt that triggered the MCP Server tool call for mcp prompt analytics.'
publishDate: 2025-09-11
lastUpdated: 2025-09-11
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
[Join our waitlist](/waitlist) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.
Every time we showcase our Hypr MCP platform, this is the most asked question: How did we manage get the prompt analytics?
In this blog post, I want to show you how and why we built prompt analytics into our MCP server Gateway.

## Introduction

The Model Context Protocol (MCP) allows LLM clients and agents to dynamically add context to the prompt and even perform method calls.
Typical use cases for dynamically adding additional context to LLM prompts can be found in the engineering domain.
MCP servers like Context7, GitMCP can provide dynamic documentation based on prompts, while MCP servers from specific software vendors like
Stack Auth (https://mcp.stack-auht.com/) can directly add relevant information to the prompts if a tool description matches a prompts problem.
On the other side MCP servers can be used to let LLMs instruct LLM clients to perform actions on third party systems like the GitHub or Hubspot MCP server.

## MCP server Analytics - MCP servers often run in the dark

Previously MCP mostly run on the client side with stdio being the default method of how JSON-RPC messages where sent from and to the clients.
A benefit for these servers have been similicity that MCP server developers didn't need to care about the runtime and connectivy constraints as the user needed to make sure they are start the server programm.
With the migration to remote MCP servers thanks to the streamable http transport method for JSON-RPC message new analytics methods become possible.

In the next sections we will focus exclusivley focus on remote MCP servers.

### Application layer analytics for MCP Servers

Application layer analytics means adding a logging or metrics library directly into your MCP servers application code.
As remote MCP servers follow the same principles as traditional MCP servers traditional logging or analytics libraries can be used to send events about tool method usage and tool arguments.
Getting analytics for system calls like `tools/list` or `initilize` is not that easy, as these calls are often abstracted by the frameworks.
But especially analyzing these requests will help you improve your MCP server and spot errors, where clients might abort the session after the initialize request, because authentication might fail.

### Gateway level analytics MCP Servers

Similar to how WAF (Web Application Firewall) work MCP servers can be put behind a gateway that is able to unwrap and anaylze requests and responses.

_Tipp:_ MCP Gateways can also be used to [add authentication for you MCP server](/blog/mcp-server-authentication/).

As MCP supports various transport protocols traditional are not build to unwrap analyze MCP Server tool calls.
While the client establishes an http connection with the server and sends multiple JSON-RPC request it is not possible to perform the analytics on a http level.
MCP Gateways need to be able to inspect constantly hold both connections to the client and server, receive and analyze a JSON-RPC request and then forward it to the second connection.

TODO: @kosmoz - Can you add a small section on how you intially used the T-Reader, but now migrated to a more sophisticated approach?

As you can see in the gateway configuration, you are able to configure a webook for each mcp server.
The gateway will forward every JSON-RPC request and its response directly to webook endpoint


```yaml
host: http://localhost:9000/
proxy:
  - path: /path/mcp
    http:
      url: http://localhost:3000/mcp/
    webhook:
      url: http://localhost:8080/webhook/gateway/87dd8dde-c7aa-4535-a6d7-3b313ffb1d0c
```

### Prompt analytics

After successfully analyzing the JSON-G

## Conclusion

If you are looking for a battle-tested, batteries-included MCP server gateway, check out our https://github.com/hyprmcp/mcp-gateway, which implements everything we discussed above, and more.

[Join our waitlist](/waitlist) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.

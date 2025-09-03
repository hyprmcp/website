---
title: 'Receiving prompt information for MCP Servers'
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


## Missing Analytics - MCP servers often run in the dark

Previously 


## Conclusion

If you are looking for a battle-tested, batteries-included MCP server gateway, check out our https://github.com/hyprmcp/mcp-gateway, which implements everything we discussed above, and more.

[Join our waitlist](/waitlist) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.

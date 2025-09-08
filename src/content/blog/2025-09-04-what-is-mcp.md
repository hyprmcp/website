---
title: 'MCP Explained 2025 - A Comprehensive Introduction to MCP'
description: 'What are MCP Servers, What are they used for and how to get started'
publishDate: 2025-09-08
lastUpdated: 2025-09-08
slug: 'what-is-mcp'
authors:
  - name: 'Louis Weston'
    role: 'Co-Founder'
    image: 'https://avatars.githubusercontent.com/u/130456438'
    linkedIn: https://www.linkedin.com/in/louisnweston/
    gitHub: https://github.com/thekubernaut
image: '/src/assets/blog/what-is-mcp.svg'
tags:
  - mcp
  - intro
---

## Introduction

Large language models have transformed the way people interact with technology, yet these powerful models often operate in isolation from real‑world data. This isolation forces developers and users into a tedious cycle of copying data into chat windows, waiting for a response, and then applying the result manually. On a larger scale, organisations face the NxM problem: dozens of AI models (N) must integrate with countless tools (M), leading to thousands of bespoke connectors. The Model Context Protocol (MCP) was designed to break this cycle. MCP provides a standard way for AI agents to access external data, tools and memory, making integrations plug‑and‑play rather than bespoke.

At the heart of this ecosystem sits the MCP server. By exposing resources, tools and prompts, an MCP server delivers context directly to the model when it needs it. With adoption accelerating since Anthropic open‑sourced the standard in late 2024 and a rapidly growing community of servers and clients, understanding MCP servers has become essential for developers, businesses and AI enthusiasts alike.

This guide introduces the Model Context Protocol and MCP servers, explains why you might want to build or use one, describes how they work, outlines use cases across industries, provides practical steps to get started and answers common questions. It concludes with security best practices and internal resources to explore next.

## What is MCP and what is an MCP server?

### Defining the Model Context Protocol

The Model Context Protocol is an open standard that enables AI agents to integrate external tools and data sources in a safe, structured and stateful way. MCP uses a client–server architecture: a host application (such as a desktop app or IDE) embeds an MCP client to manage connections, while a separate MCP server exposes capabilities. Communication happens over standard channels (STDIO for local integrations or HTTP+Server‑Sent Events for remote ones) using JSON‑RPC 2.0 to ensure stateful interactions.

MCP was created to solve the fragmentation inherent in tool integrations. Function calling—where a model invokes predetermined functions by name—works but remains vendor‑specific and still requires model‑specific schemas. MCP standardises this process by describing tools, resources and prompts in a unified way and exposing them to any compatible AI client. Because it is open and extensible, any developer can implement an MCP server or client, making the ecosystem portable across models, tools and platforms.

### Defining an MCP server

An MCP server is a lightweight program that exposes specific capabilities (resources, tools or prompts) to AI agents through the MCP protocol. Instead of each AI model needing to understand how to call an API and parse responses, the MCP server handles the details and returns structured results. In effect, MCP servers act as adapters: they can fetch data from databases, call external APIs, manipulate files or provide reusable prompts.

The protocol supports three types of exposures:

* **Resources**: Structured data such as files, database queries or API responses. For example, a file‑system server might let the model read documents from a specific directory.
* **Tools**: Actions that the AI agent can perform, such as creating a GitHub issue or running a SQL query.
* **Prompts**: Pre‑written instructions or templates that guide the model in a particular task, such as formatting a report.

### A brief history and the growing ecosystem

Anthropic introduced MCP in late 2024 and quickly open-sourced it to accelerate adoption. Since then, hundreds of community servers have appeared—from simple reference implementations to sophisticated connectors for enterprise platforms.

Major platforms have embraced the standard: 


- **[Microsoft’s Azure MCP Server](https://github.com/Azure/azure-mcp)** allows AI agents to interact with Azure resources using natural language commands

- **[GitHub MCP Server](https://github.com/github/github-mcp-server)** enables AI agents to manage GitHub repositories (e.g., reviewing code, opening pull requests, browsing issues) through MCP-standardized interactions.

- **[Notion MCP](https://github.com/makenotion/notion-mcp-server)** offers secure, hosted access to Notion workspaces, allowing AI agents to read, write, and organize content in a user’s workspace via MCP calls.

- **[PayPal Remote MCP Server](https://www.paypal.ai/docs/tools/mcp-quickstart#remote-mcp-server)** (now supporting Anthropic’s API as well as OpenAI’s) empowers AI tools to engage in agentic commerce workflows—such as generating invoices or facilitating payments—through natural language interactions.

- **[Figma Dev Mode MCP Server](https://www.figma.com/blog/introducing-figmas-dev-mode-mcp-server/)** grants AI coding agents access to precise design data—like graph metrics and color values—instead of relying on image interpretation, enabling highly accurate design-to-code experiences.


## Why do you need an MCP server?

While the technology may seem esoteric, an MCP server can offer concrete advantages for both individuals and businesses.

* **Reduce manual friction**: Without MCP, developers and users must copy data between applications, manually trigger APIs and assemble context. An MCP server centralises these tasks, allowing an AI agent to perform them directly. For example, instead of pasting file contents into a chat, the agent can fetch the file via a file‑system server and summarise it for you.
* **Solve the NxM integration problem**: Each AI model (N) connecting to each tool (M) traditionally requires a custom integration. MCP standardises the interface so that any model can work with any tool, reducing integration overhead for teams maintaining complex AI systems.
* **Enable agentic workflows**: Agents can plan and execute sequences of actions when they have access to the right tools. For instance, an agent could read code from a repository, apply refactoring functions, create a pull request and notify team members—all via MCP.


## MCP architecture and how servers work

### Hosts, clients, servers and transport

# MCP Architecture

flowchart TD
    A[Host Applications] <-->B(MCP Client)
    B[MCP Client] <-->|JSON-RPC| C(Transport Layer)
    C[Transport Layer] <-->|http+sse| D(MCP Server)


1. **Host application**: The primary application that interacts with users. Examples include Claude Desktop, IDEs like Cursor or VS Code and custom chat platforms.
2. **MCP client**: A component inside the host that connects to MCP servers. It negotiates capabilities, manages sessions and translates between the host’s needs and the MCP protocol.
3. **Transport layer**: Communication can occur via STDIO for local servers (ideal when both client and server run on the same machine) or via HTTP with server‑sent events (SSE) for remote servers.
4. **MCP server**: A standalone program that exposes resources, tools and prompts. Each server focuses on a single integration, such as a Git server or a weather service.

All interactions use JSON‑RPC 2.0 to send requests, results, errors and notifications. This ensures consistent message formats across implementations.

### The MCP request lifecycle

From the AI agent’s perspective, using an MCP server follows a predictable pattern:

1. **Client request**: The user asks the host application to perform an action. The client packages the request and includes session or user identifiers.
2. **Capability discovery**: When the client connects to a server, it asks “What capabilities do you offer?”. The server returns its available resources, tools and prompts. This step happens once per session.
3. **Permission prompt**: To protect privacy, the client may ask the user to approve a specific tool invocation. For instance, Claude Desktop might prompt “Allow the weather server to fetch the forecast?”
4. **Server processing**: The server receives the request, handles authentication and authorization, queries back‑end systems or executes commands, applies masking or transformation logic and prepares a structured response.
5. **Response and context update**: The client integrates the returned data into the model’s context and continues the conversation or workflow. The agent may call multiple servers sequentially and compose the results.

### Local vs remote connections

MCP supports both local and remote connections.  Historically, most implementations were **local**, using the **stdio** transport to exchange messages via standard input and output.  This worked because early MCP servers didn’t include authentication or authorization.  However, the ecosystem is rapidly moving toward **remote** MCP servers that communicate over HTTP and Server‑Sent Events (SSE).  Remote transports allow an agent to access services on other machines or across the Internet and support secure, multi‑user environments.  The substack “Crossing the MCP Adoption Chasm” notes that most early implementations were local but predicts that remote MCP servers will overtake local ones as authentication matures.  Local servers remain ideal for sensitive data or offline use, but HTTP/SSE is becoming the de‑facto standard for hosted services and cross‑platform access.  When designing a server, think carefully about where it will run and select the appropriate transport.

### MCP vs traditional APIs and function calls

MCP differs from traditional RESTful APIs in its purpose and interaction model. Whereas APIs are general interfaces that any software can call, MCP servers are designed specifically for AI agents and emphasise context, tool discovery and stateful interactions. Traditional APIs require the model to understand the endpoint, parse the response and integrate the data. With MCP, the server handles the API call and returns structured data, freeing the agent from parsing.

Function calling in modern AI models similarly allows the model to call external functions but still requires model‑specific schemas and separate implementations for each model. MCP builds on function calling by standardising how tools are defined and discovered, providing a universal protocol that works across models and clients.

## Use cases and examples

### Securely exposing enterprise data

Enterprises often store sensitive customer or operational data in CRM, ERP or HCM systems. Connecting these directly to an AI agent can be risky or require significant integration work. An MCP server can sit between the agent and these systems, enforcing authentication, authorization and data masking. For instance, a finance MCP server might fetch transaction records but mask account numbers before returning them.

### Federating access to multiple data silos

Many organisations have data scattered across databases, file systems and SaaS tools. An MCP server can act as a semantic data layer, orchestrating queries across multiple systems and returning unified results. This allows agents to answer questions that span multiple sources without custom code.

### API and external service integrations

MCP servers can wrap public APIs—weather services, stock quotes, geocoding or social media platforms—so that agents can call them with simple commands. For example, a web scraping server can search the web and extract current data, while a database server can run SQL queries.

### Domain‑specific knowledge and tools

Industry‑specific MCP servers can provide curated data sets (medical codes, legal precedents, product catalogs) or expose tools like CRM updates and HR workflows. A healthcare MCP server, for instance, might allow an agent to look up symptom–disease relationships or schedule appointments.

### Enabling AI tools

Some MCP servers expose actual tools or actions. For example, a GitHub server may let an agent create an issue, review a pull request or clone a repository, while a DevOps server can manage Kubernetes resources. These actions empower agents to act on behalf of the user.


## Limitations and challenges of MCP adoption

Despite its potential, MCP is not without shortcomings.  Understanding these challenges will help you set realistic expectations and plan mitigation strategies.

* **Limited tool scope and few enterprise servers**: Because early versions of the spec lacked authentication and authorization, most existing servers run locally via stdio and expose a narrow set of tools.  Remote servers require secure authentication; as a result, there are still relatively few enterprise‑grade MCP servers covering complex business systems.  Many companies must build their own connectors, and the ecosystem of off‑the‑shelf servers is still nascent.

* **Spec maturity and ecosystem size**: Authorization and remote transport were only added to the official spec in March 2025, and the proposals continue to evolve.  The protocol and its tooling are still early; features like OAuth support, protected resource metadata and multi‑user client management are under active development.  This immaturity means that integration patterns may change and enterprises may hesitate to rely on MCP for critical workflows.

* **Security remains paramount**: Early MCP servers lacked built‑in security controls and often operated under the assumption that the local environment could be trusted.  Without proper authentication, authorization and data masking, an agent could inadvertently expose sensitive files or perform unauthorized actions.

These limitations are typical of an emerging standard.  As the ecosystem matures—with better tooling, more hosted servers and stronger security models—many of these challenges will lessen.  For now, awareness of the shortcomings helps you plan and prioritise accordingly.

## How to build and connect to an MCP server

Building an MCP server is easier than you might think, especially with community libraries and detailed examples. Here’s a high‑level overview inspired by Apidog’s weather server example and other reference implementations.

### 1. Set up the environment

Ensure you have a supported programming language and library. Many servers are written in Node.js or Python; for Python, you can use the `mcp` package. Install the necessary tools (e.g., Python 3.10+, Node.js) and set up a virtual environment to manage dependencies.

### 2. Initialize the project

Create a new directory for your server and initialise your project (e.g., using `uv init my_server` for Python projects). Install the MCP library and any dependencies needed to access your target resource. If you’re building a weather server, you might need an HTTP client like `httpx`.

### 3. Implement the MCP server

Write a script that imports the MCP library and defines the server’s capabilities:

* **Describe the server**: Provide metadata such as name and description.
* **Define resources/tools/prompts**: For a weather server, you might expose `get_forecast` and `get_alerts` tools that call an external weather API.
* **Handle requests**: Implement functions that receive parameters, fetch data from the external service, handle errors and return JSON responses.

Each tool definition should include input parameters (with type information), output structure and a description. The MCP library will expose these to the client during capability discovery.

### 4. Run the server

Start the server by specifying the transport. For local development, use STDIO or a local HTTP port. For remote deployment, you might run it behind a secure proxy with TLS.

### 5. Connect a client

Use an MCP‑compatible client such as Claude Desktop, an IDE extension or a custom app. Configure the client to connect to your server. When it starts, the client will discover the server’s tools and list them for user approval. Once approved, the AI agent can call your server using natural language.

### 6. Iterate and secure

Test the server thoroughly. Ensure proper error handling, implement authentication and authorization if needed and consider rate‑limiting to prevent abuse. You can extend the server to include more tools or integrate additional services.

### Testing and debugging

While you develop your server, you’ll want to verify that the exposed tools behave as expected.  The **MCP inspector** is a visual testing tool that makes this process simple.  Run it locally with `npx @modelcontextprotocol/inspector`, then enter the URL of your remote or local MCP server and authenticate if necessary.  After logging in, click **List Tools** to see and interact with the server’s tools.  This browser‑based interface lets you invoke methods, inspect responses and debug your server without wiring up a full client.


Beyond the official **MCP inspector**, there is a [specialized fork by MCP Jam](https://github.com/MCPJam/inspector). It includes powerful enhancements such as multi-server support, an LLM playground, OAuth support, and improved logging and developer experience.  


## Security and best practices

While MCP streamlines integrations, it does not include built‑in authentication, authorization or encryption by default. This flexibility allows implementations to choose their own security model, but it also introduces risk. Here’s how to secure your MCP deployment.

### Implement authentication and authorization

Adding secure authentication and authorization remains one of the biggest hurdles for MCP adoption.  Authentication verifies the identity of the client or user, while authorization restricts what actions the agent can perform.  The **Hypr MCP Gateway** solves much of this complexity by acting as an OAuth proxy with dynamic client registration and prompt telemetry.  By separating authentication into a gateway, your MCP server can remain lightweight and spec‑compliant without you writing your own auth code.  Always require the user to approve tool usage, especially when dealing with sensitive operations or data.

### Encrypt communication

When using remote servers, always enable TLS (HTTPS) to protect data in transit. MCP messages over HTTP are vulnerable to impersonation or on‑path attacks. Local servers can rely on STDIO, but remote servers should never run unencrypted.

### Restrict permissions

Only expose the minimum capabilities required. Research by Knostic and Backslash Security found that many MCP servers in 2025 lacked any form of authentication and were over‑permissioned. Configure fine‑grained scopes and avoid giving the agent write access when read‑only is sufficient. Use JSON schemas to validate user input and prevent malicious commands.

### Use “roots” to limit file access

Descope recommends defining roots, which specify the directories a file‑system server can access. This prevents accidental exposure of sensitive files. For example, you can restrict a server to `/user/documents/project/` rather than the entire drive.

### Monitor and audit

Log all requests and responses for auditing. Implement rate limiting to prevent denial‑of‑service attacks. Periodically review the server’s permissions, update dependencies and apply security patches.


## Frequently asked questions

### What is a remote MCP server and how does it differ from a local one?

A remote MCP server runs on a separate machine and communicates over HTTP with server‑sent events, often secured by TLS and authentication. It’s ideal for sharing capabilities across a team or exposing cloud services. A local MCP server operates on the same machine as the client and uses STDIO, which is fast and often simpler.

### Why do I need an MCP server if I already use function calling or APIs?

Function calling and APIs handle discrete tasks but lack a universal discovery mechanism and often require per‑model schemas. MCP standardises how tools are defined, discovered and called across models and clients. It eliminates repetitive boilerplate and integrates context management, making it easier to build complex agentic workflows.

### How do I connect to an MCP server from my IDE?

Most MCP clients provide a configuration interface. In tools like Claude Desktop, you specify the server’s address and port (or choose a local one) and enable the client. During startup, the client discovers available tools, lists them and asks for your approval. Once approved, you can call those tools through natural language commands.

### How is MCP different from JSON‑RPC?

MCP uses JSON‑RPC 2.0 as its underlying message format. JSON‑RPC defines how messages are structured (method, parameters, result, error) while MCP defines which methods are available, how to describe them and how to manage context and permissions.

### Can I expose multiple services through one MCP server?

While a single server could theoretically expose multiple unrelated services, the recommended pattern is to create one server per domain (e.g., a Git server, a weather server). This keeps implementations simple and avoids permission creep. However, you can orchestrate multiple servers from a host or through a meta‑server that aggregates their capabilities.

### Are there any limitations to using MCP servers?

MCP is still maturing. Many servers and clients are in beta, and the specification continues to evolve. You may encounter inconsistent implementations or limited support for complex data types. Always consult the latest documentation and be prepared to update your servers when the protocol changes.

### How do I troubleshoot when a tool isn’t working?

Ensure the client can connect to the server (check network connectivity and firewall rules). Verify that the tool appears in the list of capabilities and that you’ve approved it. Check server logs for errors and confirm that authentication tokens are valid. If the server returns errors, ensure you’re passing the correct parameters and that the back‑end system is reachable.


## Conclusion

The Model Context Protocol and MCP servers mark a significant step forward in connecting AI agents to the real world. By standardising how models discover and call tools, MCP reduces integration complexity, unlocks powerful agentic workflows and enables secure access to proprietary data. Whether you’re a developer automating repetitive tasks, a business integrating AI into legacy systems or a researcher exploring agentic AI, building or using an MCP server can save time and deliver richer interactions.

If you need support building an enterprise-grade MCP server, [contact us](https://hyprmcp.com/waitlist/) or check out our [Open Source MCP  Gateway](https://github.com/hyprmcp/mcp-gateway)

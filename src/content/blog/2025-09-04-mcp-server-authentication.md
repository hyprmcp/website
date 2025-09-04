---
title: 'Building Supabase-like OAuth Authentication For MCP Servers'
description: 'How to add authentication, dynamic client registration, authorization server metadata to MCP servers support without any code changes.'
publishDate: 2025-09-04
lastUpdated: 2025-09-04
slug: 'mcp-server-authentication'
authors:
  - name: 'Jakob Steiner'
    role: 'Engineer'
    image: '/src/assets/blog/authors/jakob.jpg'
    linkedIn: https://www.linkedin.com/in/jakob-steiner-46998230a/
    gitHub: https://github.com/kosmoz
image: '/src/assets/blog/mcp-server-authentication.svg'
tags:
  - mcp
  - oauth
  - mcp-gateway
---

I am Jakob, an Engineer at Hypr MCP, where we help companies connect their internal applications to LLM-based workflows with the power of MCP servers.
[Join our waitlist](/waitlist) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.
In this blog post, I want to show you how and why we built an MCP Server Gateway that acts as a reverse proxy for one or more upstream MCP servers while adding support for the authorization framework provided by the MCP specification.

## Introduction

The Model Context Protocol (MCP) has emerged as the de-facto standard way for Large Language Models (LLMs) to interact with other systems.
First released in November 2024, it gained traction very quickly which led to some rapid iterations in the months that followed.
One of the most anticipated additions to the specification, which was added in March 2025, was support for authorization when offering an MCP server remotely via HTTP.
The MCP authorization framework is built on top of the well-established OAuth2 authorization standard, specifically the currently in-progress draft version 2.1, additionally requiring identity providers (IdPs) to implement the Authorization Server Metadata (ASM) and Dynamic Client Registration (DCR) optional extensions.
In June 2025, the specification was further revised to also require MCP servers to act as OAuth2 compatible Protected Resource Servers (PRS), another optional extension.

In a nutshell, the protocol requires the client to first discover the authorization server URI by querying the PRS endpoint and the DCR and authorization endpoints by querying the authorization server's ASM endpoint.
It must then create an OAuth2 client using the DCR protocol and use that client to perform a regular OAuth2 authorization flow.

### Comparing authentication providers for MCP servers

This is a well-thought-through authorization framework, as, theoretically, it does not require implementers to add anything that is not part of the OAuth2 specification, while also allowing to authorize MCP clients without any OAuth2 client configuration.
In practice though, we discovered that actually implementing this framework is not as straight-forward as it might seem at first glance, for several reasons:

1. Most existing authorization infrastructure is built on Open ID Connect (OIDC), rather than OAuth2.
   In a lot of cases, this does not matter, since OIDC is itself an extension of OAuth2.
   However, the MCP authorization framework requires the aforementioned ASM extension which OIDC includes in a slightly incompatible way.
   In principle, an IdP can implement both OAuth2 and OIDC ASM, but most we found do not.
2. There have not been many legitimate use-cases for DCR before the advent of the MCP.
   Therefore, support for it among IdP software is very sparse.

An honorable mention at this point is deserved by Keycloak, which does implement both the ASM and DCR extensions, however it does not allow configuration of CORS headers for the DCR endpoint which makes it incompatible with most web-based MCP client software.
Dex used to have partial support for OIDC DCR, but from what we could gather, it was never possible to enable it via configuration and has since been removed entirely.

We also looked at OAuth2-Proxy as a general inspiration, but it would have required too much additional plumbing to make it work.
Since OAuth2-Proxy is not an IdP, we wouldn't expect it to support DCR, ASM, or CORS anyway.

| Project          | GitHub Url                                                                | Dynamic Client Registration (DCR) support | Authorization Server Metadata (ASM) support | Cross-Origin Resource Sharing (CORS) support                          |
| ---------------- | ------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| OAuth2-Proxy     | [oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy) | ❌ (no)                                   | ❌ (no)                                     | ❌ (no)                                                               |
| Dex              | [dexidp/dex](https://github.com/dexidp/dex)                               | ❌ (Only via gRPC API)                    | ⚠️ (Only compatible with OIDC)              | ❌ (no)                                                               |
| Keycloak         | [keycloak/keycloak](https://github.com/keycloak/keycloak)                 | ✅ (yes)                                  | ✅ (yes)                                    | ⚠️ ([Not for DCR](https://github.com/keycloak/keycloak/issues/39629)) |
| Hypr MCP Gateway | [hyprmcp/mcp-gateway](https://github.com/hyprmcp/mcp-gateway)             | ✅ (yes)                                  | ✅ (yes)                                    | ✅ (yes)                                                              |

After discovering these issues, we made it our goal to build an easy-to-use component that would help MCP server implementers by providing everything explained in the rest of this blog post in a ready-to-use package.
Check out the https://github.com/hyprmcp/mcp-gateway/ project if you want to learn more.

## Implementation

Given these challenges with existing IdP software, we decided to build our own solution using Dex as the identity provider.
Dex is a flexible OIDC provider that, while not natively supporting all the required OAuth2 extensions, offers a GRPC API that allows us to implement the missing functionality ourselves.

For code examples in this blog post, we will use Go, which provides excellent built-in support for HTTP proxying and comes with a mature ecosystem of OAuth2 and JWT-related libraries.
Please note that these code examples are designed for the purpose of education.
As such, they do not include error handling and I/O closing in order to not distract from the essential concepts that they convey.
Furthermore, they do not contain rate-limiting, graceful shutdown, or any other requirements for a robust production system.
To keep things simple, we will use Dex with in-memory storage and static password authentication. The complete Dex configuration looks like this:

```yaml
issuer: http://localhost:5556
web:
  http: 0.0.0.0:5556
  allowedOrigins: ['*']
grpc:
  addr: 0.0.0.0:5557
storage:
  type: memory
enablePasswordDB: true
staticPasswords:
  - email: 'admin@example.com'
    # bcrypt hash of the string "password" for user admin: $(echo password | htpasswd -BinC 10 admin | cut -d: -f2)
    hash: '$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W'
    username: 'admin'
    userID: '08a8684b-db88-4b73-90a9-3cd1661f5466'
```

### Basic Reverse Proxy

Before adding any authentication-related features, it is necessary to get the basic reverse proxy part of the gateway working.
Fortunately, the Go standard library comes with the `httputil.ReverseProxy` that does exactly what we need:

```go
// This should be the parsed URL of your existing MCP server
upstream, _ := url.Parse("http://localhost:8000/mcp/")

proxy := &httputil.ReverseProxy{
	Rewrite: func(r *httputil.ProxyRequest) {
		r.Out.URL = upstream
		r.Out.Host = upstream.Host
	},
}
```

This reverse proxy implements the `http.Handler` interface, so you can simply pass it to `http.ListenAndServe`.
But since our gateway should be able to handle multiple upstreams for different request paths, we will also add a multiplexer here already:

```go
mux := http.NewServeMux()
mux.Handle("/myserver/mcp", proxy)
http.ListenAndServe(":9000", mux)
```

With this setup, it will be straightforward to build a gateway for basically as many upstream MCP servers as you want.
Also, the `httputil.ReverseProxy` is very flexible and has support for specifying your own `http.RoundTripper` to use for transport.

When using the mcp-gateway you can add proxy servers by adding them in your config file:

```yaml
proxy:
  - path: /myserver/mcp
    http:
      url: http://localhost:8000/mcp/
```

### Adding CORS

While not strictly required by the MCP specification, most web-based MCP clients require that CORS preflight checks succeed for our endpoints.
I recommend using the `github.com/go-chi/cors` to handle this.
To keep things simple for now, you can simply wrap your proxy with the `cors.AllowAll()` utility:

```go
http.ListenAndServe(":9000", cors.AllowAll().Handler(mux))
```

### OAuth2 Middleware

Adding authentication to existing MCP servers will be one of the major features of our gateway.
In order to be compliant with the specification we have to do two things:

1. Obviously we have to protect the reverse proxy endpoint by validating the OAuth2 access token.
2. The "401 Unauthorized" response additionally serves the purpose of telling the client the location of the PRS endpoint.

We can achieve this by building a HTTP middleware.
In case you are not familiar with the Go `http` package, it is probably worth noting that middlewares don't really exist as an explicit concept.
The way to build a middleware in Go is to instead create a function that takes an `http.Handler` as argument and returns a different `http.Handler` that “wraps” the one provided as argument.
Note that OAuth2 does not dictate the format of access tokens, but since our IdP is actually an OIDC issuer, we can be certain that our access tokens will be JWTs.
We will use the `github.com/lestrrat-go/jwx` suite of libraries for validating these JWTs:

```go
func OAuthProtected(next http.Handler) http.Handler {
	// See https://pkg.go.dev/github.com/lestrrat-go/jwx/v3/jwk about obtaining a jwk.Set
	var jwkSet jwk.Set

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rawToken := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(r.Header.Get("Authorization")), "Bearer"))

		if _, err := jwt.ParseString(rawToken, jwt.WithKeySet(jwkSet)); err != nil {
			w.Header().Set(
				"WWW-Authenticate",
				`Bearer resource_metadata="http://localhost:9000/.well-known/oauth-protected-resource"`,
			)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

mux.Handle("/myserver/mcp", OAuthProtected(proxy))
```

To enable authentication when using the mcp-gateway, simply add the `authorization.server` property to your config and enable authentication on your proxy entry:

```yaml
authorization:
  server: http://localhost:5556/
proxy:
  - path: /path/mcp
    http:
      url: http://localhost:8000/mcp/
    authentication:
      enabled: true
```

### Adding a Protected Resource Server Endpoint

This step is rather simple:
All we have to do to implement the specification here is to mount an endpoint for `/.well-known/oauth-protected-resource` that serves a JSON object with the `resource_name` and `authorization_servers` properties:

```go
mux.HandleFunc("/.well-known/oauth-protected-resource", func(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"resource":              "http://localhost:9000/",
		"authorization_servers": []string{"http://localhost:5556"},
	})
})
```

The `authorization_servers` property is not required by the PRS specification, but the MCP specification requires at least one authorization server so the client can query the authorization server metadata.

### Proxying The IdP's Authorization Server Metadata Endpoint

As I alluded to above, most OIDC-compliant IdPs do not implement the OAuth2 ASM extension.
However, the OAuth2 ASM specification is actually an adaptation of the OIDC Discovery mechanism.
As a result, most OIDC issuers do already provide the necessary data, just under a different well-known URI `/.well-known/openid-configuration`.
Another key insight is that the OAuth2 PRS specification does not pose any restrictions on what the server metadata for the authorization server may contain.
Particularly, the `issuer` property and all the endpoints contained in the metadata do not have to match the authorization server URI returned by the PRS endpoint.

We can use these two observations to our advantage by modifying the PRS response to advertise the gateway server itself as the authorization server and adding another endpoint at the OAuth2 ASM well-known URI that acts as a proxy for our OIDC issuer's OpenID configuration endpoint.

```go
// The updated protected resource endpoint
mux.HandleFunc("/.well-known/oauth-protected-resource", func(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"resource":              "http://localhost:9000/",
		"authorization_servers": []string{"http://localhost:9000/"},
	})
})

mux.HandleFunc("/.well-known/oauth-authorization-server", func(w http.ResponseWriter, r *http.Request) {
	// GetMetadata just fetches /.well-known/openid-configuration from the issuer
	metadata := GetMetadata()
	w.Header().Set("Content-Type", "application/json")
	w.Write(metadata)
})
```

If you want to use ASM proxying when using the mcp-gateway, set the `authorization.serverMetadataProxyEnabled` property to `true`:

```yaml
authorization:
  server: http://localhost:5556/
  serverMetadataProxyEnabled: true
```

### Adding Dynamic Client Registration

Unfortunately, most OIDC issuers do not support DCR, but we can use a similar trick to the one we used when implementing the ASM proxy endpoint above.
It is not required by the specification that the client registration endpoint URI is a child of the OAuth2 issuer URI.
So, theoretically, we can implement our own DCR endpoint and since we already proxy the ASM request, we can simply inject the URI for this endpoint into the response there.

Up until this point, everything we did is compatible with most OIDC issuers, but unfortunately there is no general way to create clients on-demand (apart from DCR).
So, we are forced to implement a solution that is specific to the Dex IdP project.
Dex supports client creation via their GRPC API, which we will call using the `google.golang.org/grpc` library and the official Dex GRPC client implementation:

```go
grpcClient, _ := grpc.NewClient("localhost:5557", grpc.WithTransportCredentials(insecure.NewCredentials()))
dexClient := api.NewDexClient(grpcClient)

type ClientInformation struct {
	ClientID              string   `json:"client_id"`
	ClientSecret          string   `json:"client_secret,omitempty"`
	ClientSecretExpiresAt int64    `json:"client_secret_expires_at,omitempty"`
	ClientName            string   `json:"client_name,omitempty"`
	RedirectURIs          []string `json:"redirect_uris"`
	LogoURI               string   `json:"logo_uri,omitempty"`
}

mux.HandleFunc("/.well-known/oauth-authorization-server", func(w http.ResponseWriter, r *http.Request) {
	// GetMetadata now also parses the metadata as a map[string]any
	metadata := GetMetadata()
	metadata["registration_endpoint"] = "http://localhost:9000/oauth/register"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metadata)
})

mux.HandleFunc("/oauth/register", func(w http.ResponseWriter, r *http.Request) {
	var body ClientInformation
	json.NewDecoder(r.Body).Decode(&body)

	client := api.Client{
		Id:           rand.Text(),
		Name:         body.ClientName,
		LogoUrl:      body.LogoURI,
		RedirectUris: body.RedirectURIs,
		Public:       true,
	}

	clientResponse, _ := dexClient.CreateClient(r.Context(), &api.CreateClientReq{Client: &client})

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ClientInformation{
		ClientID:     clientResponse.Client.Id,
		ClientSecret: clientResponse.Client.Secret,
		ClientName:   clientResponse.Client.Name,
		RedirectURIs: clientResponse.Client.RedirectUris,
		LogoURI:      clientResponse.Client.LogoUrl,
	})
})
```

Note that the `ClientSecret` has the `omitempty` tag set.
This is necessary because an empty value will otherwise be serialized as an empty string, which confuses some clients.

DCR can be enabled for the mcp-gateway by setting `authorization.dynamicClientRegistration.enabled` to `true`.
Additionally, you have to specify the `dexGRPCClient.addr` property.

```yaml
authorization:
  server: http://localhost:5556/
  dynamicClientRegistration:
    enabled: true
    publicClient: true
dexGRPCClient:
  addr: localhost:5557
```

### Injecting Required Scopes In The Authorization Request

Some clients, for example, Claude Code, do not set any scopes when sending the authorization request.
While this is not generally a problem, it can cause issues if your IdP is particularly strict about following the OIDC specification, which requires the `openid` scope to be present.
To prevent this, we can create a custom authorization endpoint that redirects the request to the authorization endpoint with the required scopes injected.

```go
mux.HandleFunc("/.well-known/oauth-authorization-server", func(w http.ResponseWriter, r *http.Request) {
	// GetMetadata now also parses the metadata as a map[string]any
	metadata := GetMetadata()
	metadata["registration_endpoint"] = "http://localhost:9000/oauth/register"
	metadata["authorization_endpoint"] = "http://localhost:9000/oauth/authorize"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metadata)
})

mux.HandleFunc("/oauth/authorize", func(w http.ResponseWriter, r *http.Request) {
  metadata := GetMetadata()
  redirectURI, _ := url.Parse(metadata["authorization_endpoint"].(string))
  q := r.URL.Query()
  if s := q.Get("scope"); !strings.Contains(s, "openid") {
    q.Set("scope", s+" openid")
  }
  redirectURI.RawQuery = q.Encode()
  http.Redirect(w, r, redirectURI.String(), http.StatusFound)
})
```

You can do the same for any scopes your MCP server requires, although you may want to check if the scope is supported by your authorization server.
Our mcp-gateway already does all of this for you and you can enable the authorization endpoint by setting `authorization.authorizationProxyEnabled` to `true` in the configuration file.

```yaml
authorization:
  authorizationProxyEnabled: true
```

## Testing Authentication for MCP Servers

Using the JWT from the request to perform actions as the user is a functionality that MCP servers must implement themselves.
We also wanted to create an MCP server for end-to-end testing.

In order to do so, we created a simple MCP called "MCP, Who am I?", which we also open-sourced on GitHub: https://github.com/hyprmcp/mcp-who-am-i/

It reports auth information about the current request.
It parses the Authorization header as a JWT and reports some decoded payload items from the JWT.
The name is inspired by the whoami coreutils package.

We also created a step-by-step walkthrough on how to use the Hypr MCP Gateway in combination with the "MCP, Who am I?" MCP server.

You can find a [README.md](https://github.com/hyprmcp/mcp-gateway/blob/main/examples/who-am-i/README.md) in the [examples directory](https://github.com/hyprmcp/mcp-gateway/tree/main/examples/who-am-i) of the MCP Gateway.

## Additional Problems

While building and testing the mcp-gateway, we stumbled upon some issues that I think are worth noting.

### Undocumented Client Behavior

Although the OAuth2 and MCP specifications are quite thorough, there is still some wiggle room when it comes to dynamic client registration.
In particular, the MCP specification does not state whether clients should be public or private.
A public OAuth2 client has only a client ID, while a private client has a client ID and client secret.
We initially created private clients but realized after some troubleshooting that the MCP client implementation in Visual Studio Code silently drops the client secret from all requests.
Conversely, the official MCP Inspector tool was not able to authenticate with a public client due to a bug which has since been fixed.

### Client Persistence

The clients created via DCR are stored in Dex's storage mechanism.
If an ephemeral storage mechanism is used, this means that the clients do not survive a Dex restart.
When that happens or a client becomes invalid for other reasons, trying to authenticate with it will lead to an error response.
Unfortunately, some client implementations do not handle this error appropriately, requiring manual user action to reset the client configuration.
In Visual Studio Code, this can be achieved with the `Authentication: Remove Dynamic Authentication Providers` action.

## Conclusion

In this blog post, we demonstrated that it is possible to add authentication to an existing MCP server by proxying through a custom MCP server gateway.
While lacking support for some OAuth2 extensions required additional implementation effort, we hope that with growing adoption of MCP servers, implementers of IdP software will step up and implement the parts that are missing.

If you are looking for a battle-tested, batteries-included MCP server gateway, check out our https://github.com/hyprmcp/mcp-gateway, which implements everything we discussed above, and more.

[Join our waitlist](/waitlist) or [book a demo](https://cal.glasskube.com/team/hyprmcp/demo) to learn more.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Documentation

Documentation is written in MDX format, allowing you to use React components alongside Markdown content.
After every sentence, a new line is added to ensure proper formatting and readability.

## SEO Guidelines

When writing page titles and descriptions, follow these SEO best practices:

- **Page titles**: Maximum 60 characters to avoid truncation in search results
- **Meta descriptions**: Maximum 160 characters to avoid truncation in search results
- Include relevant keywords like "MCP", "Model Context Protocol", "serverless", "Hypr MCP"
- Make titles and descriptions unique for each page
- Focus on user intent and value proposition
- Include action words like "Deploy", "Learn", "Get Started"

## Component Overrides

To override Starlight theme components:

1. Find the original component in `node_modules/@astrojs/starlight/components/`
2. Copy the component to `src/components/overwrites/`
3. Add the component reference to the `components` object in `astro.config.mjs`
4. Example: `PageTitle: './src/components/overwrites/PageTitle.astro'`

Available Starlight components can be found in:

- `node_modules/@astrojs/starlight/components/` - All base components
- Key components: `Page.astro`, `PageTitle.astro`, `ContentPanel.astro`, `Header.astro`, `Footer.astro`, `Hero.astro`, `Sidebar.astro`, etc.

## Images

When generating images use the cyberpunk style and always create svgs with animations.

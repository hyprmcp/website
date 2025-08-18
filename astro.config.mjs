// @ts-check
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  site: 'https://jetski.sh',

  integrations: [
    starlight({
      title: 'jetski',
      description:
        'Serverless hosting and analytics provider for remote, authenticated streamable HTTP MCP server',
      logo: {
        light: './src/assets/jetski-black.svg',
        dark: './src/assets/jetski-white.svg',
        replacesTitle: true,
      },
      customCss: ['./src/styles/global.css'],
      editLink: {
        baseUrl: 'https://github.com/jetski-sh/website/tree/main',
      },
      components: {
        // Components can be overwritten here
        PageTitle: './src/components/overwrites/PageTitle.astro',
        ContentPanel: './src/components/overwrites/ContentPanel.astro',
        Footer: './src/components/overwrites/Footer.astro',
        SocialIcons: './src/components/overwrites/SocialIcons.astro',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/jetski-sh/jetski',
        },
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/6qqBSAWZfW',
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          autogenerate: {directory: 'docs/getting-started'},
        },
        // Not yet documented
        // {
        //   label: 'Platform',
        //   autogenerate: {directory: 'docs/platform'},
        // },
        // {
        //   label: 'MCP Authentication',
        //   autogenerate: {directory: 'docs/authentication'},
        // },
        {
          label: 'Navbar',
          items: [
            {label: 'Home', link: '/'},
            {label: 'Pricing', link: '/pricing/'},
            {label: 'Docs', link: '/docs/getting-started/'},
          ],
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      prerender: true,
      plugins: [
        starlightLinksValidator(),
        starlightUtils({
          navLinks: {
            leading: {useSidebarLabelled: 'Navbar'},
          },
        }),
      ],
    }),
    sitemap({
      filter: page => {
        // Exclude specific pages by slug
        const excludedSlugs = ['ai-integration', 'mcp-analytics', 'remote-mcp'];
        const url = new URL(page);
        const pathname = url.pathname;

        // Check if the pathname contains any of the excluded slugs
        return !excludedSlugs.some(slug => pathname.includes(slug));
      },
    }),
  ],
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
    rehypePlugins: [rehypeMermaid],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    '/docs/': '/docs/getting-started/',
  },
});

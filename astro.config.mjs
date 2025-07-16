// @ts-check
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import rehypeMermaid from "rehype-mermaid";

// https://astro.build/config
export default defineConfig({
  site: 'https://jetski.sh',

  integrations: [
    starlight({
      title: 'Jetski',
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
        {
          label: 'Navbar',
          items: [
            {label: 'Home', link: '/'},
            {label: 'Docs', link: '/docs/getting-started/'},
            {label: 'Pricing', link: '/pricing'},
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
});

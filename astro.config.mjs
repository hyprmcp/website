// @ts-check
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';

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
        PageTitle: './src/components/PageTitle.astro',
        ContentPanel: './src/components/ContentPanel.astro',
        Footer: './src/components/Footer.astro',
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
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            {label: 'Example Guide', slug: 'docs/guides/example'},
          ],
        },
        {
          label: 'Reference',
          autogenerate: {directory: 'docs/reference'},
        },
        {
          label: 'Navbar',
          items: [
            {label: 'Home', link: '/'},
            {label: 'Docs', link: '/docs/guides/example/'},
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
  vite: {
    plugins: [tailwindcss()],
  },
});

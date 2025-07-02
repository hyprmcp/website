// @ts-check
import starlight from '@astrojs/starlight';
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
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      prerender: true,
      plugins: [starlightLinksValidator()],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

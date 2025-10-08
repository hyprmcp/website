// @ts-check
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import starlightLinksValidator from 'starlight-links-validator';

import partytown from '@astrojs/partytown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  site: 'https://hyprmcp.com',
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
    rehypePlugins: [
      rehypeMermaid,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          content: {
            type: 'text',
            value: '# ',
          },
          headingProperties: {
            className: ['anchor'],
          },
          properties: {
            className: ['anchor-link'],
          },
        },
      ],
    ],
    remarkPlugins: [],
  },
  integrations: [
    starlight({
      title: 'Hypr MCP',
      description:
        'Serverless hosting and analytics provider for remote, authenticated streamable HTTP MCP server',
      logo: {
        light: './src/assets/mc-dark.svg',
        dark: './src/assets/mc-light.svg',
        replacesTitle: true,
      },
      customCss: ['./src/styles/global.css'],
      editLink: {
        baseUrl: 'https://github.com/hyprmcp/website/tree/main',
      },
      components: {
        // Components can be overwritten here
        PageTitle: './src/components/overwrites/PageTitle.astro',
        ContentPanel: './src/components/overwrites/ContentPanel.astro',
        Footer: './src/components/overwrites/Footer.astro',
        SocialIcons: './src/components/overwrites/SocialIcons.astro',
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://p.glasskube.eu',
          },
        },
        {
          tag: 'script',
          content: `
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Re Ms Fs Pe Rs Cs capture Ve calculateEventProperties Ds register register_once register_for_session unregister unregister_for_session zs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Ls As createPersonProfile Ns Is Us opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing is_capturing clear_opt_in_out_capturing Os debug I js getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('phc_DOoQWir3QQWS19919Zi2KwaQ4N0w6DP6dqR0K5ycaCt', {
            api_host: 'https://p.glasskube.eu',
            ui_host: 'https://eu.posthog.com',
            defaults: '2025-05-24',
            person_profiles: 'always',
            session_recording: {maskAllInputs: false}
          })
          `,
        },
        {
          tag: 'script',
          attrs: {
            // type: 'text/partytown',
          },
          content: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://hyprmcp.com/ggg/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-MM92PXX4');`,
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/hyprmcp/mcp-gateway',
        },
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/CgZ775fcsy',
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          autogenerate: {directory: 'docs/getting-started'},
        },
        {
          label: 'Self-hosting',
          autogenerate: {directory: 'docs/self-hosting'},
        },
        {
          label: 'Navbar',
          items: [
            {label: 'Home', link: '/'},
            {label: 'Pricing', link: '/pricing/'},
            {label: 'Docs', link: '/docs/getting-started/'},
            {label: 'Blog', link: '/blog/'},
          ],
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      prerender: true,
      plugins: [
        starlightLinksValidator({
          exclude: ['/blog/mcp-server-authentication/', '/mcp-analytics/'],
        }),
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
        const excludedSlugs = [
          'ai-integration',
          'mcp-analytics',
          // 'mcp-install',
          'remote-mcp',
        ];
        const url = new URL(page);
        const pathname = url.pathname;

        // Check if the pathname contains any of the excluded slugs
        return !excludedSlugs.some(slug => pathname.includes(slug));
      },
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
        resolveUrl: (url, location, type) => {
          if (
            url.host === 'www.redditstatic.com' &&
            !url.pathname.startsWith('/ggr/')
          ) {
            url.host = 'hyprmcp.com';
            url.hostname = url.host;
            url.pathname = '/ggr' + url.pathname;
            return url;
          }

          return url;
        },
      },
    }),
  ],
  prefetch: {
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    '/docs/': '/docs/getting-started/',
  },
});

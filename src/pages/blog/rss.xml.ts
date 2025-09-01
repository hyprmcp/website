import rss from '@astrojs/rss';
import type {APIContext} from 'astro';
import {getSortedPosts} from '~/utils/blog';

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();

  return rss({
    title: 'Hypr MCP Blog',
    description:
      'Latest updates, tutorials, and insights about MCP servers and serverless hosting',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description || '',
      pubDate: post.data.publishDate,
      link: new URL(`/blog/${post.data.slug}/`, context.site!).toString(),
    })),
    customData: `<language>en-us</language>`,
  });
}

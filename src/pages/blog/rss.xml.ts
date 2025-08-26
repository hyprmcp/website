import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';

export async function GET(context: APIContext) {
  const posts = await fetchPosts();

  return rss({
    title: 'Hypr MCP Blog',
    description: 'Latest updates, tutorials, and insights about MCP servers and serverless hosting',
    site: context.site!.toString(),
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || '',
      pubDate: post.publishDate,
      link: getPermalink(post.id, 'post'),
    })),
    customData: `<language>en-us</language>`,
  });
}

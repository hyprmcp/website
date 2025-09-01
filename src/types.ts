import type {RenderedContent} from 'astro:content';
import type {BlogPostConfig} from '~/content.config.ts';

export interface Post {
  data: BlogPostConfig;
  rendered: RenderedContent;
}

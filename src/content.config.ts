import {docsLoader} from '@astrojs/starlight/loaders';
import {docsSchema} from '@astrojs/starlight/schema';
import {glob} from 'astro/loaders';
import {defineCollection, z} from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
  post: defineCollection({
    loader: glob({pattern: ['*.md', '*.mdx'], base: 'src/content/blog'}),
    schema: ({image}) =>
      z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        updateDate: z.coerce.date(),
        slug: z.string(),
        author: z.string(),
        image: image().optional(),
      }),
  }),
};

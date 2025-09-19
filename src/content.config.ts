import {docsLoader} from '@astrojs/starlight/loaders';
import {docsSchema} from '@astrojs/starlight/schema';
import {glob} from 'astro/loaders';
import {defineCollection, z} from 'astro:content';
import {HeadConfigSchema} from './../node_modules/@astrojs/starlight/schemas/head.ts';

export const BlogPostConfigSchema = ({image}) =>
  z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    lastUpdated: z.coerce.date(),
    slug: z.string(),
    authors: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        image: image(),
        linkedIn: z.string(),
        gitHub: z.string(),
      }),
    ),
    image: image(),
    tags: z.array(z.string()),
    head: HeadConfigSchema(),
  });

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
  blog: defineCollection({
    loader: glob({pattern:  "**/*.{md,mdx}", base: 'src/content/blog'}),
    schema: BlogPostConfigSchema,
  }),
};

export type BlogPostConfig = z.output<ReturnType<typeof BlogPostConfigSchema>>;

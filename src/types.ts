import {type CollectionEntry} from 'astro:content';

export interface Post extends CollectionEntry<'post'> {
  title: string;
  description: string;
  publishDate: string;
  updateDate: string;
  slug: string;
  author: string;
  image: ImageMetadata;
}

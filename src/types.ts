import type {RenderedContent} from 'astro:content';

export interface Post {
  id: string;
  data: PostData;
  body: string;
  rendered: RenderedContent;
}

export interface PostData {
  title: string;
  description: string;
  publishDate: Date;
  updateDate: Date;
  slug: string;
  author: string;
  image: ImageMetadata;
  tags: string[];
}

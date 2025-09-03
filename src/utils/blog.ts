import {getCollection, type RenderedContent} from 'astro:content';
import type {BlogPostConfig} from '~/content.config.ts';
import type {Post} from '~/types.ts';

const load = async function (): Promise<Array<Post>> {
  return (await getCollection('blog'))
    .map(
      post =>
        ({
          data: post.data as BlogPostConfig,
          rendered: post.rendered! as RenderedContent,
        }) as Post,
    )
    .sort((a, b) => {
      const dateA = a.data.publishDate
        ? new Date(a.data.publishDate).valueOf()
        : 0;
      const dateB = b.data.publishDate
        ? new Date(b.data.publishDate).valueOf()
        : 0;
      return dateB - dateA;
    });
};

let _posts: Array<Post>;

export const getSortedPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

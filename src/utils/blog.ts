import {getCollection, type RenderedContent} from 'astro:content';
import type {Post, PostData} from '~/types.ts';

const load = async function (): Promise<Array<Post>> {
  return (await getCollection('blog'))
    .map(
      post =>
        ({
          data: post.data as PostData,
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

export const getPostBySlug = async (
  slug: string,
): Promise<Post | undefined> => {
  return (await getSortedPosts()).find(p => slug === p.data.slug);
};

export const getRelatedPosts = async (
  originalPost: Post,
  maxResults: number = 4,
): Promise<Array<Post>> => {
  const allPosts = await getSortedPosts();
  const originalTags = originalPost.tags || [];

  if (originalTags.length === 0) {
    return allPosts
      .filter(post => post.id !== originalPost.id)
      .slice(0, maxResults);
  }

  // Calculate similarity score based on shared tags
  const postsWithScores = allPosts
    .filter(post => post.id !== originalPost.id)
    .map(post => {
      const postTags = post.tags || [];
      const sharedTags = originalTags.filter(tag => postTags.includes(tag));
      return {
        post,
        score: sharedTags.length,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const relatedPosts = postsWithScores
    .slice(0, maxResults)
    .map(item => item.post);

  // Fill remaining slots with recent posts if needed
  if (relatedPosts.length < maxResults) {
    const remainingSlots = maxResults - relatedPosts.length;
    const recentPosts = allPosts
      .filter(
        post =>
          post.id !== originalPost.id &&
          !relatedPosts.some(rp => rp.id === post.id),
      )
      .slice(0, remainingSlots);

    relatedPosts.push(...recentPosts);
  }

  return relatedPosts;
};

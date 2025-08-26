import type {CollectionEntry} from 'astro:content';
import {getCollection, render} from 'astro:content';
import type {Post} from '~/types.ts';

const getNormalizedPost = async (
  post: CollectionEntry<'post'>,
): Promise<Post> => {
  const {id, slug, collection, data, body} = post;
  const {Content, remarkPluginFrontmatter} = await render(post);

  return {
    id,
    slug,
    collection,
    data,
    body,
    slug,
    readingTime: remarkPluginFrontmatter?.readingTime,
    publishDate: data.publishDate,
    title: data.title,
    excerpt: data.excerpt,
    image: data.image,
    category: data.category,
    tags: data.tags,
    author: data.author,
  };
};

const load = async function (): Promise<Array<Post>> {
  const posts = await getCollection('post');
  const normalizedPosts = posts.map(
    async post => await getNormalizedPost(post),
  );

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).valueOf() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).valueOf() : 0;
      return dateB - dateA;
    })
    .filter(post => !post.data.draft);

  return results;
};

let _posts: Array<Post>;

export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

export const getRelatedPosts = async (
  originalPost: Post,
  maxResults: number = 4,
): Promise<Array<Post>> => {
  const allPosts = await fetchPosts();
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

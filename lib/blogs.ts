import blogsData from "../data/blogs.json";
import type { BlogPost, BlogListItem } from "./blog-types";

/* ------------------------------------------------------------------ */
/*  Blog posts — static, read from data/blogs.json.                    */
/*  To add or edit a post, change that file and redeploy.              */
/* ------------------------------------------------------------------ */

function normalizeStatus(status: unknown): "draft" | "published" {
  return String(status).toLowerCase() === "published" ? "published" : "draft";
}

function normalizePost(post: any): BlogPost {
  const rawContent = Array.isArray(post.content)
    ? post.content
    : JSON.parse(post.content ?? "[]");
  return {
    ...post,
    content: rawContent,
    status: normalizeStatus(post.status),
    date: post.date ?? "",
    readTime: post.readTime ?? "",
    excerpt: post.excerpt ?? "",
    image: post.image ?? "",
    tag: post.tag ?? "",
    createdAt: post.createdAt ?? "",
    updatedAt: post.updatedAt ?? "",
    description: post.description ?? undefined,
    category: post.category ?? undefined,
    tags: post.tags ?? undefined,
    seoTitle: post.seoTitle ?? undefined,
    seoDescription: post.seoDescription ?? undefined,
    publishedAt: post.publishedAt ?? undefined,
  };
}

const ALL_POSTS: BlogPost[] = (blogsData as unknown[]).map(normalizePost);

function toListItem(post: BlogPost): BlogListItem {
  const { content: _content, ...rest } = post;
  return rest;
}

/** Get all blog list items (summary, no content), newest first */
export async function getAllBlogs(
  includeDrafts = false
): Promise<BlogListItem[]> {
  return ALL_POSTS.filter((post) => includeDrafts || post.status === "published")
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
    .map(toListItem);
}

/** Get a single blog post by slug */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  return ALL_POSTS.find((post) => post.slug === slug) ?? null;
}

/** Get published blogs for the public listing */
export async function getPublishedBlogs(): Promise<BlogListItem[]> {
  return getAllBlogs(false);
}

import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/data/blog";
import { BlogPostPage } from "@/components/web/BlogPostPage";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ id: post.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const post = BLOG_POSTS.find((p) => p.id === params.id);
  if (!post) return {};
  return {
    title: `${post.title} | 김민영`,
    description: post.excerpt,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const post = BLOG_POSTS.find((p) => p.id === params.id);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}

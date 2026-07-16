import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { BlogPostPage } from "@/components/web/BlogPostPage";
import { BlogPostBody } from "@/components/web/BlogPostBody";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ id: post.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const post = getPost(params.id);
  if (!post) return {};
  return {
    title: `${post.title} | 김민영`,
    description: post.excerpt,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const post = getPost(params.id);
  if (!post) notFound();
  return (
    <BlogPostPage>
      <BlogPostBody post={post} />
    </BlogPostPage>
  );
}

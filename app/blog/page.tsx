import { BlogListPage } from "@/components/web/BlogListPage";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "블로그 | 김민영",
  description: "프로젝트를 만들며 정리한 기술 노트와 회고를 기록하는 공간이에요.",
};

export default function Page() {
  return <BlogListPage posts={getAllPosts()} />;
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/data/blog";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function readPost(id: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${id}.md`), "utf-8");
  const { data, content } = matter(raw);
  return {
    id,
    title: data.title,
    category: data.category,
    date: data.date,
    excerpt: data.excerpt,
    order: data.order ?? 0,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  const ids = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
  return ids.map(readPost).sort((a, b) => a.order - b.order);
}

export function getPost(id: string): BlogPost | undefined {
  try {
    return readPost(id);
  } catch {
    return undefined;
  }
}

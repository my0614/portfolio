export type BlogCategory = "mlops" | "vision" | "llm" | "retro";

export const BLOG_CATEGORIES: { key: BlogCategory; label: string }[] = [
  { key: "mlops", label: "MLOps · 인프라" },
  { key: "vision", label: "Computer Vision" },
  { key: "llm", label: "LLM · RAG" },
  { key: "retro", label: "회고" },
];

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  date: string;
  link?: string;
};

export const BLOG_POSTS: BlogPost[] = [];

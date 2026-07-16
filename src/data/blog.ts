export type BlogCategory = "mlops" | "vision" | "llm" | "study";

export const BLOG_CATEGORIES: { key: BlogCategory; label: string }[] = [
  { key: "mlops", label: "MLOps · 인프라" },
  { key: "vision", label: "Computer Vision" },
  { key: "llm", label: "LLM · RAG" },
  { key: "study", label: "스터디" },
];

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory;
  date: string;
  excerpt: string;
  order: number;
  content: string;
};

export type BlogCategory = "infra" | "security" | "mlops" | "vision" | "llm" | "study";

export const BLOG_CATEGORIES: { key: BlogCategory; label: string }[] = [
  { key: "infra", label: "인프라" },
  { key: "security", label: "보안" },
  { key: "mlops", label: "MLOps" },
  { key: "vision", label: "Computer Vision" },
  { key: "llm", label: "LLM · RAG" },
  { key: "study", label: "스터디" },
];

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  order: number;
  featured: boolean;
  content: string;
};

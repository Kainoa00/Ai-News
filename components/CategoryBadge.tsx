import type { ArticleCategory } from "@/types/article";

interface Props {
  category: ArticleCategory;
  size?: "sm" | "md" | "lg";
}

// BYU-themed category colors — readable on both dark and light backgrounds
const CATEGORY_STYLES: Record<ArticleCategory, string> = {
  Research:
    "text-blue-300 dark:text-blue-300 bg-blue-900/40 border border-blue-700/50",
  Products:
    "text-emerald-300 dark:text-emerald-300 bg-emerald-900/40 border border-emerald-700/50",
  Policy:
    "text-amber-300 dark:text-amber-300 bg-amber-900/40 border border-amber-700/50",
  Models:
    "text-violet-300 dark:text-violet-300 bg-violet-900/40 border border-violet-700/50",
  Applications:
    "text-orange-300 dark:text-orange-300 bg-orange-900/40 border border-orange-700/50",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-xs px-2.5 py-1",
};

export default function CategoryBadge({ category, size = "md" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded font-bold tracking-widest uppercase font-sans ${CATEGORY_STYLES[category]} ${SIZE_CLASSES[size]}`}
    >
      {category}
    </span>
  );
}

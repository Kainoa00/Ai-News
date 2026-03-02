import type { ArticleCategory } from "@/types/article";
import { CATEGORY_COLORS } from "@/types/article";

interface Props {
  category: ArticleCategory;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function CategoryBadge({ category, size = "md" }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full font-semibold tracking-wide uppercase text-white ${CATEGORY_COLORS[category]} ${SIZE_CLASSES[size]}`}>
      {category}
    </span>
  );
}

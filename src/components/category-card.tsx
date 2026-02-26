import Link from "next/link";
import { BookOpen, FolderOpen, ArrowRight } from "lucide-react";

type CategoryCardProps = {
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  postCount: number;
  subCount: number;
};

export function CategoryCard({
  slug,
  title,
  description,
  imageUrl,
  postCount,
  subCount,
}: CategoryCardProps) {
  const isGradient = imageUrl?.startsWith("linear-gradient");

  return (
    <Link
      href={`/kategorie/${slug}`}
      className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
    >
      {/* Background */}
      {imageUrl ? (
        isGradient ? (
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ background: imageUrl }}
          />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        )
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/80 to-primary/40" />
      )}

      {/* Overlay — darkens more on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50" />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top: Badge */}
        <div className="flex items-center gap-2">
          {subCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[11px] font-medium">
              {subCount} Themen
            </span>
          )}
        </div>

        {/* Bottom: Info */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>

          {description && (
            <p className="text-white/75 text-sm line-clamp-2 mb-3 group-hover:text-white/90 transition-colors duration-300">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {postCount} {postCount === 1 ? "Beitrag" : "Beiträge"}
              </span>
              {subCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {subCount} Unterkategorien
                </span>
              )}
            </div>

            {/* Arrow — slides in on hover */}
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

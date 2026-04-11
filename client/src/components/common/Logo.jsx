import { Leaf } from "lucide-react";
import { brandName } from "@/constants/global";

/**
 * Text wordmark + small leaf mark (no image asset). Uses `brandName` from constants.
 */
const Logo = ({ className = "" }) => {
  const accent = brandName.length > 2 ? brandName.slice(-2) : "";
  const stem = accent ? brandName.slice(0, -accent.length) : brandName;

  return (
    <span
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}
      aria-label={brandName}
    >
      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 text-white shadow-sm ring-1 ring-black/5 dark:from-emerald-500 dark:to-green-800 dark:ring-white/10">
        <Leaf className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.4} aria-hidden />
      </span>
      <span className="font-bold tracking-tight text-lg sm:text-xl leading-none text-foreground">
        {stem}
        {accent ? (
          <span className="text-brandMainColor dark:text-brandSubColor">{accent}</span>
        ) : null}
      </span>
    </span>
  );
};

export default Logo;

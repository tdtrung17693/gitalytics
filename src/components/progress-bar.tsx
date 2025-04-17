import { cn } from "@/lib/utils";

interface ProgressBarProps {
  className?: string;
  percentage: number;
}
export default function ProgressBar({
  className,
  percentage,
}: ProgressBarProps) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden w-full relative">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 absolute top-0 left-0",
          className
        )}
        style={{
          width: `${percentage}%`,
        }}
      ></div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function AdminStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: AdminStatsCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 flex items-start gap-4",
        className
      )}
    >
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">
          {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "text-xs mt-1 font-medium",
              trend.value >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}٪ {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}

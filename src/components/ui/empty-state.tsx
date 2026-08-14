import { FileQuestion, type LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "./button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export function EmptyState({ 
  icon: Icon = FileQuestion, 
  title, 
  description,
  actionLabel,
  actionHref,
  actionOnClick
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-muted/10">
      <div className="bg-muted p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={buttonVariants({ variant: "default" })}>
            {actionLabel}
          </Link>
        ) : (
          <Button onClick={actionOnClick}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}

import { ReactNode } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useLoadingProgress } from '@/hooks/useLoadingProgress';

interface LoadingOverlayProps {
  open: boolean;
  title: string;
  subtitle?: string;
  accentClassName?: string;
  footerLabel?: string;
  icon?: ReactNode;
  softMax?: number;
}

export const LoadingOverlay = ({
  open,
  title,
  subtitle,
  accentClassName = 'bg-primary',
  footerLabel,
  icon,
  softMax,
}: LoadingOverlayProps) => {
  const progress = useLoadingProgress(open, softMax);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur">
      <div className="mx-6 w-full max-w-[320px] rounded-2xl border border-primary/40 bg-background/90 p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/60 bg-background">
              {icon ?? <Gamepad2 className="h-8 w-8 text-primary" />}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold uppercase tracking-widest text-primary">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
          </div>

          <div className="w-full">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${accentClassName}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {footerLabel && (
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
              {footerLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// components/users/gender-icon.tsx
'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Gender } from '@mini-erp/shared';
import { GENDER_DISPLAY_CONFIG } from '@/types/user-types';

interface GenderIconProps {
  gender?: Gender
  className?: string;
  showLabel?: boolean;
}

export function GenderIcon({ 
  gender, 
  className,
  showLabel = false 
}: GenderIconProps) {

  if (!gender || !(gender in GENDER_DISPLAY_CONFIG)) {
    return null;
  }

  const { icon: Icon, label, textColor } = GENDER_DISPLAY_CONFIG[gender];

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', textColor, className)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-default">
            <Icon className={cn('h-4 w-4', textColor, className)} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
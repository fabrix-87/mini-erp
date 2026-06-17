// components/users/gender-icon.tsx
'use client';

import { User, UserCheck, Users, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GenderType } from '@/types/user-types';

interface GenderIconProps {
  gender?: GenderType
  className?: string;
  showLabel?: boolean;
}

export function GenderIcon({ 
  gender, 
  className,
  showLabel = false 
}: GenderIconProps) {
  const config = {
    MALE: {
      icon: User,
      label: 'Uomo',
      color: 'text-blue-600 dark:text-blue-400',
    },
    FEMALE: {
      icon: UserCheck,
      label: 'Donna',
      color: 'text-pink-600 dark:text-pink-400',
    },
    OTHER: {
      icon: Users,
      label: 'Altro',
      color: 'text-purple-600 dark:text-purple-400',
    },
    PREFER_NOT_TO_SAY: {
      icon: Minus,
      label: 'Preferisco non specificare',
      color: 'text-gray-500 dark:text-gray-400',
    },
  };

  if (!gender || !(gender in config)) {
    return null;
  }

  const { icon: Icon, label, color } = config[gender];

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color, className)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-default">
            <Icon className={cn('h-4 w-4', color, className)} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
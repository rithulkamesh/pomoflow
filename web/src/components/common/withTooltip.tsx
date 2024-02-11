import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

type Props = {
  children: React.ReactNode;
  text: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
} & React.ComponentProps<typeof Tooltip>;

export const WithTooltip: React.FC<Props> = ({
  children,
  text,
  side,
  ...rest
}) => {
  return (
    <Tooltip delayDuration={150} {...rest}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  );
};

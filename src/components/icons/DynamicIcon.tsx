"use client";

import { icons } from 'lucide-react';

type IconName = keyof typeof icons;

interface DynamicIconProps {
  name: string;
  className?: string;
}

const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  const LucideIcon = icons[name as IconName];

  if (!LucideIcon) {
    // Return a default icon or null if the name is invalid
    return null; 
  }

  return <LucideIcon className={className} />;
};

export default DynamicIcon;

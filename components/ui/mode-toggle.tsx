"use client";

import { Button } from "@/components/ui/button";
import { IconPalette, IconPaletteOff } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      type="button"
      size="icon"
      className="size-12 text-zinc-800 dark:text-white hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-white/10"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <IconPalette className="size-4 text-zinc-800 dark:hidden" />
      <IconPaletteOff className="hidden size-4 text-white dark:block" />
    </Button>
  );
}

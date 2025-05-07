import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
const THEMES = {
  "vs-dark": "Dark Theme",
  light: "Light Theme",
} as const;
import { ChevronDown } from "lucide-react";

type Theme = keyof typeof THEMES;

interface ThemeSelectorProps {
  theme: Theme;
  onSelect: (theme: Theme) => void;
}

const ThemeSelector: FC<ThemeSelectorProps> = ({ theme, onSelect }) => {
  const themes = Object.entries(THEMES);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-slate-200"
            size="sm"
          >
            {THEMES[theme]}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white">
          {themes.map(([key, name]) => (
            <DropdownMenuItem
              key={key}
              className={`hover:bg-gray-800 ${
                key === theme ? "bg-gray-800" : ""
              }`}
              onClick={() => onSelect(key as Theme)}
            >
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSelector;

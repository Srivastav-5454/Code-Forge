import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Language =
  | "JavaScript"
  | "Python"
  | "C"
  | "C++";

interface LanguageSelectorProps {
  language: Language;
  onSelect: (language: Language) => void;
}

const LANGUAGE_VERSIONS = {
  JavaScript: "20",
  Python: "3.11",
  C: "13",
  "C++": "13",
};

const languages = Object.entries(LANGUAGE_VERSIONS) as [Language, string][];

const ACTIVE_COLOR = "text-blue-400";

const LanguageSelector: FC<LanguageSelectorProps> = ({
  language,
  onSelect,
}) => {
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-slate-200"
            size="sm"
          >
            {language}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white">
          {languages.map(([lang, version]) => (
            <DropdownMenuItem
              key={lang}
              className={`hover:bg-gray-800 ${
                lang === language ? "bg-gray-800" : ""
              }`}
              onClick={() => onSelect(lang)}
            >
              <span className={`${lang === language ? ACTIVE_COLOR : ""}`}>
                {lang}
              </span>
              &nbsp;
              <span className="text-gray-600 text-sm">({version})</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;

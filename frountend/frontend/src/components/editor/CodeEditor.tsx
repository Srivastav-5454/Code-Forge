import { useRef, useState, useEffect, FC } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";
import * as monaco from "monaco-editor";

const THEMES = {
  "vs-dark": "Visual Studio Dark",
  light: "Light",
} as const;

type Theme = keyof typeof THEMES;
type Language = "JavaScript" | "Python" | "C" | "C++";

interface CodeEditorProps {
  onLanguageChange: (language: Language) => void;
  onCodeChange: (code: string) => void;
  problemId: string | null | undefined;
}

const CodeEditor: FC<CodeEditorProps> = ({
  onLanguageChange,
  onCodeChange,
  problemId,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("");
  const [language, setLanguage] = useState<Language>("Python");
  const [theme, setTheme] = useState<Theme>("vs-dark");

  const CODE_SNIPPETS: Record<Language, string> = {
    JavaScript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    Python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    C: `\n#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n`,
    "C++": `\n#include <iostream>\n\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}\n`,
  };

  useEffect(() => {
    // Get the username from sessionStorage
    const username = sessionStorage.getItem("username");

    if (!username || !problemId) {
      // If username or problemId is not available, use default code snippet
      const initialCode = CODE_SNIPPETS[language];
      setValue(initialCode);
      onCodeChange(initialCode);
      return;
    }

    // Construct the key for localStorage using username, problemId, and language
    const storageKey = `${username}-code-${problemId}-${language}`;

    // Try to load the code from localStorage
    const storedCode = localStorage.getItem(storageKey);

    if (storedCode) {
      setValue(storedCode);
      onCodeChange(storedCode);
    } else {
      const initialCode = CODE_SNIPPETS[language];
      setValue(initialCode);
      onCodeChange(initialCode);
    }
  }, [language, problemId, onCodeChange]);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelectLanguage = (language: Language) => {
    setLanguage(language);
    onLanguageChange(language);
  };

  const onSelectTheme = (theme: Theme) => {
    setTheme(theme);
  };

  const handleCodeChange = (newValue: string | undefined) => {
    const valueToSave = newValue || "";
    setValue(valueToSave);
    onCodeChange(valueToSave);

    const username = sessionStorage.getItem("username");

    if (username && problemId) {
      // Save the code to localStorage with the username in the key
      const storageKey = `${username}-code-${problemId}-${language}`;
      localStorage.setItem(storageKey, valueToSave);
    }
  };

  return (
    <div className="relative flex flex-col h-screen">
      <div className="flex justify-between p-2 bg-[#2d2d2d] text-white">
        <ThemeSelector theme={theme} onSelect={onSelectTheme} />
        <LanguageSelector language={language} onSelect={onSelectLanguage} />
      </div>
      <div className="flex-1">
        <Editor
          options={{
            minimap: {
              enabled: false,
            },
          }}
          height="calc(100vh - 60px)"
          theme={theme}
          language={language.toLowerCase().replace("++", "pp")}
          onMount={onMount}
          value={value}
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

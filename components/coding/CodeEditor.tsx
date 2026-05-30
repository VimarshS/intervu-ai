"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Monaco must be dynamically imported — it is browser-only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  function handleChange(newValue: string | undefined) {
    onChange(newValue ?? "");
  }

  // Map our language names to Monaco's language identifiers
  const monacoLanguage: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    typescript: "typescript",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rust: "rust",
  };

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{ height }}
    >
      <MonacoEditor
        height="100%"
        language={monacoLanguage[language] ?? "plaintext"}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "line",
          automaticLayout: true,
          tabSize: 2,
          readOnly,
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
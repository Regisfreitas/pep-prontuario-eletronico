import { useCallback, useEffect, useRef } from 'react';

const FORMAT_COMMANDS = [
  { label: 'B', command: 'bold', title: 'Negrito' },
  { label: 'I', command: 'italic', title: 'Itálico' },
  { label: 'U', command: 'underline', title: 'Sublinhado' },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInternalChange.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onChange]);

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 bg-white">
        {FORMAT_COMMANDS.map(({ label, command, title }) => (
          <button
            key={command}
            type="button"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand(command)}
            className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200"
          >
            {label}
          </button>
        ))}
        <div className="w-px h-6 bg-slate-200 mx-2" />
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium text-medical-600 bg-medical-50 border border-medical-100 rounded-md hover:bg-medical-100 transition-colors"
        >
          Importar Exames
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="flex-1 p-6 outline-none text-slate-700 leading-relaxed overflow-y-auto min-h-[400px] prose prose-sm max-w-none"
      />
    </div>
  );
}

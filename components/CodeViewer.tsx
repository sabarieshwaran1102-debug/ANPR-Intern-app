
import React, { useState } from 'react';

interface FileContent {
  name: string;
  content: string;
  description: string;
}

interface CodeViewerProps {
  files: FileContent[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [activeFile, setActiveFile] = useState(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col gap-2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-code text-green-500"></i> Implementation Files
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFile(idx)}
              className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${
                activeFile === idx 
                  ? 'bg-green-600 border-green-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <div className="p-3 bg-slate-950/50 border-b border-slate-800">
           <p className="text-[11px] text-slate-500 leading-relaxed">
             <i className="fas fa-info-circle mr-1 text-slate-600"></i> {files[activeFile].description}
           </p>
        </div>
        <pre className="p-4 text-xs font-mono text-green-400/90 overflow-auto max-h-[500px] leading-relaxed">
          <code>{files[activeFile].content}</code>
        </pre>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
         <span className="text-[10px] text-slate-600">Language: Python 3.x</span>
         <button className="text-[10px] text-green-500 hover:underline">
           <i className="fas fa-copy mr-1"></i> Copy Buffer
         </button>
      </div>
    </div>
  );
};

export default CodeViewer;

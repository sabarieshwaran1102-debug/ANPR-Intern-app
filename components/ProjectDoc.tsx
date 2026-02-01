
import React from 'react';

interface ProjectDocProps {
  onClose: () => void;
}

const ProjectDoc: React.FC<ProjectDocProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border-t-4 border-t-green-600">
        <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">PROJECT SUBMISSION DOSSIER</h2>
            <p className="text-xs text-green-500 font-mono mt-1 uppercase tracking-widest font-bold">Topic: Classical Computer Vision ANPR System</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white border border-slate-800">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-10 space-y-10 font-sans text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <section className="md:col-span-2 space-y-6">
              <h3 className="text-green-400 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3">
                <div className="w-8 h-[1px] bg-green-500/50"></div> 01. System Architecture
              </h3>
              <p className="text-sm text-slate-400">
                This engineering workbench provides a modular interface for <strong>Automatic Number Plate Recognition (ANPR)</strong> 
                using strictly deterministic image processing. Unlike probabilistic deep learning models, this system relies on 
                observable geometric properties and statistical proximity for classification.
              </p>
              <p className="text-sm text-slate-400">
                The implementation now supports dynamic inputs including <strong>Live Webcam Feeds</strong> and <strong>Video Streams</strong>, 
                capturing high-entropy frames and processing them through the established four-stage pipeline.
              </p>
            </section>
            
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-center gap-4">
              <div className="text-center">
                <div className="text-xs font-black text-slate-500 uppercase mb-1">Status</div>
                <div className="text-green-500 font-mono text-lg">PROTOTYPE_V2</div>
              </div>
              <div className="h-[1px] bg-slate-800"></div>
              <div className="text-center">
                <div className="text-xs font-black text-slate-500 uppercase mb-1">Compiler</div>
                <div className="text-white font-mono text-sm">Python 3.10 / CV2</div>
              </div>
            </div>
          </div>

          <section className="space-y-6">
             <h3 className="text-green-400 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3">
                <div className="w-8 h-[1px] bg-green-500/50"></div> 02. Pipeline Specification
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { title: "Preprocessing", desc: "Grayscale conversion followed by Bilateral filtering to preserve edges while removing noise. CLAHE is applied for local contrast enhancement." },
                 { title: "Localization", desc: "Canny edge detection creates a binary map. Contours are filtered based on a rectangular aspect ratio (3.0-5.5) typical of global plates." },
                 { title: "Segmentation", desc: "The cropped ROI undergoes adaptive thresholding. Connected components are isolated and normalized to a 28x28 bit-depth representation." },
                 { title: "Classification", desc: "k-NN (k=3) classifier utilizes the Euclidean distance between flattened pixel vectors to identify character matches." }
               ].map((item, idx) => (
                 <div key={idx} className="p-4 bg-slate-950/50 rounded border border-slate-800 hover:border-green-500/30 transition-colors">
                   <h4 className="text-white font-black text-xs uppercase mb-2 flex items-center gap-2">
                     <span className="text-green-500">{idx + 1}.</span> {item.title}
                   </h4>
                   <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
             </div>
          </section>

          <section className="p-8 bg-green-500/5 border border-green-500/20 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <i className="fas fa-certificate text-6xl"></i>
            </div>
            <h3 className="text-green-400 font-black uppercase text-xs tracking-[0.3em] mb-4">
              Academic Compliance Statement
            </h3>
            <p className="text-xs text-slate-400 italic">
              "This project strictly adheres to the 'No Deep Learning' restriction. All feature extraction is hand-crafted 
              and the classification engine is a basic non-parametric statistical model (k-NN). The interface supports 
              static and streaming data to demonstrate versatility in real-world engineering constraints."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDoc;

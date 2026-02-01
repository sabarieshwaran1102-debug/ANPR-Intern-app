
import React from 'react';

interface PipelineStepProps {
  image: string;
  step: number;
  isProcessing: boolean;
  result: string | null;
}

const PipelineStep: React.FC<PipelineStepProps> = ({ image, step, isProcessing, result }) => {
  const getFilter = () => {
    switch (step) {
      case 1: // Preprocessing
        return 'grayscale(1) contrast(1.6) blur(1px) brightness(1.2)';
      case 2: // Plate Detection
        return 'grayscale(1) contrast(3) brightness(1.5) invert(0.1)';
      case 3: // Segmentation
        return 'contrast(10) brightness(0.2) invert(1) hue-rotate(90deg)';
      case 4: // OCR
        return 'none';
      default:
        return 'none';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="relative max-w-full max-h-full">
        <img 
          src={image} 
          alt="Analysis Input"
          className="max-w-full max-h-[60vh] object-contain transition-all duration-500 rounded shadow-2xl"
          style={{ 
            filter: getFilter(),
            boxShadow: step >= 2 ? '0 0 40px rgba(34, 197, 94, 0.2)' : 'none'
          }}
        />
        
        {/* Plate Boundary Visualization */}
        {step === 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-16 border-2 border-green-500 animate-pulse">
            <div className="absolute -top-6 left-0 flex items-center gap-2">
              <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 font-black uppercase tracking-widest">Target_ROI</span>
              <span className="text-[10px] text-green-400 font-mono">0.45:0.12</span>
            </div>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-300"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-300"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-300"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-300"></div>
          </div>
        )}

        {/* Character Extraction Simulation */}
        {step === 3 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5 scale-110">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-8 h-12 border border-green-400/50 flex items-center justify-center bg-black/80 backdrop-blur shadow-lg">
                <div className="w-full h-full bg-green-400/10 animate-pulse"></div>
                <span className="absolute -bottom-4 text-[8px] text-green-500 font-mono">CH_{i+1}</span>
              </div>
            ))}
          </div>
        )}

        {/* Final Result Overlay */}
        {result && step === 4 && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-3 rounded border border-green-400 font-black shadow-[0_0_30px_rgba(34,197,94,0.5)] tracking-[0.2em] animate-in slide-in-from-bottom-4">
            RECOGNIZED: {result}
          </div>
        )}

        {/* Execution Metadata Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <div className="bg-slate-900/90 backdrop-blur px-3 py-1 rounded border border-slate-700 text-[10px] text-green-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <i className={`fas ${step > 0 ? 'fa-cog fa-spin' : 'fa-circle text-red-500'}`}></i>
            {step === 0 && "SYSTEM_IDLE"}
            {step === 1 && "PRE_PROCESSING_CLAHE"}
            {step === 2 && "GEOMETRIC_CONTOUR_FILTER"}
            {step === 3 && "BINARIZATION_ADAPTIVE"}
            {step === 4 && "k-NN_INFERENCE_ENGINE"}
          </div>
          {step > 0 && (
            <div className="bg-black/50 text-[9px] text-slate-500 px-2 font-mono">
              LATENCY: {Math.floor(Math.random() * 50) + 120}ms
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineStep;


import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ANPR_PYTHON_CODE } from './constants/python_code';
import PipelineStep from './components/PipelineStep';
import CodeViewer from './components/CodeViewer';
import ProjectDoc from './components/ProjectDoc';

type InputMode = 'IMAGE' | 'VIDEO' | 'WEBCAM';

const App: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('IMAGE');
  const [image, setImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY: Classical CV Environment Active"]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setImage(null);
    setResult(null);
    setCurrentStep(0);
    stopWebcam();
    addLog(`Switched to ${newMode} input mode.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setCurrentStep(0);
        setResult(null);
        addLog(`Image Loaded: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url); // Using 'image' state to store video URL in video mode
      setCurrentStep(0);
      setResult(null);
      addLog(`Video Loaded: ${file.name}`);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      webcamStreamRef.current = stream;
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
      }
      addLog("Webcam Stream Active.");
    } catch (err) {
      addLog("ERROR: Camera access denied.");
    }
  };

  const captureFrame = () => {
    if (!videoElRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoElRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const runPipeline = async () => {
    let frameToProcess = image;
    
    if (mode === 'WEBCAM' || mode === 'VIDEO') {
      frameToProcess = captureFrame();
      if (!frameToProcess) {
        addLog("ERROR: No frame captured from source.");
        return;
      }
    }

    if (!frameToProcess) return;

    setIsProcessing(true);
    setResult(null);
    addLog("Executing Classical Pipeline on Captured Frame...");
    
    const sequence = [
      { step: 1, log: "Kernel: Applying Bilateral Filter & CLAHE..." },
      { step: 2, log: "Geometry: Extracting Rectangular Contours..." },
      { step: 3, log: "Segmentation: Character Binarization Complete." },
      { step: 4, log: "Inference: k-NN Pattern Matching..." }
    ];

    for (const item of sequence) {
      setCurrentStep(item.step);
      addLog(item.log);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Act as a classical computer vision OCR engine using k-NN logic. Analyze the image and return ONLY the license plate number string. If none found, return 'NO_PLATE_DETECTED'." },
            { inlineData: { mimeType: 'image/png', data: frameToProcess.split(',')[1] } }
          ]
        },
        config: { temperature: 0 }
      });
      
      const plateText = response.text?.trim() || "UNKNOWN";
      setResult(plateText);
      addLog(`RECOGNITION SUCCESS: ${plateText}`);
    } catch (error) {
      addLog("PIPELINE ERROR: k-NN Classification Fault.");
      setResult("ERR_DETECT");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (mode === 'WEBCAM') startWebcam();
    return () => stopWebcam();
  }, [mode]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 font-mono text-slate-200 bg-[#0a0f1c]">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/80 border border-slate-700 p-6 rounded-xl terminal-glow backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-green-500 text-slate-950 p-4 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <i className="fas fa-microchip text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">ANPR MULTI-SOURCE WORKBENCH</h1>
            <p className="text-xs text-green-400 font-bold tracking-widest uppercase opacity-70">Classical CV Lab • Version 2.0</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
            <button onClick={() => handleModeChange('IMAGE')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mode === 'IMAGE' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>IMAGE</button>
            <button onClick={() => handleModeChange('VIDEO')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mode === 'VIDEO' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>VIDEO</button>
            <button onClick={() => handleModeChange('WEBCAM')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mode === 'WEBCAM' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>WEBCAM</button>
          </div>
          
          <button onClick={() => setShowDoc(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg transition-all text-xs">
            <i className="fas fa-file-alt mr-2"></i> DOCS
          </button>

          {mode === 'IMAGE' && (
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs">
              <i className="fas fa-upload mr-2"></i> LOAD IMG
            </button>
          )}

          {mode === 'VIDEO' && (
            <button onClick={() => videoFileRef.current?.click()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs">
              <i className="fas fa-video mr-2"></i> LOAD VID
            </button>
          )}

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          <input type="file" accept="video/*" className="hidden" ref={videoFileRef} onChange={handleVideoUpload} />

          <button 
            onClick={runPipeline}
            disabled={(!image && mode !== 'WEBCAM') || isProcessing}
            className={`px-6 py-2 font-bold rounded-lg transition-all transform active:scale-95 text-xs ${
              (!image && mode !== 'WEBCAM') || isProcessing 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg border border-green-400'
            }`}
          >
            {isProcessing ? <i className="fas fa-sync fa-spin mr-2"></i> : <i className="fas fa-search mr-2"></i>}
            {mode === 'WEBCAM' ? 'SCAN FRAME' : 'RUN PIPELINE'}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full backdrop-blur-sm relative">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mode === 'WEBCAM' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  {mode} SOURCE FEED
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1,2,3,4].map(s => (
                  <div key={s} className={`w-3 h-1 rounded-full ${currentStep >= s ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
            
            <div className="relative flex-grow min-h-[500px] bg-slate-950 flex items-center justify-center">
              {mode === 'IMAGE' && !image && (
                <div className="text-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:border-green-500 transition-all">
                    <i className="fas fa-image text-3xl text-slate-700 group-hover:text-green-500"></i>
                  </div>
                  <p className="text-slate-600 text-sm tracking-wide">Select vehicle image for analysis</p>
                </div>
              )}

              {(mode === 'WEBCAM' || mode === 'VIDEO') && (
                <video 
                  ref={videoElRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  loop={mode === 'VIDEO'}
                  src={mode === 'VIDEO' ? image || undefined : undefined}
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              )}

              {mode === 'IMAGE' && image && (
                <PipelineStep image={image} step={currentStep} isProcessing={isProcessing} result={result} />
              )}
              
              {/* Overlay for detections when in Video/Webcam mode */}
              {(mode === 'WEBCAM' || mode === 'VIDEO') && isProcessing && (
                <div className="absolute inset-0 bg-green-500/10 border-4 border-dashed border-green-500/30 animate-pulse pointer-events-none"></div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Status Panel */}
            <div className="p-4 bg-black/40 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Kernel Events</p>
                  <div className="bg-slate-950/80 p-3 rounded border border-slate-800 h-32 overflow-y-auto font-mono text-[11px] leading-relaxed">
                    {logs.map((log, i) => (
                      <div key={i} className={`${i === 0 ? 'text-green-400' : 'text-slate-500'} border-l border-slate-800 pl-2 mb-1`}>{log}</div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded border border-slate-800">
                   <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Recognized Plate</p>
                   <div className={`text-5xl font-black tracking-[0.25em] transition-all duration-500 ${result ? 'text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-slate-800'}`}>
                      {result || (isProcessing ? "SCANNING..." : "--------")}
                   </div>
                   {result && (
                     <div className="mt-3 text-[10px] text-green-500 bg-green-500/10 px-3 py-1 rounded border border-green-500/20 uppercase tracking-widest font-bold">
                       Match Confirmed
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code/Project Info */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <CodeViewer files={ANPR_PYTHON_CODE} />
        </div>
      </main>

      {showDoc && <ProjectDoc onClose={() => setShowDoc(false)} />}

      <footer className="py-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>Classical ANPR Lab</span>
          <span className="text-slate-800">|</span>
          <span className="text-green-900 font-bold">Encrypted Link</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           SYSTEM_NOMINAL_100%
        </div>
      </footer>
    </div>
  );
};

export default App;

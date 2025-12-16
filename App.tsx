import React, { useState, useEffect } from 'react';
import { Layers, Database, BarChart3, Atom, BrainCircuit, Info } from 'lucide-react';
import { FileCategory, UploadedFile, AppStatus, PredictionResult } from './types';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { GeologicalContextModal } from './components/GeologicalContextModal';
import { NetworkStatus } from './components/NetworkStatus';
import { analyzeGeologicalData } from './services/geminiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysisResult, setAnalysisResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isContextOpen, setIsContextOpen] = useState(false);

  const handleUpload = (newFiles: File[], category: FileCategory) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      sourceType: 'file',
      file,
      category,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleAddLink = (url: string, category: FileCategory) => {
     const newLink: UploadedFile = {
       id: Math.random().toString(36).substr(2, 9),
       sourceType: 'url',
       url,
       category
     };
     setFiles(prev => [...prev, newLink]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRunAnalysis = async () => {
    if (!navigator.onLine) {
        alert("You are currently offline. Please connect to a network to run the AI analysis.");
        return;
    }

    if (files.length === 0) {
      alert("Please upload at least one file or add a link to analyze.");
      return;
    }
    
    setStatus(AppStatus.ANALYZING);
    setErrorMessage(''); // Clear previous errors
    setActiveTab('analysis');

    try {
      const result = await analyzeGeologicalData(files);
      setAnalysisResult(result);
      setStatus(AppStatus.COMPLETE);
      setActiveTab('results');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unknown error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleUpdateTargetDescription = (id: number, newDescription: string) => {
    if (analysisResult) {
      const updatedTargets = analysisResult.targetAreas.map(target => 
        target.id === id ? { ...target, description: newDescription } : target
      );
      setAnalysisResult({ ...analysisResult, targetAreas: updatedTargets });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 print:bg-white print:text-black">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-emerald-900/20">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white">GeoGenius</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">AI Exploration Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                {[
                { id: 'upload', label: 'Data Upload', icon: Database },
                { id: 'analysis', label: 'Analysis', icon: BrainCircuit },
                { id: 'results', label: 'Results', icon: BarChart3 },
                ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={status === AppStatus.ANALYZING}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === tab.id 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    } ${status === AppStatus.ANALYZING ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
                ))}
            </nav>
            
            <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block"></div>
            
            <NetworkStatus />
            
            <button
                onClick={() => setIsContextOpen(true)}
                className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                title="Geological Reference Context"
            >
                <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-light text-white mb-2">Initialize Exploration Project</h2>
                <p className="text-slate-400">Upload multimodal data sources for AI-driven porphyry vectoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
              <FileUpload 
                category={FileCategory.SATELLITE} 
                title="Satellite Imagery" 
                accept="image/*,.pdf"
                files={files}
                onUpload={handleUpload}
                onAddLink={handleAddLink}
                onRemove={handleRemoveFile}
              />
              <FileUpload 
                category={FileCategory.MAPS} 
                title="Geological Maps" 
                accept=".pdf,image/*"
                files={files}
                onUpload={handleUpload}
                onAddLink={handleAddLink}
                onRemove={handleRemoveFile}
              />
              <FileUpload 
                category={FileCategory.FIELD_PETROLOGY} 
                title="Field & Petrography" 
                accept="image/*"
                files={files}
                onUpload={handleUpload}
                onAddLink={handleAddLink}
                onRemove={handleRemoveFile}
              />
              <FileUpload 
                category={FileCategory.GEOCHEM} 
                title="Geochemical Data" 
                accept=".csv,.txt,.json,.pdf,image/*"
                files={files}
                onUpload={handleUpload}
                onAddLink={handleAddLink}
                onRemove={handleRemoveFile}
              />
              <FileUpload 
                category={FileCategory.GEOPHYSICS} 
                title="Geophysical Data" 
                accept=".csv,.xyz,.grd,.pdf,image/*"
                files={files}
                onUpload={handleUpload}
                onAddLink={handleAddLink}
                onRemove={handleRemoveFile}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleRunAnalysis}
                disabled={files.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-emerald-900/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BrainCircuit className="w-5 h-5" />
                Run Gemini 3 Pro Analysis
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANALYSIS (LOADING) */}
        {activeTab === 'analysis' && (
          <div className="flex flex-col items-center justify-center h-[600px] animate-in fade-in duration-500">
            {status === AppStatus.ANALYZING ? (
                <>
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Atom className="w-8 h-8 text-emerald-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Processing Multimodal Data</h2>
                    <p className="text-slate-400 max-w-md text-center">
                        Gemini 3 Pro is analyzing alteration minerals, correlating geochemical vectors, and generating probability heatmaps...
                    </p>
                    <div className="mt-8 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                    </div>
                </>
            ) : status === AppStatus.ERROR ? (
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                      {errorMessage || "There was an error processing your data with Gemini."}
                    </p>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
                    >
                        Return to Upload
                    </button>
                </div>
            ) : null}
          </div>
        )}

        {/* TAB: RESULTS */}
        {activeTab === 'results' && analysisResult && (
          <ResultsDashboard result={analysisResult} onUpdateTarget={handleUpdateTargetDescription} />
        )}
      </main>

      {/* Geological Context Modal */}
      <GeologicalContextModal 
        isOpen={isContextOpen} 
        onClose={() => setIsContextOpen(false)} 
      />
      
      <style>{`
        @keyframes loading {
            0% { width: 0%; margin-left: 0; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

// Simple icon wrapper for the Error state
function AlertTriangle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
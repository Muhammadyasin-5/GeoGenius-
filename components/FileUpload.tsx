import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Map as MapIcon, Image as ImageIcon, Link as LinkIcon, Plus, AlertCircle, Activity, Database, Microscope } from 'lucide-react';
import { FileCategory, UploadedFile } from '../types';

interface FileUploadProps {
  category: FileCategory;
  title: string;
  accept: string;
  files: UploadedFile[];
  onUpload: (files: File[], category: FileCategory) => void;
  onAddLink: (url: string, category: FileCategory) => void;
  onRemove: (id: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  category, 
  title, 
  accept, 
  files, 
  onUpload,
  onAddLink,
  onRemove
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidFileType = (file: File, acceptString: string) => {
    if (!acceptString) return true;
    const rules = acceptString.split(',').map(s => s.trim().toLowerCase());
    
    return rules.some(rule => {
      // Extension check (e.g. .pdf)
      if (rule.startsWith('.')) {
        return file.name.toLowerCase().endsWith(rule);
      }
      // Mime group check (e.g. image/*)
      if (rule.endsWith('/*')) {
        const group = rule.replace('/*', '');
        return file.type.startsWith(group);
      }
      // Exact mime check
      return file.type === rule;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly cast to File[] to avoid 'unknown' type inference issues with FileList
      const selectedFiles = Array.from(e.target.files) as File[];
      const validFiles = selectedFiles.filter(f => isValidFileType(f, accept));
      const invalidCount = selectedFiles.length - validFiles.length;

      if (invalidCount > 0) {
        setError(`${invalidCount} file(s) rejected. Allowed formats: ${accept.replace(/,/g, ', ')}`);
      }

      if (validFiles.length > 0) {
        onUpload(validFiles, category);
      }
    }
    // Reset value so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const validateUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const url = linkUrl.trim();
    
    if (!url) return;

    if (!validateUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com/data)");
      return;
    }

    onAddLink(url, category);
    setLinkUrl('');
    setIsLinkInputOpen(false);
  };

  const getIcon = () => {
    switch (category) {
      case FileCategory.SATELLITE: return <ImageIcon className="w-6 h-6 text-blue-400" />;
      case FileCategory.MAPS: return <MapIcon className="w-6 h-6 text-emerald-400" />;
      case FileCategory.GEOCHEM: return <FileText className="w-6 h-6 text-amber-400" />;
      case FileCategory.GEOPHYSICS: return <Activity className="w-6 h-6 text-purple-400" />;
      case FileCategory.FIELD_PETROLOGY: return <Microscope className="w-6 h-6 text-pink-400" />;
    }
  };

  const currentFiles = files.filter(f => f.category === category);

  const isDataFile = (name: string = '') => {
      const n = name.toLowerCase();
      return n.endsWith('.csv') || n.endsWith('.xyz') || n.endsWith('.grd') || n.endsWith('.json') || n.endsWith('.txt');
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col h-full relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-700/50 rounded-lg">
          {getIcon()}
        </div>
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Action Area */}
      <div 
        className={`border-2 border-dashed transition-all rounded-lg p-4 flex flex-col items-center justify-center mb-4 group flex-1 min-h-[140px] relative overflow-hidden ${error ? 'border-red-500/30 bg-red-900/5' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-700/30'}`}
      >
        {!isLinkInputOpen ? (
          <>
            <div 
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center cursor-pointer w-full h-full justify-center"
            >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-slate-300 mb-2 transition-colors" />
                <p className="text-sm text-slate-400 group-hover:text-slate-200 text-center mb-2">
                Drop files or click to upload
                <br />
                <span className="text-[10px] text-slate-500 block mt-1 max-w-[200px] truncate" title={accept}>{accept}</span>
                </p>
            </div>
            
            <div className="flex gap-2 mt-3 z-10">
               <button 
                  onClick={() => { setError(null); setIsLinkInputOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full border border-slate-600 transition-colors"
              >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
             <form onSubmit={handleLinkSubmit} className="w-full">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Add External Resource Link</p>
                <input 
                  type="url" 
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/data"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none mb-2 placeholder:text-slate-600"
                  autoFocus
                />
                <div className="flex gap-2 justify-end w-full">
                  <button 
                    type="button"
                    onClick={() => { setIsLinkInputOpen(false); setError(null); }}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
             </form>
          </div>
        )}

        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          multiple 
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[150px] pr-2 custom-scrollbar">
        {currentFiles.map(file => (
          <div key={file.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
            <div className="flex items-center gap-2 overflow-hidden">
              {file.sourceType === 'file' && file.previewUrl ? (
                <img src={file.previewUrl} alt="preview" className="w-8 h-8 object-cover rounded" />
              ) : file.sourceType === 'url' ? (
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center shrink-0">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                </div>
              ) : (file.sourceType === 'file' && isDataFile(file.file?.name)) ? (
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
              ) : (
                <FileText className="w-6 h-6 text-slate-500 shrink-0" />
              )}
              
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-slate-300 truncate max-w-[150px]" title={file.sourceType === 'file' ? file.file?.name : file.url}>
                  {file.sourceType === 'file' ? file.file?.name : file.url}
                </span>
                {file.sourceType === 'url' && (
                  <span className="text-[10px] text-slate-500">External Link</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => onRemove(file.id)}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {currentFiles.length === 0 && (
          <p className="text-xs text-slate-600 text-center italic mt-4">No data added yet</p>
        )}
      </div>
    </div>
  );
};
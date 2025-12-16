import React, { useRef, useState, useMemo, useEffect } from 'react';
import { PredictionResult, TargetArea } from '../types';
import { Heatmap } from './Heatmap';
import { Download, AlertTriangle, CheckCircle, TrendingUp, Pickaxe, FileJson, Table, Printer, Share2, Image as ImageIcon, Globe, FileText, Filter, BrainCircuit, Target, Layers, Eye, EyeOff, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsDashboardProps {
  result: PredictionResult;
  onUpdateTarget: (id: number, newDescription: string) => void;
}

// Helper to extract geological tags from target description/reasoning
const getTargetTags = (target: TargetArea): string[] => {
  const text = (target.description + " " + (target.reasoning || "")).toLowerCase();
  const tags = new Set<string>();
  
  // Alteration Types
  if (text.includes('potassic') || text.includes('biotite') || text.includes('k-feldspar')) tags.add('Potassic');
  if (text.includes('phyllic') || text.includes('sericite') || text.includes('pyrite') || text.includes('qsp')) tags.add('Phyllic');
  if (text.includes('argillic') || text.includes('kaolinite') || text.includes('clay') || text.includes('alunite')) tags.add('Argillic');
  if (text.includes('propylitic') || text.includes('chlorite') || text.includes('epidote')) tags.add('Propylitic');
  if (text.includes('silicic') || text.includes('silica') || text.includes('quartz') || text.includes('stockwork')) tags.add('Silicic/Qtz');
  
  // Styles
  if (text.includes('vein')) tags.add('Veining');
  if (text.includes('breccia')) tags.add('Breccia');
  if (text.includes('fault') || text.includes('structure')) tags.add('Structural');

  if (tags.size === 0) tags.add('Unclassified');
  
  return Array.from(tags).sort();
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onUpdateTarget }) => {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  
  // Probability Filters
  const [activeFilters, setActiveFilters] = useState({
    high: true,
    medium: true,
    low: true
  });

  // Geological Signature Filters
  const [disabledTags, setDisabledTags] = useState<Set<string>>(new Set());

  // Derive all unique tags from the dataset
  const availableTags = useMemo(() => {
    const allTags = new Set<string>();
    result.targetAreas.forEach(t => {
      getTargetTags(t).forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [result.targetAreas]);
  
  // Prepare data for Pie Chart
  const mineralData = result.zones.map(z => ({
    name: z.type,
    value: parseFloat(z.area.replace('%', '')),
    color: z.color || '#94a3b8' // Default slate if no color
  }));

  const COLORS = ['#34d399', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa'];

  const getProbabilityCategory = (prob: number) => {
    if (prob >= 0.6) return 'high';
    if (prob >= 0.3) return 'medium';
    return 'low';
  };

  const toggleFilter = (key: 'high' | 'medium' | 'low') => {
    setActiveFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTag = (tag: string) => {
    setDisabledTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // Filter Targets
  const displayedTargets = useMemo(() => {
    return result.targetAreas.filter(target => {
      // 1. Check Probability
      const cat = getProbabilityCategory(target.probability);
      if (!activeFilters[cat]) return false;

      // 2. Check Tags
      // Standard filtering: Show if it matches enabled criteria.
      // Logic: It has tags [A, B]. If A is enabled OR B is enabled, show it.
      const tags = getTargetTags(target);
      const isVisibleByTag = tags.some(t => !disabledTags.has(t));
      
      return isVisibleByTag;
    });
  }, [result.targetAreas, activeFilters, disabledTags]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = "geogenius_analysis.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeoJSON = () => {
    const geoJson = {
      type: "FeatureCollection",
      properties: {
        timestamp: new Date().toISOString(),
        analysisType: "GeoGenius Porphyry/Epithermal Vectoring",
        porphyryPotential: result.porphyryPotential,
        epithermalPotential: result.epithermalPotential,
        confidenceScore: result.confidenceScore,
        alterationMinerals: result.alterationMinerals,
        zones: result.zones,
        recommendedActions: result.recommendedActions,
        reasoning: result.reasoning
      },
      features: result.targetAreas.map(target => ({
        type: "Feature",
        geometry: {
          type: "Point",
          // Mapping image coordinates (0-100) directly.
          coordinates: [target.x, target.y] 
        },
        properties: {
          id: target.id,
          probability: target.probability,
          description: target.description || "No description provided",
          reasoning: target.reasoning || "No reasoning provided",
          tags: getTargetTags(target)
        }
      }))
    };

    const dataStr = "data:application/geo+json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = "geogenius_analysis.geojson";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,ID,X,Y,Probability,Tags,Description,Reasoning\n";
    // CSV Rows
    result.targetAreas.forEach(target => {
        const desc = target.description ? target.description.replace(/"/g, '""') : "";
        const reasoning = target.reasoning ? target.reasoning.replace(/"/g, '""') : "";
        const tags = getTargetTags(target).join(';');
        const row = `${target.id},${target.x},${target.y},${target.probability},"${tags}","${desc}","${reasoning}"`;
        csvContent += row + "\n";
    });
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = "geogenius_targets.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportImage = async () => {
    if (heatmapRef.current) {
      try {
        const canvas = await html2canvas(heatmapRef.current, {
          backgroundColor: '#0f172a', // Match app background color
          scale: 2 // Higher resolution for better quality
        });
        const link = document.createElement('a');
        link.download = 'geogenius_heatmap_visualization.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Failed to export image:", error);
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text("GeoGenius Analysis Report", margin, 25);
    
    // Metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 32);
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, 36, pageWidth - margin, 36);

    // Summary
    let yPos = 50;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Executive Summary", margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text(`• Porphyry Potential: ${result.porphyryPotential}`, margin + 5, yPos);
    yPos += 7;
    doc.text(`• Epithermal Potential: ${result.epithermalPotential}`, margin + 5, yPos);
    yPos += 7;
    doc.text(`• Confidence Score: ${(result.confidenceScore * 100).toFixed(1)}%`, margin + 5, yPos);
    yPos += 15;

    // Reasoning
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Geological Reasoning", margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitReasoning = doc.splitTextToSize(result.reasoning, maxLineWidth);
    doc.text(splitReasoning, margin, yPos);
    yPos += (splitReasoning.length * 5) + 15;

    // Target Areas
    if (yPos > 250) { doc.addPage(); yPos = 30; }
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Identified Target Areas (${result.targetAreas.length})`, margin, yPos);
    yPos += 10;

    result.targetAreas.forEach((target) => {
      // Data prep
      const descText = target.description || "No description";
      const reasonText = target.reasoning ? `Reasoning: ${target.reasoning}` : "Reasoning: N/A";
      const tags = getTargetTags(target).join(', ');

      const descLines = doc.splitTextToSize(descText, maxLineWidth - 10);
      const reasonLines = doc.splitTextToSize(reasonText, maxLineWidth - 10);
      
      const cardHeight = 20 + (descLines.length * 5) + (reasonLines.length * 5) + 10;
      
      // Check page break
      if (yPos + cardHeight > 280) { doc.addPage(); yPos = 30; }
      
      // Card background
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.roundedRect(margin, yPos - 5, maxLineWidth, cardHeight, 2, 2, 'FD');

      // Title & Probability
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Target #${target.id} [${tags}]`, margin + 5, yPos + 3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Color code probability text
      const prob = (target.probability * 100).toFixed(0);
      if (target.probability > 0.7) doc.setTextColor(5, 150, 105); // Emerald 600
      else if (target.probability > 0.4) doc.setTextColor(37, 99, 235); // Blue 600
      else doc.setTextColor(100, 116, 139);
      
      doc.text(`Probability: ${prob}%`, margin + 40 + (doc.getTextWidth(`Target #${target.id} [${tags}]`)), yPos + 3);
      
      // Description
      doc.setTextColor(51, 65, 85);
      doc.text(descLines, margin + 5, yPos + 10);
      
      // Reasoning
      const reasonY = yPos + 10 + (descLines.length * 5);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont("helvetica", "italic");
      doc.text(reasonLines, margin + 5, reasonY);
      doc.setFont("helvetica", "normal");
      
      yPos += cardHeight + 5;
    });

    yPos += 10;

    // Recommendations
    if (yPos > 250) { doc.addPage(); yPos = 30; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommended Actions", margin, yPos);
    yPos += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    result.recommendedActions.forEach(action => {
      if (yPos > 270) { doc.addPage(); yPos = 30; }
      const splitAction = doc.splitTextToSize(`• ${action}`, maxLineWidth);
      doc.text(splitAction, margin, yPos);
      yPos += (splitAction.length * 5) + 3;
    });

    doc.save("geogenius_report.pdf");
  };

  return (
    <div className="space-y-6 animate-fade-in print:space-y-4">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <div className={`p-4 rounded-xl border border-slate-700 ${result.porphyryPotential === 'High' || result.porphyryPotential === 'Very High' ? 'bg-emerald-900/20' : 'bg-slate-800/50'} print:border-slate-300 print:bg-white`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg print:bg-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-400 print:text-emerald-700" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium print:text-slate-600">Porphyry Potential</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100 print:text-black">{result.porphyryPotential}</p>
        </div>

        <div className={`p-4 rounded-xl border border-slate-700 ${result.epithermalPotential === 'High' ? 'bg-blue-900/20' : 'bg-slate-800/50'} print:border-slate-300 print:bg-white`}>
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg print:bg-blue-100">
              <TrendingUp className="w-5 h-5 text-blue-400 print:text-blue-700" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium print:text-slate-600">Epithermal Potential</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100 print:text-black">{result.epithermalPotential}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 print:border-slate-300 print:bg-white">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg print:bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-400 print:text-amber-700" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium print:text-slate-600">AI Confidence</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100 print:text-black">{(result.confidenceScore * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px] print:block print:h-auto">
        
        {/* Main Visualization Panel (Heatmap) */}
        <div ref={heatmapRef} className="lg:col-span-2 bg-slate-800/30 border border-slate-700 rounded-xl p-6 flex flex-col print:mb-6 print:border-slate-300 print:bg-white shadow-xl">
          <div className="flex flex-col mb-4 gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-200 print:text-black flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Integrated Target Heatmap
                </h3>
            </div>
            
            {/* Interactive Filters Bar */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                
                {/* Probability Group */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Probability
                    </span>
                    <div className="flex gap-1.5">
                         <button 
                            onClick={() => toggleFilter('high')}
                            className={`group relative text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                                activeFilters.high 
                                ? 'bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20' 
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400 opacity-60'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeFilters.high ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-slate-600'}`}></div> 
                            High {'>'}60%
                        </button>

                        <button 
                            onClick={() => toggleFilter('medium')}
                            className={`group relative text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                                activeFilters.medium 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20' 
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400 opacity-60'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeFilters.medium ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`}></div> 
                            Med 30-60%
                        </button>

                        <button 
                            onClick={() => toggleFilter('low')}
                            className={`group relative text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                                activeFilters.low 
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-200 hover:bg-sky-500/20' 
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400 opacity-60'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeFilters.low ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-slate-600'}`}></div> 
                            Low {'<'}30%
                        </button>
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>

                {/* Signatures Group */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <BrainCircuit className="w-3 h-3" /> Signatures
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {availableTags.map(tag => {
                            const isActive = !disabledTags.has(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`text-[10px] px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 ${
                                        isActive 
                                        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30' 
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400 opacity-60'
                                    }`}
                                >
                                    {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[400px]">
             {/* We use a container that takes full size */}
             <div className="w-full h-full flex items-center justify-center bg-slate-900/40 rounded-lg border border-slate-800/50 relative">
                {displayedTargets.length > 0 ? (
                    <Heatmap targetAreas={displayedTargets} width={600} height={400} onUpdateTarget={onUpdateTarget} />
                ) : (
                    <div className="flex flex-col items-center text-slate-500">
                        <Filter className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm">No targets match the current filters.</span>
                        <button 
                            onClick={() => {
                                setActiveFilters({ high: true, medium: true, low: true });
                                setDisabledTags(new Set());
                            }}
                            className="mt-2 text-xs text-emerald-400 hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
             </div>
          </div>
          <div className="mt-4 text-sm text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700/50 print:bg-slate-100 print:text-black print:border-slate-300">
            <strong>Geological Reasoning:</strong> {result.reasoning}
          </div>

          {/* Target Registry List */}
          <div className="mt-6 border-t border-slate-700 pt-6 print:hidden">
            <h4 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Identified Targets Registry <span className="text-xs font-normal text-slate-500 ml-2">({displayedTargets.length} visible)</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {displayedTargets.map(target => (
                    <div key={target.id} className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/10 group">
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                    Target #{target.id}
                                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                                        ({target.x.toFixed(1)}, {target.y.toFixed(1)})
                                    </span>
                                </span>
                                <div className="flex gap-1 mt-1">
                                    {getTargetTags(target).map(tag => (
                                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border flex items-center gap-1.5 ${
                                target.probability > 0.7 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                                target.probability > 0.4 ? 'bg-blue-950 text-blue-400 border-blue-500/30' :
                                'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                                {target.probability > 0.7 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                {(target.probability * 100).toFixed(0)}% Prob.
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {/* Description Block */}
                            <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Observation</span>
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed flex-1">
                                    {target.description || <span className="italic text-slate-500">No description provided.</span>}
                                </p>
                            </div>

                            {/* Reasoning Block */}
                            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-md p-3 relative overflow-hidden group-hover:bg-indigo-950/30 transition-colors flex flex-col">
                                {/* Background Icon */}
                                <BrainCircuit className="absolute -right-3 -bottom-3 w-16 h-16 text-indigo-500/5 transform rotate-12" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Geological Evidence</span>
                                    </div>
                                    <p className="text-sm text-indigo-100/90 leading-relaxed italic flex-1">
                                        {target.reasoning || <span className="not-italic text-slate-500">No specific reasoning data available.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {displayedTargets.length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-4">
                    No targets match the current filters.
                  </p>
                )}
            </div>
          </div>

        </div>

        {/* Side Panel: Composition & Actions */}
        <div className="flex flex-col gap-6 print:grid print:grid-cols-2">
            
            {/* Minerals Chart */}
            <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-xl p-4 flex flex-col min-h-[250px] print:border-slate-300 print:bg-white">
                <h4 className="font-semibold text-slate-200 mb-2 print:text-black">Alteration Zoning</h4>
                <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mineralData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mineralData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                        itemStyle={{ color: '#f1f5f9' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-xl p-4 overflow-y-auto print:border-slate-300 print:bg-white">
                <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
                    <Pickaxe className="w-4 h-4 text-amber-400 print:text-amber-700" />
                    Recommended Actions
                </h4>
                <ul className="space-y-3">
                    {result.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-300 print:text-black">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

             {/* Export & Save Options - Hidden in Print */}
             <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 print:hidden">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
                    <Share2 className="w-4 h-4 text-slate-400" />
                    Export & Save
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handlePrint} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs transition-colors text-slate-200 hover:text-white hover:border-slate-500">
                        <Printer className="w-5 h-5 text-emerald-400" />
                        <span>Print Report</span>
                    </button>
                    <button onClick={handleExportPDF} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs transition-colors text-slate-200 hover:text-white hover:border-slate-500">
                        <FileText className="w-5 h-5 text-red-400" />
                        <span>Export PDF</span>
                    </button>
                    <button onClick={handleDownloadCSV} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs transition-colors text-slate-200 hover:text-white hover:border-slate-500">
                        <Table className="w-5 h-5 text-blue-400" />
                        <span>Targets CSV</span>
                    </button>
                    <button onClick={handleExportImage} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs transition-colors text-slate-200 hover:text-white hover:border-slate-500">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        <span>Save Image</span>
                    </button>
                    <button onClick={handleExportGeoJSON} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs transition-colors text-slate-200 hover:text-white hover:border-slate-500">
                        <Globe className="w-5 h-5 text-teal-400" />
                        <span>Export GeoJSON</span>
                    </button>
                    <button onClick={handleDownloadJSON} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-700/50 border border-slate-600 border-dashed rounded-lg text-xs transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 hover:border-slate-500">
                        <Download className="w-5 h-5" />
                        <span>Save Project JSON</span>
                    </button>
                </div>
            </div>
            
            {/* Collapsible Geological Context Section */}
            <div className="border border-slate-700 rounded-xl bg-slate-800/30 overflow-hidden print:hidden">
              <button 
                onClick={() => setIsContextExpanded(!isContextExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                   <BookOpen className="w-4 h-4 text-emerald-400" />
                   Geological Reference: Porphyry System Model
                </div>
                {isContextExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              
              {isContextExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                   
                   {/* Formation */}
                   <div className="space-y-2">
                     <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Formation Mechanism</h5>
                     <p className="text-xs text-slate-300 leading-relaxed">
                        Porphyry deposits form in subduction-related magmatic arcs. Hydrous intermediate-to-felsic magmas ascend and release mineral-rich fluids that fracture the surrounding rock (hydrofracturing), creating extensive stockwork vein systems where ore precipitates.
                     </p>
                   </div>

                   {/* Alteration */}
                   <div className="space-y-2">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Alteration Zones</h5>
                      <ul className="space-y-1.5">
                        <li className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-0.5 shrink-0 shadow-sm shadow-red-500/50"></span>
                          <span><strong>Potassic (Core):</strong> Biotite, K-feldspar, Magnetite. High T, often associated with Bornite/Chalcopyrite.</span>
                        </li>
                         <li className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mt-0.5 shrink-0 shadow-sm shadow-yellow-500/50"></span>
                          <span><strong>Phyllic (Shell):</strong> Quartz, Sericite, Pyrite (QSP). Forms from cooling/collapse of hydrothermal system.</span>
                        </li>
                         <li className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5 shrink-0 shadow-sm shadow-emerald-500/50"></span>
                          <span><strong>Propylitic (Halo):</strong> Chlorite, Epidote, Calcite. The extensive outer footprint of the system.</span>
                        </li>
                      </ul>
                   </div>

                   {/* Economics */}
                   <div className="space-y-2">
                     <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Economic Significance</h5>
                     <p className="text-xs text-slate-300 leading-relaxed">
                        Porphyries are the world's most important source of <strong>Copper (Cu)</strong> and <strong>Molybdenum (Mo)</strong>, and a major source of Gold. Their large tonnage allows for low-cost bulk mining methods like open-pit or block caving.
                     </p>
                   </div>
                </div>
              )}
            </div>

        </div>
      </div>
    </div>
  );
};
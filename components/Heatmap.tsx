import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TargetArea } from '../types';
import { X, MapPin, Activity, AlignLeft, Info, Edit2, Save, XCircle, ZoomIn, ZoomOut, RotateCcw, BrainCircuit, Move } from 'lucide-react';

interface HeatmapProps {
  targetAreas: TargetArea[];
  width: number;
  height: number;
  onUpdateTarget: (id: number, newDescription: string) => void;
}

interface Cluster {
  id: string;
  x: number;
  y: number;
  points: TargetArea[];
  isCluster: boolean;
}

export const Heatmap: React.FC<HeatmapProps> = ({ targetAreas, width, height, onUpdateTarget }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  
  // Aspect ratio management to ensure 0-100 coordinate space fits nicely
  const aspect = width / height;
  const getBaseViewBox = () => {
    let w = 100;
    let h = 100;
    if (aspect > 1) {
      w = 100 * aspect;
    } else {
      h = 100 / aspect;
    }
    return { x: 50 - w/2, y: 50 - h/2, w, h };
  };

  const [viewBox, setViewBox] = useState(getBaseViewBox());
  
  // Reset viewbox if dimensions change significantly
  useEffect(() => {
    setViewBox(getBaseViewBox());
  }, [width, height]);

  // Pan/Zoom State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use ID for selection state
  const selectedTarget = useMemo(() => 
    targetAreas.find(t => t.id === selectedTargetId) || null
  , [targetAreas, selectedTargetId]);

  // Reset editing state when selection changes
  useEffect(() => {
    setIsEditing(false);
    if (selectedTarget) {
      setEditDescription(selectedTarget.description);
    }
  }, [selectedTargetId, selectedTarget]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (selectedTarget) {
      onUpdateTarget(selectedTarget.id, editDescription);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedTarget) {
      setEditDescription(selectedTarget.description);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // --- Interactive Zoom/Pan Logic ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomSpeed = 0.001;
    const dy = e.deltaY;
    const delta = Math.sign(dy) * Math.min(Math.abs(dy), 100); 
    const factor = 1 + (delta * zoomSpeed);
    
    // Mouse relative to SVG container
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert mouse pixels to SVG coordinates
    // Using preserveAspectRatio="none", so mapping is linear
    const svgX = viewBox.x + (mx / width) * viewBox.w;
    const svgY = viewBox.y + (my / height) * viewBox.h;

    setViewBox(prev => {
        let newW = prev.w * factor;
        let newH = prev.h * factor;
        
        const base = getBaseViewBox();

        // Limit max zoom out to base view
        if (newW > base.w) { newW = base.w; newH = base.h; }
        // Limit max zoom in
        if (newW < 2) { newW = 2; newH = 2 / aspect; } 

        // Scale around mouse point
        let newX = svgX - (mx / width) * newW;
        let newY = svgY - (my / height) * newH;

        // Simple boundary checks to keep map somewhat in view
        // Allow panning a bit outside but not losing the map completely
        const bufferX = base.w * 0.5;
        const bufferY = base.h * 0.5;
        
        if (newX < base.x - bufferX) newX = base.x - bufferX;
        if (newY < base.y - bufferY) newY = base.y - bufferY;
        if (newX + newW > base.x + base.w + bufferX) newX = base.x + base.w + bufferX - newW;
        if (newY + newH > base.y + base.h + bufferY) newY = base.y + base.h + bufferY - newH;
        
        // Snap to base if very close
        if (Math.abs(newW - base.w) < 0.1) return base;

        return { x: newX, y: newY, w: newW, h: newH };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
      
      if (dx === 0 && dy === 0) return;

      const scaleX = viewBox.w / width;
      const scaleY = viewBox.h / height;

      setViewBox(prev => {
          let newX = prev.x - (dx * scaleX);
          let newY = prev.y - (dy * scaleY);
          
          // No strict boundary check during drag for smoothness, 
          // or could add elastic effect. For now, simple update.
          return { ...prev, x: newX, y: newY };
      });

      setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContainerClick = () => {
    if (dragDistanceRef.current < 5) {
      setSelectedTargetId(null);
    }
  };

  const handleZoom = (factor: number) => {
    setViewBox(prev => {
      const base = getBaseViewBox();
      
      let newW = prev.w * factor;
      let newH = prev.h * factor;

      if (newW > base.w) return base;
      if (newW < 2) return prev;

      const dW = prev.w - newW;
      const dH = prev.h - newH;
      
      let newX = prev.x + dW / 2;
      let newY = prev.y + dH / 2;

      return { x: newX, y: newY, w: newW, h: newH };
    });
  };

  const resetZoom = () => setViewBox(getBaseViewBox());

  // --- Clustering Logic ---
  const clusters = useMemo(() => {
    const threshold = viewBox.w * 0.08; 
    
    const result: Cluster[] = [];
    const sortedPoints = [...targetAreas].sort((a, b) => a.x - b.x);
    const used = new Set<number>();

    for (let i = 0; i < sortedPoints.length; i++) {
      const p = sortedPoints[i];
      if (used.has(p.id)) continue;

      const clusterPoints = [p];
      used.add(p.id);

      for (let j = i + 1; j < sortedPoints.length; j++) {
        const neighbor = sortedPoints[j];
        if (used.has(neighbor.id)) continue;

        const dist = Math.sqrt(Math.pow(neighbor.x - p.x, 2) + Math.pow(neighbor.y - p.y, 2));
        if (dist <= threshold) {
          clusterPoints.push(neighbor);
          used.add(neighbor.id);
        }
      }

      const avgX = clusterPoints.reduce((sum, c) => sum + c.x, 0) / clusterPoints.length;
      const avgY = clusterPoints.reduce((sum, c) => sum + c.y, 0) / clusterPoints.length;

      result.push({
        id: clusterPoints.length > 1 ? `cluster-${p.id}` : `point-${p.id}`,
        x: avgX,
        y: avgY,
        points: clusterPoints,
        isCluster: clusterPoints.length > 1
      });
    }
    return result;
  }, [targetAreas, viewBox.w]);

  const handleClusterClick = (cluster: Cluster, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragDistanceRef.current > 5) return;
    
    if (!cluster.isCluster) {
      setSelectedTargetId(cluster.points[0].id);
    } else {
      let minX = 100, maxX = 0, minY = 100, maxY = 0;
      cluster.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const clusterW = maxX - minX;
      const clusterH = maxY - minY;
      const pad = Math.max(clusterW, clusterH) * 0.5 || 10; 
      let targetW = Math.max(clusterW + pad, 10);
      let targetH = Math.max(clusterH + pad, 10);
      const dim = Math.max(targetW, targetH);
      let targetX = (minX + maxX) / 2 - dim / 2;
      let targetY = (minY + maxY) / 2 - dim / 2;

      // Adjust aspect ratio of target view
      if (aspect > 1) targetW = targetH * aspect;
      else targetH = targetW / aspect;

      setViewBox({ x: targetX, y: targetY, w: targetW, h: targetH });
    }
  };

  // --- Heatmap Surface Generation ---
  const gridSize = 30; 
  const cells = useMemo(() => {
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellW = viewBox.w / gridSize;
        const cellH = viewBox.h / gridSize;
        
        const cx = viewBox.x + (i * cellW) + (cellW/2);
        const cy = viewBox.y + (j * cellH) + (cellH/2);
        
        let intensity = 0;
        targetAreas.forEach(target => {
          const dist = Math.sqrt(Math.pow(cx - target.x, 2) + Math.pow(cy - target.y, 2));
          // Normalized distance influence based on zoom level (viewBox.w)? 
          // Keeping it absolute (based on 0-100 coords) is physically more accurate.
          const influence = target.probability * Math.exp(-(dist * dist) / 100); 
          intensity += influence;
        });
        
        intensity = Math.min(intensity, 1);
        
        grid.push({
          x: viewBox.x + (i * cellW),
          y: viewBox.y + (j * cellH),
          w: cellW,
          h: cellH,
          intensity
        });
      }
    }
    return grid;
  }, [targetAreas, viewBox]);

  const getColor = (intensity: number) => {
    if (intensity < 0.1) return 'rgba(0,0,0,0)';
    if (intensity < 0.3) return `rgba(56, 189, 248, ${intensity})`; 
    if (intensity < 0.6) return `rgba(52, 211, 153, ${intensity})`; 
    return `rgba(248, 113, 113, ${intensity})`; 
  };

  const getTooltipPosition = (c: Cluster) => {
    const left = ((c.x - viewBox.x) / viewBox.w) * 100;
    const top = ((c.y - viewBox.y) / viewBox.h) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };

  const gridStrokeWidth = Math.max(0.1, 1 * (viewBox.w / width));

  return (
    <div 
        className={`relative bg-slate-900 border border-slate-700 rounded-lg shadow-inner group/heatmap overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ width, height }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleContainerClick}
    >
      {/* SVG Container */}
      <svg 
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} 
          width="100%" 
          height="100%" 
          className="absolute inset-0 transition-none" 
          preserveAspectRatio="none"
      >
          <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth={gridStrokeWidth} />
          </pattern>
          </defs>

          {/* Background Grid - mapped to 0-100 coordinate space explicitly */}
          <rect x="-500" y="-500" width="1000" height="1000" fill="url(#grid)" opacity="0.4" pointerEvents="none" />
          
          {/* Heatmap Layer */}
          <g className="blur-xl opacity-60">
              {cells.map((cell, idx) => (
              <rect
                  key={`cell-${idx}`}
                  x={cell.x}
                  y={cell.y}
                  width={cell.w + 0.1} 
                  height={cell.h + 0.1}
                  fill={getColor(cell.intensity)}
              />
              ))}
          </g>

          {/* Coordinate System Border (0-100) */}
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#475569" strokeWidth={gridStrokeWidth * 2} strokeDasharray="5,5" />

          {/* Clusters / Targets */}
          {clusters.map((cluster) => {
              const isSelected = !cluster.isCluster && cluster.points[0].id === selectedTargetId;
              const sizeBase = viewBox.w / 100;
              const rOuter = cluster.isCluster ? 6 * sizeBase : 2.5 * sizeBase; 
              const rInner = cluster.isCluster ? 6 * sizeBase : 1.5 * sizeBase;
              
              return (
              <g 
                  key={cluster.id} 
                  className="cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto"
                  onClick={(e) => handleClusterClick(cluster, e)}
                  onMouseEnter={() => setHoveredCluster(cluster)}
                  onMouseLeave={() => setHoveredCluster(null)}
              >
                  {cluster.isCluster ? (
                      <>
                          <circle 
                              cx={cluster.x} 
                              cy={cluster.y} 
                              r={rOuter + (0.5 * sizeBase)} 
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={0.5 * sizeBase}
                              opacity={0.5}
                          />
                          <circle 
                              cx={cluster.x} 
                              cy={cluster.y} 
                              r={rOuter}
                              fill="#f59e0b" 
                              stroke="white"
                              strokeWidth={0.5 * sizeBase}
                              className="drop-shadow-md"
                          />
                          <text
                              x={cluster.x} 
                              y={cluster.y}
                              dy={2 * sizeBase}
                              textAnchor="middle"
                              fill="white"
                              fontSize={6 * sizeBase}
                              fontWeight="bold"
                              pointerEvents="none"
                          >
                              {cluster.points.length}
                          </text>
                      </>
                  ) : (
                      <>
                          <circle 
                              cx={cluster.x} 
                              cy={cluster.y} 
                              r={isSelected ? rOuter * 2.5 : rOuter * 1.5} 
                              fill="none" 
                              stroke={isSelected ? "#34d399" : "rgba(255,255,255,0.0)"} 
                              strokeWidth={1 * sizeBase}
                              className={isSelected ? "" : "group-hover:stroke-white/50"}
                          />
                          <circle 
                              cx={cluster.x} 
                              cy={cluster.y} 
                              r={rInner * 1.5} 
                              fill={isSelected ? "#34d399" : "#fbbf24"}
                              className={isSelected ? "" : "animate-pulse"}
                          />
                      </>
                  )}
              </g>
              );
          })}
      </svg>
      
      {/* Tooltips & Overlays remain absolute DOM elements */}
      {hoveredCluster && (
        <div 
          className="absolute z-40 pointer-events-none bg-slate-800/95 border border-slate-600 rounded-lg p-3 shadow-xl backdrop-blur-md min-w-[200px] max-w-[320px] transform -translate-x-1/2 -translate-y-[calc(100%+12px)] transition-all duration-150"
          style={getTooltipPosition(hoveredCluster)}
        >
          {hoveredCluster.isCluster ? (
            <div className="text-center">
              <p className="text-xs font-bold text-amber-400 mb-1">Target Cluster</p>
              <p className="text-[10px] text-slate-300">Contains {hoveredCluster.points.length} potential targets</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">Click to zoom in</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-2 border-b border-slate-700/80 pb-2">
                <div>
                   <span className="text-xs font-bold text-emerald-400 block">Target #{hoveredCluster.points[0].id}</span>
                   <span className="text-[10px] text-slate-400">Coordinates: {hoveredCluster.points[0].x.toFixed(1)}, {hoveredCluster.points[0].y.toFixed(1)}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    hoveredCluster.points[0].probability > 0.7 ? 'bg-emerald-500/20 text-emerald-300' :
                    hoveredCluster.points[0].probability > 0.4 ? 'bg-blue-500/20 text-blue-300' :
                    'bg-slate-700 text-slate-300'
                }`}>{(hoveredCluster.points[0].probability * 100).toFixed(0)}%</span>
              </div>
              
              <div className="mb-2">
                 <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    {hoveredCluster.points[0].description}
                 </p>
              </div>

              {hoveredCluster.points[0].reasoning && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                       <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-md p-2.5 relative overflow-hidden">
                           <div className="absolute -right-2 -top-2 opacity-10 pointer-events-none">
                              <BrainCircuit className="w-12 h-12 text-indigo-400" />
                           </div>
                           <p className="text-[10px] text-indigo-300 uppercase font-bold mb-1 flex items-center gap-1.5 relative z-10">
                              <BrainCircuit className="w-3 h-3" /> Geological Evidence
                           </p>
                           <p className="text-[11px] text-indigo-100/90 leading-snug font-normal relative z-10">
                              {hoveredCluster.points[0].reasoning}
                           </p>
                       </div>
                  </div>
              )}
            </div>
          )}
          <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-slate-800 border-r border-b border-slate-600 transform -translate-x-1/2 rotate-45"></div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-lg border border-slate-700 shadow-lg z-10 pointer-events-auto">
        <div className="flex flex-col gap-1 border-b border-slate-700 pb-1 mb-1">
            <button 
                onClick={() => handleZoom(0.75)} 
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button 
                onClick={() => handleZoom(1.33)} 
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
        </div>
        <button 
            onClick={resetZoom} 
            className="p-1.5 hover:bg-slate-700 rounded text-amber-400 hover:text-amber-300 transition-colors"
            title="Reset View"
        >
            <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Pan hint */}
      {viewBox.w < getBaseViewBox().w * 0.9 && !isDragging && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in duration-300">
            <Move className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] text-slate-200 font-medium">Drag map to pan</span>
         </div>
      )}

      {/* Interactive Detail Overlay Panel */}
      {selectedTarget && (
        <div 
            className="absolute top-2 right-2 bottom-2 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-5 flex flex-col animate-in slide-in-from-right-10 duration-300 z-50 pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={(e) => e.stopPropagation()} 
        >
             <div className="flex justify-between items-start mb-5 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-100 text-base">Target #{selectedTarget.id}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700">
                                X: {selectedTarget.x.toFixed(1)}
                            </span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700">
                                Y: {selectedTarget.y.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedTargetId(null)}
                    className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all"
                    aria-label="Close details"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> 
                            Probability
                        </label>
                         <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                             selectedTarget.probability > 0.7 ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/20' : 
                             selectedTarget.probability > 0.4 ? 'text-blue-400 bg-blue-950/50 border border-blue-500/20' : 
                             'text-slate-400 bg-slate-800 border border-slate-700'
                         }`}>
                            {(selectedTarget.probability * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                        <div 
                            className={`h-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000 ${
                                selectedTarget.probability > 0.7 ? 'bg-emerald-500' :
                                selectedTarget.probability > 0.4 ? 'bg-blue-500' :
                                'bg-slate-500'
                            }`}
                            style={{ width: `${selectedTarget.probability * 100}%` }}
                        />
                    </div>
                </div>

                <div className="group/desc">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1.5">
                          <AlignLeft className="w-3.5 h-3.5" /> 
                          Observation
                      </label>
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="text-slate-500 hover:text-emerald-400 transition-colors p-1 opacity-0 group-hover/desc:opacity-100 focus:opacity-100"
                          title="Edit Description"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="animate-in fade-in duration-200">
                        <textarea
                          ref={textareaRef}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full h-32 bg-slate-800 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none mb-2 placeholder:text-slate-600"
                          placeholder="Enter geological observation details..."
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                            Press <kbd className="font-sans px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">Ctrl</kbd> + <kbd className="font-sans px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">Enter</kbd> to save
                          </span>
                          <div className="flex gap-2 ml-auto">
                            <button 
                              onClick={handleCancel}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-xs font-medium transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button 
                              onClick={handleSave}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-emerald-900/20"
                            >
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 cursor-pointer hover:border-slate-600 hover:bg-slate-800 transition-all group/text"
                        onClick={() => setIsEditing(true)}
                        title="Click to edit"
                      >
                          {selectedTarget.description || <span className="text-slate-500 italic">No description provided. Click to add notes...</span>}
                      </div>
                    )}
                </div>
                
                 <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden shadow-inner">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                        <BrainCircuit className="w-24 h-24 text-indigo-400" />
                    </div>
                    
                    <label className="text-xs text-indigo-300 font-bold uppercase mb-2 flex items-center gap-2 relative z-10">
                        <BrainCircuit className="w-4 h-4" /> 
                        Geological Evidence
                    </label>
                     <div className="text-xs text-slate-200 leading-relaxed relative z-10 font-normal">
                        {selectedTarget.reasoning ? (
                            selectedTarget.reasoning
                        ) : (
                            <span className="italic text-slate-500">
                                "Spatial analysis indicates high correlation with alteration patterns typically associated with mineralization centers."
                            </span>
                        )}
                     </div>
                </div>
            </div>
            
             <div className="mt-4 pt-4 border-t border-slate-800">
                 <button 
                    onClick={() => {
                        console.log(`Logged target ${selectedTarget.id} at ${selectedTarget.x}, ${selectedTarget.y}`);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                 >
                    <MapPin className="w-4 h-4" />
                    Log Target Coordinates
                 </button>
             </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-400 pointer-events-none backdrop-blur-sm">
        WGS84 Projection • Drag to pan • Scroll to zoom
      </div>
    </div>
  );
};
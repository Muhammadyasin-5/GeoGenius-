import React from 'react';
import { X, Layers, TrendingUp, DollarSign, Mountain, Activity, Scan, Pickaxe, GitBranch, Hexagon, Box, Microscope } from 'lucide-react';

interface GeologicalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeologicalContextModal: React.FC<GeologicalContextModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mountain className="w-6 h-6 text-emerald-400" />
              Geological Context
            </h2>
            <p className="text-sm text-slate-400 mt-1">Porphyry & Epithermal Systems Overview</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-900">
            {/* Porphyry Section */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Layers className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-100">Porphyry Copper Systems</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Formation Mechanism</h4>
                             <p className="text-sm text-slate-300 leading-relaxed text-justify">
                                Porphyry deposits are large-tonnage, low-grade hydrothermal deposits associated with intermediate to felsic intrusive rocks. They typically form in subduction-related magmatic arcs where hydrous magmas release mineral-rich fluids. These fluids accumulate at the top of the magma chamber until pressure exceeds lithostatic load, causing widespread <strong>hydrofracturing</strong> and stockwork veining.
                            </p>
                        </div>
                        
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h4 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-700/50 pb-2 flex items-center justify-between">
                                Alteration Zoning
                                <span className="text-[10px] text-slate-500 font-normal">Lowell & Guilbert Model</span>
                             </h4>
                             <ul className="text-sm text-slate-400 space-y-3">
                                <li className="flex gap-3 items-start group">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform"></span>
                                    <div>
                                        <strong className="text-red-200 block text-xs uppercase tracking-wide">Potassic (Core)</strong>
                                        <span className="text-xs">K-feldspar, biotite, magnetite, anhydrite. High T (>400°C). Proximal to heat source.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start group">
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform"></span>
                                    <div>
                                        <strong className="text-yellow-200 block text-xs uppercase tracking-wide">Phyllic (Shell)</strong>
                                        <span className="text-xs">Quartz, sericite, pyrite (QSP). Acidic fluids overprinting potassic zone as system cools.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start group">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.5)] group-hover:scale-110 transition-transform"></span>
                                    <div>
                                        <strong className="text-orange-200 block text-xs uppercase tracking-wide">Argillic</strong>
                                        <span className="text-xs">Kaolinite, montmorillonite, smectite. Low T clay alteration, often structural control.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start group">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform"></span>
                                    <div>
                                        <strong className="text-emerald-200 block text-xs uppercase tracking-wide">Propylitic (Halo)</strong>
                                        <span className="text-xs">Chlorite, epidote, calcite, pyrite. Extensive distal footprint (kms).</span>
                                    </div>
                                </li>
                             </ul>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 flex flex-col gap-4 h-full">
                            <div>
                                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" /> Economic Significance
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800">
                                    Porphyries are the world's premier source of <strong className="text-orange-300">Copper (Cu)</strong> and <strong className="text-blue-300">Molybdenum (Mo)</strong>, and a significant source of <strong className="text-yellow-300">Gold (Au)</strong>. Their immense scale enables low-cost bulk mining (open pit/block cave).
                                </p>
                            </div>

                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                                    <Scan className="w-4 h-4 text-indigo-400" /> Exploration Vectoring
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors">
                                        <Pickaxe className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-300 block mb-0.5">Geochemistry</span>
                                            <span className="text-[10px] text-slate-400 leading-tight block">
                                                Metal zoning (Cu-Mo core → Zn-Pb halo). Pathfinders: Bi, Sb, As in upper levels.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors">
                                        <Activity className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-300 block mb-0.5">Geophysics</span>
                                            <span className="text-[10px] text-slate-400 leading-tight block">
                                                <strong>Magnetics:</strong> Highs (Potassic magnetite) vs Lows (Phyllic destruction). <br/>
                                                <strong>IP/Resistivity:</strong> Chargeability highs in pyrite shell.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors">
                                        <Layers className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-300 block mb-0.5">Remote Sensing</span>
                                            <span className="text-[10px] text-slate-400 leading-tight block">
                                                SWIR/Satellite mapping of clay mineralogy (Alunite, Kaolinite, Sericite) to vector towards heat source.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicator Minerals Subsection (NEW) */}
                <div className="mt-6 border-t border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-amber-400" />
                        Crucial Indicator Minerals
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Core/Potassic */}
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-red-500/20 flex flex-col h-full">
                             <div className="flex items-center gap-2 mb-2 border-b border-red-500/10 pb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-xs font-bold text-red-200 uppercase">Core Indicators</span>
                             </div>
                             <ul className="space-y-3 flex-1">
                                <li>
                                    <strong className="text-xs text-slate-200 block">Biotite (Secondary)</strong>
                                    <span className="text-[10px] text-slate-400 block leading-tight">Dark, shreddy, fine-grained. Replaces hornblende. Indicates potassic core.</span>
                                </li>
                                <li>
                                    <strong className="text-xs text-slate-200 block">Magnetite</strong>
                                    <span className="text-[10px] text-slate-400 block leading-tight">Disseminated or in veinlets (M-veins). Associates with Au-rich porphyries.</span>
                                </li>
                             </ul>
                        </div>

                         {/* Phyllic/Shell */}
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-yellow-500/20 flex flex-col h-full">
                             <div className="flex items-center gap-2 mb-2 border-b border-yellow-500/10 pb-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]"></div>
                                <span className="text-xs font-bold text-yellow-200 uppercase">Shell Indicators</span>
                             </div>
                             <ul className="space-y-3 flex-1">
                                <li>
                                    <strong className="text-xs text-slate-200 block">Sericite</strong>
                                    <span className="text-[10px] text-slate-400 block leading-tight">Fine-grained muscovite. Silky luster. Defines phyllic zone (QSP). Destroys magnetic signature.</span>
                                </li>
                             </ul>
                        </div>

                         {/* Lithocap/Argillic */}
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-orange-500/20 flex flex-col h-full">
                             <div className="flex items-center gap-2 mb-2 border-b border-orange-500/10 pb-2">
                                <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.5)]"></div>
                                <span className="text-xs font-bold text-orange-200 uppercase">Lithocap Indicators</span>
                             </div>
                             <ul className="space-y-3 flex-1">
                                <li>
                                    <strong className="text-xs text-slate-200 block">Alunite / Natroalunite</strong>
                                    <span className="text-[10px] text-slate-400 block leading-tight">Forms in pH &lt; 2. Coarse blades (magmatic) vs fine (supergene). Vector to upflow.</span>
                                </li>
                                <li>
                                    <strong className="text-xs text-slate-200 block">Pyrophyllite / Dickite</strong>
                                    <span className="text-[10px] text-slate-400 block leading-tight">High-T acidic clays. Indicate proximity to feeder structures in the lithocap.</span>
                                </li>
                             </ul>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full" />

            {/* Petrology & Mineralogy Section */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                         <Hexagon className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-bold text-pink-100">Petrology & Mineralogy</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Host Rock Petrology */}
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h4 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-700/50 pb-2">Host Rock Petrology</h4>
                             <ul className="text-sm text-slate-400 space-y-3">
                                <li>
                                   <strong className="text-pink-300 block text-xs uppercase tracking-wide">Magmatic Affinity</strong>
                                   <span className="text-xs">
                                       Oxidized I-type, Calc-alkaline to Alkaline intrusions.
                                       <br/>
                                       <strong>Typical Rocks:</strong> Quartz Diorite, Granodiorite, Monzonite.
                                   </span>
                                </li>
                                <li>
                                   <strong className="text-pink-300 block text-xs uppercase tracking-wide">Textural Importance</strong>
                                   <span className="text-xs">
                                       <strong>Porphyritic Texture:</strong> Indicates rapid cooling and volatile saturation (boiling) during ascent. Phenocrysts (Plagioclase/Hornblende) in fine groundmass.
                                   </span>
                                </li>
                             </ul>
                        </div>
                        
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h4 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-700/50 pb-2">Sulfide Zonation</h4>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-1">
                                    <span className="text-red-300 font-bold">Core</span>
                                    <span className="text-slate-400">Bornite (Cu₅FeS₄) + Chalcopyrite (CuFeS₂)</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-1">
                                    <span className="text-yellow-300 font-bold">Shell</span>
                                    <span className="text-slate-400">Pyrite (FeS₂) {'>'} Chalcopyrite (High Pyrite Halo)</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-300 font-bold">Distal</span>
                                    <span className="text-slate-400">Sphalerite (ZnS) + Galena (PbS)</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Alteration Mineralogy Details */}
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 h-full flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                             <Box className="w-4 h-4 text-pink-400" /> Key Alteration Minerals
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-2">
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                                <span className="text-xs font-bold text-red-400 block mb-0.5">Secondary Biotite <span className="text-slate-500 font-normal opacity-70 ml-1 font-mono">K(Mg,Fe)₃(AlSi₃O₁₀)(OH)₂</span></span>
                                <span className="text-[10px] text-slate-400">
                                    Fine-grained, "shreddy" texture replacing primary mafics. Diagnostic of potassic alteration core.
                                </span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                                <span className="text-xs font-bold text-yellow-400 block mb-0.5">Sericite <span className="text-slate-500 font-normal opacity-70 ml-1 font-mono">KAl₂(AlSi₃O₁₀)(OH)₂</span></span>
                                <span className="text-[10px] text-slate-400">
                                    Fine-grained white mica. Diagnostic of phyllic (QSP) alteration. Destroys feldspars. Silky luster.
                                </span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                                <span className="text-xs font-bold text-orange-400 block mb-0.5">Alunite <span className="text-slate-500 font-normal opacity-70 ml-1 font-mono">KAl₃(SO₄)₂(OH)₆</span></span>
                                <span className="text-[10px] text-slate-400">
                                    Formed by acidic (pH {`<`} 2) fluids. Coarse crystalline (magmatic steam) vs fine-grained (supergene).
                                </span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                                <span className="text-xs font-bold text-emerald-400 block mb-0.5">Epidote <span className="text-slate-500 font-normal opacity-70 ml-1 font-mono">Ca₂(Al,Fe)₃(SiO₄)₃(OH)</span></span>
                                <span className="text-[10px] text-slate-400">
                                    Pistachio-green. Replacing plagioclase/mafics. Key propylitic indicator.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full" />

            {/* Epithermal Section */}
             <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-100">Epithermal Gold-Silver Systems</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed text-justify">
                            Epithermal deposits form at shallow depths ({'<'}1.5km) and lower temperatures ({'<'}300°C), often in the lithocaps overlying deeper porphyry systems. They are classified based on the sulfidation state of the hydrothermal fluids.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-3">
                             <div className="bg-slate-800/50 p-3 rounded-lg border border-l-4 border-l-red-500 border-y-slate-700 border-r-slate-700">
                                 <strong className="text-sm text-red-300 block mb-1">High Sulphidation (HS)</strong>
                                 <p className="text-xs text-slate-400">Derived from acidic magmatic volatiles. Characterized by vuggy silica, alunite, and kaolinite.</p>
                             </div>
                             <div className="bg-slate-800/50 p-3 rounded-lg border border-l-4 border-l-amber-400 border-y-slate-700 border-r-slate-700">
                                 <strong className="text-sm text-amber-200 block mb-1">Low Sulphidation (LS)</strong>
                                 <p className="text-xs text-slate-400">Driven by meteoric waters reacting with magmatic heat. Characterized by adularia-sericite alteration and banded quartz veins.</p>
                             </div>
                        </div>

                        {/* Commodities / Metals */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                             <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Associated Metals</strong>
                             <div className="flex gap-2 flex-wrap">
                                 <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-mono">Au</span>
                                 <span className="text-xs px-2 py-1 bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded font-mono">Ag</span>
                                 <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded font-mono">Cu</span>
                                 <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono">Pb</span>
                                 <span className="text-xs px-2 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded font-mono">Zn</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 h-full flex flex-col gap-4">
                        
                        {/* Mineralization Styles & Controls */}
                        <div>
                             <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-400" /> Ore Genesis & Style
                            </h4>
                            <div className="space-y-3 text-xs text-slate-400">
                                <div>
                                    <strong className="text-slate-300 block mb-1">Mineralization Styles</strong>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li><strong>Veins:</strong> Crustiform-colloform banding (LS) or massive sulphide (HS).</li>
                                        <li><strong>Breccia:</strong> Hydrothermal explosive fragmentation (Phreatomagmatic).</li>
                                        <li><strong>Disseminated:</strong> Bulk tonnage, often in permeable lithologies.</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-slate-300 block mb-1">Deposition Drivers</strong>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li><strong>Boiling:</strong> Pressure drop leads to gas loss (CO₂, H₂S), causing pH increase and Au precipitation.</li>
                                        <li><strong>Fluid Mixing:</strong> Hot magmatic fluids mix with cool meteoric water, destabilizing metal complexes.</li>
                                        <li><strong>Cooling:</strong> Conductive heat loss drives silica saturation and mineral precipitation.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-px bg-slate-700/50 w-full"></div>

                        {/* Indicators */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                                <Mountain className="w-4 h-4 text-blue-400" /> Exploration Indicators
                            </h4>
                            <ul className="text-sm text-slate-400 space-y-2 list-none">
                                <li className="flex gap-2 items-start">
                                    <span className="text-blue-500 font-bold mt-1">•</span>
                                    <div>
                                        <strong className="block text-slate-300 text-xs">Silica Caps / Sinters</strong>
                                        <span className="text-[10px] leading-tight block">Paleosurface evidence marking the top of the system.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-blue-500 font-bold mt-1">•</span>
                                    <div>
                                        <strong className="block text-slate-300 text-xs">Advanced Argillic</strong>
                                        <span className="text-[10px] leading-tight block">Clay alteration (Lithocaps) that may conceal deposits.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-blue-500 font-bold mt-1">•</span>
                                    <div>
                                        <strong className="block text-slate-300 text-xs">Pathfinders</strong>
                                        <span className="text-[10px] leading-tight block">Hg, Sb, As, Tl concentrated in upper levels.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-blue-500 font-bold mt-1">•</span>
                                    <div>
                                        <strong className="block text-slate-300 text-xs">Textures</strong>
                                        <span className="text-[10px] leading-tight block">Bladed calcite replaced by quartz indicates boiling zones.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full" />

            {/* Structural Controls Section */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                         <GitBranch className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-100">Structural Controls</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                         <p className="text-sm text-slate-300 leading-relaxed text-justify">
                            Structural permeability is the primary control on hydrothermal fluid flow. Pre-existing faults and fractures focus magmatic-hydrothermal fluids, while syn-mineral deformation creates voids (dilation) for mineral precipitation.
                         </p>
                         
                         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-700/50 pb-2">System Specifics</h4>
                            <ul className="text-sm text-slate-400 space-y-3">
                               <li>
                                   <strong className="text-emerald-300 block text-xs uppercase tracking-wide">Porphyry Environment</strong>
                                   <span className="text-xs">
                                       Intersection of regional arc-parallel and arc-normal faults often localize intrusive stocks. Stockwork density increases towards the potassic core due to hydraulic fracturing.
                                   </span>
                               </li>
                               <li>
                                   <strong className="text-blue-300 block text-xs uppercase tracking-wide">Epithermal Environment</strong>
                                   <span className="text-xs">
                                       High-grade shoots form in dilational jogs (step-overs) along strike-slip faults or in fold hinges. Normal faults control basin formation and fluid boiling horizons.
                                   </span>
                               </li>
                            </ul>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 h-full flex flex-col gap-4">
                             <div>
                                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <Scan className="w-4 h-4 text-indigo-400" /> Structural Vectoring
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800">
                                    Analyzing structural complexity helps identify high-permeability zones where mineralization is most likely to accumulate.
                                </p>
                             </div>

                             <div className="space-y-2">
                                 <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700">
                                     <Activity className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                     <div>
                                         <span className="text-xs font-bold text-slate-300 block mb-0.5">Lineament Mapping</span>
                                         <span className="text-[10px] text-slate-400 leading-tight block">
                                             Identification of major structural corridors using satellite/magnetic data. Deposits often cluster at lineament intersections.
                                         </span>
                                     </div>
                                 </div>
                                 <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700">
                                     <Layers className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                     <div>
                                         <span className="text-xs font-bold text-slate-300 block mb-0.5">Fracture/Fault Density</span>
                                         <span className="text-[10px] text-slate-400 leading-tight block">
                                             Areas of high structural density (damage zones) represent maximum permeability, critical for disseminated ore bodies.
                                         </span>
                                     </div>
                                 </div>
                                  <div className="flex gap-3 items-start p-2.5 rounded bg-slate-900/50 border border-slate-700">
                                     <GitBranch className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                                     <div>
                                         <span className="text-xs font-bold text-slate-300 block mb-0.5">Kinematic Indicators</span>
                                         <span className="text-[10px] text-slate-400 leading-tight block">
                                             Identifying extensional zones (e.g., hanging wall of normal faults) or compressional fold hinges as traps.
                                         </span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
            <span className="text-xs text-slate-500">Reference: USGS, Lowell & Guilbert (1970), Sillitoe (2010)</span>
            <button 
                onClick={onClose}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
            >
                Close Reference
            </button>
        </div>

      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
        setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Header Indicator */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
          isOnline 
            ? 'bg-slate-800/50 border-emerald-500/20 hover:border-emerald-500/40' 
            : 'bg-red-950/30 border-red-500/30 animate-pulse'
        }`}
        title={isOnline ? "Network Connected" : "Network Disconnected - Check WiFi"}
      >
        {isOnline ? (
          <Wifi className="w-4 h-4 text-emerald-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
           isOnline ? 'text-emerald-500' : 'text-red-400'
        }`}>
          {isOnline ? 'Connected' : 'Offline'}
        </span>
      </div>

      {/* Offline Banner/Toast */}
      {!isOnline && showOfflineBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-500 w-[90%] max-w-md">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-xl shadow-2xl border border-red-500/40 flex items-start gap-4 ring-1 ring-red-900/50">
             <div className="p-2.5 bg-red-500/10 rounded-full shrink-0 border border-red-500/20">
               <WifiOff className="w-5 h-5 text-red-500" />
             </div>
             <div className="flex-1">
               <h4 className="font-bold text-sm text-red-100">No Internet Connection</h4>
               <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                 GeoGenius requires an active network connection to perform AI analysis. Please connect your device to WiFi.
               </p>
             </div>
             <button 
                onClick={() => setShowOfflineBanner(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
                aria-label="Dismiss"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}
    </>
  );
};
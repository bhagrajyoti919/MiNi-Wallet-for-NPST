import React from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function StatusDialog({ isOpen, onClose, type = "success", title, message }) {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
    >
        <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col items-center justify-center p-6 py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                    {type === 'success' ? (
                        <IconCheck size={32} stroke={3} />
                    ) : (
                        <IconX size={32} stroke={3} />
                    )}
                </div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{title}</h3>
                <p className="text-neutral-500 mt-2">{message}</p>
                
                <button 
                    onClick={onClose}
                    className={`mt-6 w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                        type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {type === 'success' ? 'Done' : 'Try Again'}
                </button>
            </div>
        </div>
    </div>
  );
}

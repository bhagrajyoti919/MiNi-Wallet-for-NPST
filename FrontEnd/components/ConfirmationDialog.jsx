import React from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

export default function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" 
}) {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    type === 'danger' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                }`}>
                    {type === 'danger' ? (
                        <IconTrash size={32} stroke={2} />
                    ) : (
                        <IconAlertTriangle size={32} stroke={2} />
                    )}
                </div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{title}</h3>
                <p className="text-neutral-500 mt-2 text-sm">{message}</p>
                
                <div className="flex gap-3 w-full mt-6">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-transform active:scale-95 ${
                            type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

import React, { useState } from "react";
import { IconCopy, IconBuildingBank, IconTrash, IconChevronRight, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function SettingsDialog({ isOpen, onClose, user, wallet, onDeleteUser, onCheckBalance }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = user?.email || user?.id || "user@upi";
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800">
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <IconChevronRight className="rotate-180 w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">UPI settings</h2>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
            
            {/* UPI ID Section */}
            <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">UPI ID</div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{user?.email || user?.id || "user@upi"}</span>
                    <button 
                        onClick={handleCopy}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" 
                        title="Copy UPI ID"
                    >
                        {isCopied ? <IconCheck size={20} className="text-green-500" /> : <IconCopy size={20} />}
                    </button>
                </div>
            </div>

            {/* Bank Accounts Section */}
            <div className="space-y-2">
                 <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bank Accounts</div>
                 <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <div 
                        onClick={onCheckBalance}
                        className="p-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            <IconBuildingBank size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">Savings</span>
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">Primary</span>
                            </div>
                            <div className="text-sm text-neutral-500 mt-0.5 font-medium">
                                {wallet ? `Balance: ₹${wallet.balance.toLocaleString()}` : "Check balance"}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

             {/* Others Section */}
             <div className="space-y-2">
                 <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Others</div>
                 <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">Manage UPI numbers</span>
                        <div className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">NEW</div>
                    </button>
                    
                    <button 
                        onClick={onDeleteUser}
                        className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                    >
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium group-hover:text-red-600 transition-colors">Deregister UPI</span>
                        <IconTrash size={18} className="text-neutral-400 group-hover:text-red-600 transition-colors" />
                    </button>
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
}

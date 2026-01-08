import React, { useState, useEffect } from "react";
import { IconCopy, IconBuildingBank, IconTrash, IconChevronRight, IconCheck, IconCurrencyRupee, IconSun, IconMoon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import api from "../api/api";
import { useTheme } from "./ThemeProvider";
import ConfirmationDialog from "./ConfirmationDialog";

export default function SettingsDialog({ isOpen, onClose, user, wallet, onDeleteUser, onCheckBalance }) {
  const { theme, setTheme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [transactionLimit, setTransactionLimit] = useState(null);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBusinessRules();
    }
  }, [isOpen]);

  const fetchBusinessRules = async () => {
    try {
      const response = await api.get("/config/business-rules");
      setTransactionLimit(response.data.maxTransferLimit);
      setNewLimit(response.data.maxTransferLimit);
    } catch (error) {
      console.error("Failed to fetch business rules", error);
    }
  };

  const handleUpdateLimit = async () => {
    try {
      await api.put("/config/business-rules", {
        maxTransferLimit: parseFloat(newLimit)
      });
      setTransactionLimit(parseFloat(newLimit));
      setIsEditingLimit(false);
    } catch (error) {
      console.error("Failed to update transaction limit", error);
    }
  };

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
        
        <div className="p-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800">
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <IconChevronRight className="rotate-180 w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">UPI settings</h2>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
            
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

            <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Appearance</div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-1 flex items-center">
                    <button
                        onClick={() => setTheme("light")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                            theme === "light" 
                                ? "bg-white text-neutral-900 shadow-sm" 
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                    >
                        <IconSun size={18} />
                        <span>Light</span>
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                            theme === "dark" 
                                ? "bg-neutral-700 text-white shadow-sm" 
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                    >
                        <IconMoon size={18} />
                        <span>Dark</span>
                    </button>
                </div>
            </div>

             {/* Transaction Limit Section */}
             <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Transaction Limit</div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                 <IconCurrencyRupee size={18} />
                             </div>
                             <span className="font-medium text-neutral-800 dark:text-neutral-200">Max Transfer Limit</span>
                         </div>
                         {!isEditingLimit && (
                             <button 
                                 onClick={() => setIsEditingLimit(true)}
                                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                             >
                                 Change
                             </button>
                         )}
                    </div>
                    
                    {isEditingLimit ? (
                        <div className="mt-3 flex gap-2">
                            <input 
                                type="number" 
                                value={newLimit}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => setNewLimit(e.target.value)}
                                className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-transparent dark:text-white"
                                placeholder="Enter limit"
                            />
                            <button 
                                onClick={handleUpdateLimit}
                                className="px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
                            >
                                Save
                            </button>
                            <button 
                                onClick={() => {
                                    setIsEditingLimit(false);
                                    setNewLimit(transactionLimit);
                                }}
                                className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-200"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="pl-11 text-sm text-neutral-500">
                            Current limit: <span className="font-bold text-neutral-800 dark:text-neutral-200">₹{transactionLimit?.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

             {/* Others Section */}
             <div className="space-y-2">
                 <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Others</div>
                 <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                    >
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium group-hover:text-red-600 transition-colors">Deregister UPI</span>
                        <IconTrash size={18} className="text-neutral-400 group-hover:text-red-600 transition-colors" />
                    </button>
                 </div>
            </div>

        </div>

      </div>

      <ConfirmationDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDeleteUser}
        title="Deregister UPI"
        message="Are you sure you want to deregister your UPI ID? This will delete your account and you won't be able to access your wallet anymore. This action cannot be undone."
        confirmText="Yes, Deregister"
        type="danger"
      />
    </div>
  );
}

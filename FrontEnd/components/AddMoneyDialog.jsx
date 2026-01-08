import React, { useState } from "react";
import { IconPlus, IconChevronRight, IconCheck } from "@tabler/icons-react";
import api from "../api/api";
import PinDialog from "./PinDialog";

export default function AddMoneyDialog({ isOpen, onClose, refreshWallet }) {
  const [amount, setAmount] = useState("");
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInitiateAdd = () => {
    if (!amount || Number(amount) <= 0) {
        return;
    }
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (pin) => {
    setError("");
    setIsLoading(true);
    try {
        await api.post("/wallet/add-money", { 
                amount: Number(amount),
                pin: pin 
            });
            refreshWallet(pin);
            setIsPinDialogOpen(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount("");
                onClose();
            }, 2000);
    } catch (err) {
        console.error("Add money failed", err);
        setError(err.response?.data?.detail || "Transaction failed");
        setIsPinDialogOpen(false);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        <div 
            className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
        <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800">
                <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                    <IconChevronRight className="rotate-180 w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                </button>
                <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Add Money</h2>
            </div>

            <div className="p-6">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                            <IconCheck size={32} stroke={3} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Success!</h3>
                        <p className="text-neutral-500 mt-2">Added ₹{amount} to your wallet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs text-neutral-500 font-medium mb-2 block uppercase tracking-wider">Enter Amount</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xl font-medium group-focus-within:text-blue-500 transition-colors">₹</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onWheel={(e) => e.target.blur()}
                                    onChange={e => setAmount(e.target.value)} 
                                    placeholder="0.00"
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-2xl font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleInitiateAdd}
                            disabled={!amount || Number(amount) <= 0 || isLoading}
                            className="w-full py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <IconPlus size={24} stroke={3} />
                            Proceed to Pay
                        </button>
                    </div>
                )}
            </div>
        </div>
        </div>

        <PinDialog 
            isOpen={isPinDialogOpen} 
            mode="enter" 
            onSubmit={handlePinSubmit} 
            onCancel={() => setIsPinDialogOpen(false)}
            error={error}
            isLoading={isLoading}
        />
    </>
  );
}

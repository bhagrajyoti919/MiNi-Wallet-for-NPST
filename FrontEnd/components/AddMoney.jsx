import { useState } from "react";
import api from "../api/api";
import PinDialog from "./PinDialog";
import { IconPlus } from "@tabler/icons-react";

export default function AddMoney({ refreshWallet }) {
  const [amount, setAmount] = useState("");
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            setAmount("");
            setIsPinDialogOpen(false);
    } catch (err) {
        console.error("Add money failed", err);
        setError(err.response?.data?.detail || "Transaction failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-white flex items-center gap-2">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                    <IconPlus size={18} />
                </div>
                Add Money
            </h3>
            
            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-xs text-neutral-500 font-medium mb-1 block">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
                
                <button 
                    onClick={handleInitiateAdd}
                    disabled={!amount || Number(amount) <= 0}
                    className="w-full py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Money
                </button>
            </div>
        </div>

        <PinDialog 
            isOpen={isPinDialogOpen} 
            mode="enter" 
            onSubmit={handlePinSubmit} 
            onCancel={() => setIsPinDialogOpen(false)}
            error={error}
        />
    </>
  );
}

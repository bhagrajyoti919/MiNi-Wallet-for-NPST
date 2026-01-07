import { useEffect, useState } from "react";
import api from "../api/api";
import PinDialog from "./PinDialog";
import { IconSend, IconCurrencyRupee, IconLoader } from "@tabler/icons-react";

export default function TransferMoney({ refreshWallet }) {
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  const initiateTransfer = () => {
    setError("");
    if (!toUserId || toUserId === "Select User") {
        setError("Please select a recipient");
        return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        setError("Please enter a valid amount");
        return;
    }
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (pin) => {
    setError("");
    setIsLoading(true);
    try {
      await api.post("/wallet/transfer", {
        toUserId,
        amount: Number(amount),
        pin: pin
      });
      refreshWallet(pin);
      setAmount("");
      setToUserId("");
      setIsPinDialogOpen(false);
      // Optional: Show success message
    } catch (err) {
      console.error("Transfer failed", err);
      setError(err.response?.data?.detail || "Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <h4 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
        <IconSend className="h-6 w-6 text-blue-500" />
        Transfer Money
      </h4>

      <div className="space-y-4">
        {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                {error}
            </div>
        )}

        <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Recipient</label>
            <select 
                className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={toUserId}
                onChange={e => setToUserId(e.target.value)}
            >
                <option value="">Select User</option>
                {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Amount</label>
            <div className="relative">
                <IconCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input 
                    type="number" 
                    className="w-full pl-10 p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)} 
                />
            </div>
        </div>

        <button 
            onClick={initiateTransfer}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? <IconLoader className="h-5 w-5 animate-spin" /> : "Transfer Now"}
        </button>
      </div>

      <PinDialog 
        isOpen={isPinDialogOpen}
        mode="enter"
        onSubmit={handlePinSubmit}
        onCancel={() => setIsPinDialogOpen(false)}
        error={error} // Pass error to dialog if needed, though we show it in main form too
      />
    </div>
  );
}

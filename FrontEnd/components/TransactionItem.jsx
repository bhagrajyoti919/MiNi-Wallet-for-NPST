import React from "react";
import { IconWallet, IconUser, IconTrash } from "@tabler/icons-react";

export default function TransactionItem({ tx, users, onDelete }) {
  const getTransactionDetails = (tx) => {
    const isDebit = tx.type === 'debit';
    let name = "Transfer";
    let amountColor = isDebit ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
    let amountSign = isDebit ? "-" : "+";
    let category = "Money Transfer"; // Default category

    if (isDebit && tx.toUserId) {
        const user = users.find(u => u.id === tx.toUserId);
        name = user ? user.name : "Unknown User";
    } else if (!isDebit && tx.fromUserId) {
        const user = users.find(u => u.id === tx.fromUserId);
        name = user ? user.name : "Unknown User";
    } else if (!isDebit) {
        name = "Wallet Top-up";
        category = "Bank Transfer";
    }

    return { name, amountColor, amountSign, category };
  };

  const { name, amountColor, amountSign, category } = getTransactionDetails(tx);

  return (
    <div 
        className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {name === "Wallet Top-up" ? <IconWallet className="w-6 h-6" /> : <IconUser className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-xs">
                        {category}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className={`font-bold ${amountColor} text-lg`}>
                    {amountSign}₹{tx.amount.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1">
                        <span className={tx.status === 'failed' ? 'text-red-500 capitalize' : 'capitalize'}>{tx.status}</span>
                        {tx.status === 'success' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        {tx.status === 'failed' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                    </div>
                    {tx.status === 'failed' && tx.reason && (
                        <span className="text-[10px] text-red-400">{tx.reason}</span>
                    )}
                </div>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tx.id);
                }}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                title="Delete transaction"
            >
                <IconTrash size={18} />
            </button>
        </div>
    </div>
  );
}

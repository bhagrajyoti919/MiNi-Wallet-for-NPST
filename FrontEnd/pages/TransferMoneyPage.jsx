import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IconArrowLeft, 
  IconSearch, 
  IconUser, 
  IconClock,
  IconSettings,
  IconUserBolt,
  IconBrandTabler
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import api from "../api/api";
import PinDialog from "../components/PinDialog";
import SettingsDialog from "../components/SettingsDialog";
import ProfileDialog from "../components/ProfileDialog";
import StatusDialog from "../components/StatusDialog";

export default function TransferMoneyPage({ onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // Data states
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionLimit, setTransactionLimit] = useState(null);
  
  // Transfer states
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseAction: null
  });

  // Dialog states (for sidebar consistency)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Fetch current user for sidebar
    api.get("/users/me").then((res) => setCurrentUser(res.data)).catch(console.error);

    // Fetch users for suggestions
    api.get("/users").then((res) => setUsers(res.data)).catch(console.error);
    
    // Fetch recent transactions
    api.get("/transactions/recent").then((res) => setRecentTransactions(res.data)).catch(console.error);

    // Fetch business rules
    api.get("/config/business-rules").then((res) => setTransactionLimit(res.data.maxTransferLimit)).catch(console.error);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
  };

  const handleTransfer = async (pin) => {
    setError("");
    setIsLoading(true);
    try {
      await api.post("/wallet/transfer", {
        toUserId: selectedUser.id,
        amount: Number(amount),
        pin: pin
      });
      setStatusDialog({
        isOpen: true,
        type: "success",
        title: "Transfer Successful!",
        message: `Successfully sent ₹${amount} to ${selectedUser.name}`,
        onCloseAction: () => navigate("/")
      });
    } catch (err) {
      console.error("Transfer failed", err);
      setStatusDialog({
        isOpen: true,
        type: "error",
        title: "Transfer Failed",
        message: err.response?.data?.detail || "Transaction failed",
        onCloseAction: () => {}
      });
    } finally {
      setIsLoading(false);
      setIsPinDialogOpen(false);
    }
  };

  const initiateTransfer = () => {
    if (!amount || Number(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    // Limit check removed so backend can record the failure
    setIsPinDialogOpen(true);
  };

  const handleDeleteUser = async () => {
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          try {
              await api.delete("/auth/delete");
              onLogout();
          } catch (e) {
              console.error("Failed to delete user", e);
              alert("Failed to delete account");
          }
      }
  };

  // Helper to get image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/${path}`;
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: (e) => {
        e.preventDefault();
        navigate("/");
      }
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: (e) => {
        e.preventDefault();
        setIsProfileOpen(true);
      }
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: (e) => {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: (e) => {
        e.preventDefault();
        onLogout();
      },
    },
  ];

  const getTransactionDetails = (tx) => {
    const isDebit = tx.type === 'debit';
    let name = "Transfer";
    let amountColor = isDebit ? "text-red-600" : "text-green-600";
    let amountSign = isDebit ? "-" : "+";

    if (isDebit && tx.toUserId) {
        const user = users.find(u => u.id === tx.toUserId);
        name = user ? `To: ${user.name}` : "To: Unknown User";
    } else if (!isDebit && tx.fromUserId) {
        const user = users.find(u => u.id === tx.fromUserId);
        name = user ? `From: ${user.name}` : "From: Unknown User";
    } else if (!isDebit) {
        name = "Wallet Top-up";
    }

    return { name, amountColor, amountSign };
  };

  return (
    <>
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        wallet={null} // We might not have wallet here, pass null or fetch it if needed. SettingsDialog handles null wallet gracefully? Let's hope.
        onDeleteUser={handleDeleteUser}
        onCheckBalance={() => {
            // Navigate to dashboard and show balance? Or just ignore.
            navigate("/");
        }}
      />
      <ProfileDialog 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={setCurrentUser}
      />
      
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
          "h-screen"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} onClick={link.onClick} />
                ))}
                </div>
            </div>
            <div>
                <SidebarLink
                link={{
                    label: currentUser ? currentUser.name : "User",
                    href: "#",
                    icon: (
                    <div 
                        className="h-7 w-7 rounded-full bg-neutral-300 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-700 border border-neutral-200 dark:border-neutral-700"
                        onDragStart={(e) => e.preventDefault()}
                        draggable={false}
                    >
                        {currentUser?.profileImage ? (
                            <img 
                                src={getImageUrl(currentUser.profileImage)} 
                                alt="User" 
                                className="h-full w-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            currentUser ? currentUser.name.charAt(0).toUpperCase() : "U"
                        )}
                    </div>
                    ),
                }}
                onClick={(e) => {
                    e.preventDefault();
                }}
                />
            </div>
            </SidebarBody>
        </Sidebar>

        <div className="flex flex-1">
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto">
                
                {selectedUser ? (
                    // Payment View
                    <div className="max-w-2xl mx-auto w-full py-8">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <IconArrowLeft className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
                            </button>
                            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Payment to {selectedUser.name}</h1>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-8 bg-neutral-50 dark:bg-neutral-800/50 p-10 rounded-3xl">
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl">
                                    {selectedUser.profileImage ? (
                                        <img src={getImageUrl(selectedUser.profileImage)} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-blue-600">{selectedUser.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{selectedUser.name}</h2>
                                    <p className="text-neutral-500">{selectedUser.email}</p>
                                </div>

                                <div className="w-full max-w-sm mt-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-neutral-400">₹</span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-10 pr-4 py-4 text-4xl font-bold text-center bg-transparent border-b-2 border-neutral-200 focus:border-blue-500 outline-none transition-colors text-neutral-800 dark:text-neutral-200"
                                            placeholder="0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={initiateTransfer}
                                    className="w-full max-w-sm py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4"
                                >
                                    Pay Securely
                                </button>
                        </div>
                    </div>
                ) : (
                    // Selection View
                    <div className="max-w-4xl mx-auto w-full">
                         <div className="mb-8">
                            <div className="flex items-center gap-4 mb-2">
                                <button onClick={() => navigate("/")} className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                    <IconArrowLeft className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
                                </button>
                                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Send Money</h1>
                            </div>
                            <p className="text-neutral-500">Search for people or select from recent contacts</p>
                         </div>

                        {/* Search Bar */}
                        <div className="mb-10">
                            <div className="relative max-w-2xl">
                                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-lg text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Suggestions Section */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Suggested People</h2>
                            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                                {filteredUsers.slice(0, 10).map((user) => (
                                <button 
                                    key={user.id} 
                                    className="flex flex-col items-center gap-3 min-w-[90px] group"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                                    {user.profileImage ? (
                                        <img src={getImageUrl(user.profileImage)} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                    </div>
                                    <span className="text-sm text-center text-neutral-600 dark:text-neutral-400 truncate w-full group-hover:text-blue-600 transition-colors">
                                        {user.name.split(' ')[0]}
                                    </span>
                                </button>
                                ))}
                            </div>
                        </div>

                        {/* Recents Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Recent Transfers</h2>
                            <div className="flex flex-col gap-4">
                                {recentTransactions.slice(0, 10).map((tx) => {
                                  const { name, amountColor, amountSign } = getTransactionDetails(tx);
                                  return (
                                    <div 
                                        key={tx.id} 
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-900/50 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                            <IconClock className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                {name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-neutral-500">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </p>
                                                {tx.status === 'failed' && (
                                                    <span className="text-xs text-red-500 font-medium px-2 py-0.5 bg-red-50 dark:bg-red-900/20 rounded-full">
                                                        Failed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${tx.status === 'failed' ? 'text-neutral-400 line-through' : amountColor}`}>
                                                {amountSign}₹{tx.amount}
                                            </span>
                                            {tx.status === 'failed' && (
                                                <p className="text-xs text-red-500 mt-1">{tx.reason || 'Failed'}</p>
                                            )}
                                        </div>
                                    </div>
                                  );
                                })}
                                {recentTransactions.length === 0 && (
                                    <div className="text-center py-8 text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                                        No recent transfers found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <StatusDialog 
        isOpen={statusDialog.isOpen}
        type={statusDialog.type}
        title={statusDialog.title}
        message={statusDialog.message}
        onClose={() => {
            setStatusDialog(prev => ({ ...prev, isOpen: false }));
            if (statusDialog.onCloseAction) {
                statusDialog.onCloseAction();
            }
        }}
      />

      <PinDialog 
        isOpen={isPinDialogOpen}
        mode="enter"
        onSubmit={handleTransfer}
        onCancel={() => setIsPinDialogOpen(false)}
        error={error}
        isLoading={isLoading}
      />
    </>
  );
}

const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        FinTech Wallet
      </motion.span>
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
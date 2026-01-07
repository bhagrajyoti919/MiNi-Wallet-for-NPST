import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IconArrowLeft, 
  IconSearch, 
  IconUser, 
  IconClock,
  IconSettings,
  IconUserBolt,
  IconBrandTabler,
  IconFilter,
  IconWallet,
  IconDownload,
  IconTrash,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import api from "../api/api";
import PinDialog from "../components/PinDialog";
import SettingsDialog from "../components/SettingsDialog";
import ProfileDialog from "../components/ProfileDialog";
import ConfirmationDialog from "../components/ConfirmationDialog";
import TransactionItem from "../components/TransactionItem";

export default function BalanceHistoryPage({ onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // Data states
  const [currentUser, setCurrentUser] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Balance Check states
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [isBalancePinOpen, setIsBalancePinOpen] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSent, setShowSent] = useState(true);
  const [showReceived, setShowReceived] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Dialog states (for sidebar)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fetch transactions based on filters
  const fetchTransactions = async (overrides = {}) => {
    try {
      setLoading(true);
      const params = {};
      
      const sFilter = overrides.status !== undefined ? overrides.status : statusFilter;
      const min = overrides.minAmount !== undefined ? overrides.minAmount : minAmount;
      const max = overrides.maxAmount !== undefined ? overrides.maxAmount : maxAmount;
      const start = overrides.startDate !== undefined ? overrides.startDate : startDate;
      const end = overrides.endDate !== undefined ? overrides.endDate : endDate;
      const currentPage = overrides.page !== undefined ? overrides.page : page;
      const search = overrides.search !== undefined ? overrides.search : searchQuery;

      if (sFilter !== "All") params.status = sFilter;
      
      if (showSent && !showReceived) {
        params.type = "Paid";
      } else if (!showSent && showReceived) {
        params.type = "Received";
      }
      
      if (min) params.min_amount = min;
      if (max) params.max_amount = max;
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      if (search) params.search = search;
      
      params.page = currentPage;
      params.limit = limit;

      const res = await api.get("/transactions", { params });
      let data = res.data.data || [];
      const total = res.data.total || 0;
      
      if (!showSent && !showReceived) {
        data = [];
      }

      setTransactions(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial user data
    const fetchUserData = async () => {
      try {
        const [userRes, usersRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/users")
        ]);
        setCurrentUser(userRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
    fetchTransactions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        setPage(1);
        fetchTransactions({ page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
        fetchTransactions({ page: newPage });
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("All");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
    fetchTransactions({
      status: "All",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: ""
    });
  };

  const handleApplyFilters = () => {
    fetchTransactions();
    setIsFilterOpen(false);
  };

  // Helper to resolve transaction details
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

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const { name } = getTransactionDetails(tx);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(searchLower) || 
           (tx.description && tx.description.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  const handleCheckBalance = async (pin) => {
    setBalanceError("");
    try {
      const res = await api.get("/wallet", {
        headers: { "X-Wallet-Pin": pin }
      });
      setBalance(res.data.balance);
      setShowBalance(true);
      setIsBalancePinOpen(false);
    } catch (err) {
      setBalanceError(err.response?.data?.detail || "Invalid PIN");
    }
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

  const handleDeleteTransaction = (txId) => {
    setTransactionToDelete(txId);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
        await api.delete(`/transactions/${transactionToDelete}`);
        setTransactions(prev => prev.filter(tx => tx.id !== transactionToDelete));
        setTransactionToDelete(null);
    } catch (err) {
        console.error("Failed to delete transaction", err);
        alert("Failed to delete transaction");
    }
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => navigate("/")
    },
    {
      label: "Profile",
      href: "#",
      icon: <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => setIsProfileOpen(true)
    },
    {
      label: "Settings",
      href: "#",
      icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => setIsSettingsOpen(true)
    },
    {
      label: "Logout",
      href: "#",
      icon: <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: onLogout
    },
  ];

  return (
    <>
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onDeleteAccount={handleDeleteUser}
      />
      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
      />

      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
          "h-screen"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
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
                  label: currentUser?.name || "User",
                  href: "#",
                  icon: (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                       {currentUser?.profileImage ? (
                          <img src={`http://localhost:8000/${currentUser.profileImage}`} alt="Profile" className="h-full w-full object-cover" />
                       ) : (
                          <IconUser className="h-full w-full text-neutral-500" />
                       )}
                    </div>
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
        
        <div className="flex flex-1 flex-col overflow-y-auto bg-white dark:bg-neutral-900">
            <div className="p-4 md:p-8 w-full max-w-4xl mx-auto flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/")}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <IconArrowLeft className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Balance & History</h1>
                </div>

                {/* Check Balance Card */}
                <div className="w-full bg-blue-500 dark:bg-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <IconWallet className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <h2 className="text-lg font-medium opacity-90">Total Balance</h2>
                        <div className="mt-2">
                            {showBalance ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">₹{balance?.toLocaleString()}</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsBalancePinOpen(true)}
                                    className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    Check Balance
                                </button>
                            )}
                        </div>
                        {currentUser && (
                            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm opacity-80">
                                <span>{currentUser.name}</span>
                                <span>{currentUser.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Payment History</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm border-none outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-64 transition-all"
                                />
                            </div>
                            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen} modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-2 text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                        <IconFilter className="h-4 w-4" />
                                        <span>Filter</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-4" align="end" maxHeight={400}>
                                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                        <DropdownMenuLabel className="sticky top-0 -mt-2 -mx-2 py-3 backdrop-blur-xl z-20 text-center border-b border-neutral-200/50 dark:border-neutral-800/50 mb-4">
                                            Filter Transactions
                                        </DropdownMenuLabel>
                                        
                                        <div className="mb-4">
                                            <h4 className="mb-2 text-sm font-medium">Status</h4>
                                            <select 
                                                className="w-full p-2 border rounded-md text-sm bg-background outline-none focus:ring-2 focus:ring-neutral-500"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="success">Success</option>
                                                <option value="pending">Pending</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>

                                        <DropdownMenuSeparator />

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div>
                                                <Label className="text-xs mb-1 block">Min Amount</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    className="h-8 text-xs" 
                                                    value={minAmount}
                                                    onChange={(e) => setMinAmount(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Max Amount</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="Max" 
                                                    className="h-8 text-xs" 
                                                    value={maxAmount}
                                                    onChange={(e) => setMaxAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <Label className="text-xs mb-1 block">Start Date</Label>
                                                <Input 
                                                    type="date" 
                                                    className="h-8 text-xs" 
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">End Date</Label>
                                                <Input 
                                                    type="date" 
                                                    className="h-8 text-xs" 
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />
                                        
                                        <div className="flex justify-between gap-2 mt-4">
                                            <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full text-xs h-8">
                                                Clear All
                                            </Button>
                                            <Button size="sm" onClick={handleApplyFilters} className="w-full text-xs h-8">
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <button className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                                <IconDownload className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-h-[400px]">
                        {loading ? (
                            <div className="text-center py-10 text-neutral-500">Loading history...</div>
                        ) : transactions.length > 0 ? (
                            <>
                                {transactions.map((tx) => (
                                    <TransactionItem 
                                        key={tx.id} 
                                        tx={tx} 
                                        users={users} 
                                        onDelete={handleDeleteTransaction} 
                                    />
                                ))}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <IconChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                                        </button>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <IconChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-neutral-500 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
                                No transactions found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <PinDialog 
        isOpen={isBalancePinOpen}
        mode="enter"
        onSubmit={handleCheckBalance}
        onCancel={() => setIsBalancePinOpen(false)}
        error={balanceError}
        title="Enter PIN to Check Balance"
      />
      
      <ConfirmationDialog 
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={confirmDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action cannot be undone."
        confirmText="Delete"
        type="danger"
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

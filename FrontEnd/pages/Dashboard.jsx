"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconSend,
  IconPlus,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import api from "../api/api";
import AddMoneyDialog from "../components/AddMoneyDialog";
import PinDialog from "../components/PinDialog";
import SettingsDialog from "../components/SettingsDialog";
import ProfileDialog from "../components/ProfileDialog";
import SpendingAnalytics from "../components/SpendingAnalytics";

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Add Money state
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  
  // Profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // PIN related state
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinMode, setPinMode] = useState("enter"); // 'enter' or 'set'
  const [pinError, setPinError] = useState("");
  const [sessionPin, setSessionPin] = useState(null); // Store PIN for session (optional, but helps with refreshes if we wanted)

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await api.get("/users/me");
        setUser(me.data);

        // Check if user has PIN
        if (!me.data.pin) {
            setPinMode("set");
            setIsPinDialogOpen(true);
        }
      } catch (e) {
        console.error("Failed to load user", e);
      }
    }
    loadUser();
  }, []);

  const handlePinSubmit = async (pin) => {
    setPinError("");
    try {
        if (pinMode === "set") {
            await api.post("/auth/set-pin", { pin });
            setPinMode("enter");
            // Automatically try to fetch wallet with the new PIN
            await fetchWalletData(pin);
            setIsPinDialogOpen(false);
        } else {
            await fetchWalletData(pin);
            setIsPinDialogOpen(false);
        }
        setSessionPin(pin); // Keep it if needed for child components, though strictly they should ask again
    } catch (e) {
        console.error("PIN Action failed", e);
        setPinError(e.response?.data?.detail || "Invalid PIN");
    }
  };

  const fetchWalletData = async (pin) => {
      const walletRes = await api.get("/wallet", {
          headers: { "X-Wallet-Pin": pin }
      });
      const tx = await api.get("/transactions/recent");
      setWallet(walletRes.data);
      setTransactions(tx.data);
  };
  
  const refreshWallet = async () => {
      // If we have a session PIN (which we do after unlock), use it to refresh
      if (sessionPin) {
          try {
            const walletRes = await api.get("/wallet", {
                headers: { "X-Wallet-Pin": sessionPin }
            });
            setWallet(walletRes.data);
            
            // Also refresh transactions
            const tx = await api.get("/transactions/recent");
            setTransactions(tx.data);
          } catch (e) {
              console.error("Failed to refresh wallet", e);
          }
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

  const links = [
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

  return (
    <>
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        wallet={wallet}
        onDeleteUser={handleDeleteUser}
        onCheckBalance={() => {
            setIsSettingsOpen(false);
            navigate('/history');
        }}
      />
      <AddMoneyDialog 
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        refreshWallet={refreshWallet}
      />
      <ProfileDialog 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />
      <PinDialog  
        isOpen={isPinDialogOpen}
        mode={pinMode}
        onSubmit={handlePinSubmit}
        onCancel={pinMode === "enter" ? () => setIsPinDialogOpen(false) : undefined}
        error={pinError}
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
                label: user ? user.name : "User",
                href: "#",
                icon: (
                  <div 
                    className="h-7 w-7 rounded-full bg-neutral-300 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-700 border border-neutral-200 dark:border-neutral-700"
                    onDragStart={(e) => e.preventDefault()}
                    draggable={false}
                  >
                    {user?.profileImage ? (
                        <img 
                            src={user.profileImage.startsWith("http") ? user.profileImage : `http://localhost:8000/${user.profileImage}`} 
                            alt="User" 
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                    ) : (
                        user ? user.name.charAt(0).toUpperCase() : "U"
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
      <DashboardContent 
        user={user} 
        wallet={wallet} 
        transactions={transactions} 
        refreshWallet={refreshWallet}
        onAddMoneyClick={() => setIsAddMoneyOpen(true)}
      />
    </div>
    </>
  );
}

export const Logo = () => {
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

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

// Dashboard component with content
const DashboardContent = ({ user, wallet, transactions, refreshWallet, onAddMoneyClick }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-1 p-10 items-center justify-center">
        <div className="animate-pulse flex flex-col gap-4 w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto">
        
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
            Welcome back, {user.name}
          </h2>
          <p className="text-neutral-500 mt-2">Manage your wallet and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            onClick={() => navigate('/history')}
            className="p-6 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-xl cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between"
          >
             <div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <IconBrandTabler className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Balance & History</h3>
                <p className="text-sm opacity-80 mt-1">Check balance and transactions</p>
             </div>
             <div className="flex items-center gap-2 text-sm font-medium mt-4">
                <span>View Details</span>
                <IconArrowLeft className="w-4 h-4 rotate-180" />
             </div>
          </div>

          <div 
            onClick={() => navigate('/transfer')}
            className="p-6 rounded-xl bg-blue-600 text-white shadow-xl cursor-pointer hover:bg-blue-700 transition-colors flex flex-col justify-between"
          >
             <div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <IconSend className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Transfer Money</h3>
                <p className="text-sm opacity-80 mt-1">Send money to friends instantly</p>
             </div>
             <div className="flex items-center gap-2 text-sm font-medium mt-4">
                <span>Send Now</span>
                <IconArrowLeft className="w-4 h-4 rotate-180" />
             </div>
          </div>

          <div 
            onClick={onAddMoneyClick}
            className="p-6 rounded-xl bg-green-600 text-white shadow-xl cursor-pointer hover:bg-green-700 transition-colors flex flex-col justify-between"
          >
             <div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <IconPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Add Money</h3>
                <p className="text-sm opacity-80 mt-1">Top up your wallet</p>
             </div>
             <div className="flex items-center gap-2 text-sm font-medium mt-4">
                <span>Add Now</span>
                <IconArrowLeft className="w-4 h-4 rotate-180" />
             </div>
          </div>
        </div>

        <SpendingAnalytics transactions={transactions} />

      </div>
    </div>
  );
};

import React, { useState, useRef } from "react";
import { IconChevronRight, IconPencil, IconCamera, IconMail, IconLock, IconKey, IconId, IconUser, IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import api from "../api/api";

export default function ProfileDialog({ isOpen, onClose, user, onUpdateUser }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (user?.name) {
        setEditedName(user.name);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleNameUpdate = async () => {
    if (!editedName.trim() || editedName === user.name) {
        setIsEditingName(false);
        setEditedName(user.name);
        return;
    }

    try {
        const response = await api.put("/users/me", { name: editedName });
        onUpdateUser(response.data.user);
        setIsEditingName(false);
    } catch (error) {
        console.error("Failed to update name", error);
        alert("Failed to update name");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/users/me/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Update local user state with new image
      onUpdateUser({ ...user, profileImage: response.data.profileImage });
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    // Assuming backend is on localhost:8000
    return `http://localhost:8000/${path}`; 
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
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Profile</h2>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
            
            {/* Image & Name Section */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <div className={cn(
                        "w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center relative",
                        isUploading && "opacity-50"
                    )}>
                        {user.profileImage ? (
                            <img 
                                src={getImageUrl(user.profileImage)} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-neutral-400">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                        
                        {/* Overlay for hover */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <IconCamera className="text-white w-8 h-8" />
                        </div>
                    </div>
                    
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-md hover:bg-blue-700 transition-colors">
                        <IconPencil size={16} />
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                
                <h3 className="text-xl font-bold text-neutral-800 dark:text-white">{user.name}</h3>
            </div>

            {/* Basic Details Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Basic details</h4>
                
                <div className="space-y-6">
                    {/* Name (Editable) */}
                    <div className="group">
                        <label className="text-xs font-medium text-neutral-500 mb-1 flex items-center gap-1">
                            <IconUser size={14} /> Name
                        </label>
                        <div className={cn(
                            "flex items-center justify-between gap-2 h-10 px-3 rounded-lg border transition-all",
                            isEditingName 
                                ? "bg-white dark:bg-neutral-900 border-blue-500 ring-2 ring-blue-500/20" 
                                : "bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                        )}>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                disabled={!isEditingName}
                                className="flex-1 bg-transparent border-none text-base font-medium text-neutral-900 dark:text-neutral-100 outline-none disabled:cursor-default"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleNameUpdate();
                                    if (e.key === 'Escape') {
                                        setIsEditingName(false);
                                        setEditedName(user.name);
                                    }
                                }}
                                onBlur={() => {
                                    setIsEditingName(false);
                                    setEditedName(user.name);
                                }}
                                ref={(input) => { 
                                    if (input && isEditingName && document.activeElement !== input) {
                                        input.focus();
                                    }
                                }}
                            />
                            
                            {isEditingName ? (
                                <button 
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleNameUpdate} 
                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                                >
                                    <IconCheck size={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-md transition-colors"
                                >
                                    <IconPencil size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* User ID */}
                     <div className="group">
                        <label className="text-xs font-medium text-neutral-500 mb-1 flex items-center gap-1">
                            <IconId size={14} /> User ID
                        </label>
                        <div className="text-base font-medium text-neutral-800 dark:text-neutral-200 break-all">
                            {user.id}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="text-xs font-medium text-neutral-500 mb-1 flex items-center gap-1">
                            <IconMail size={14} /> Email ID
                        </label>
                        <div className="text-base font-medium text-neutral-800 dark:text-neutral-200">
                            {user.email}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group">
                        <label className="text-xs font-medium text-neutral-500 mb-1 flex items-center gap-1">
                            <IconLock size={14} /> Password
                        </label>
                        <div className="text-base font-medium text-neutral-800 dark:text-neutral-200 font-mono">
                            {user.password}
                        </div>
                    </div>

                    {/* PIN */}
                    <div className="group">
                        <label className="text-xs font-medium text-neutral-500 mb-1 flex items-center gap-1">
                            <IconKey size={14} /> PIN
                        </label>
                        <div className="text-base font-medium text-neutral-800 dark:text-neutral-200 font-mono tracking-widest">
                            {user.pin || "Not Set"}
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}

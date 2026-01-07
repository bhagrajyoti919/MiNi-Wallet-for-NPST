import React, { useState, useEffect } from "react";
import { IconLock } from "@tabler/icons-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";

export default function PinDialog({ isOpen, mode, onSubmit, onCancel, error, isLoading = false }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setConfirmPin("");
      setLocalError("");
      setResetKey(prev => prev + 1);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setLocalError("");

    if (pin.length < 6) {
        setLocalError("Please enter a complete 6-digit PIN");
        return;
    }

    if (mode === "set") {
        if (confirmPin.length < 6) {
            setLocalError("Please confirm your PIN");
            return;
        }
        if (pin !== confirmPin) {
          setLocalError("PINs do not match");
          return;
        }
    }
    
    onSubmit(pin);
  };

  const renderOtpInput = (onCompleteHandler, keySuffix = "") => (
    <InputOTP 
        key={`otp-${resetKey}-${keySuffix}`}
        maxLength={6} 
        mask={true} 
        maskDelay={1200}
        onComplete={onCompleteHandler}
    > 
        <InputOTPGroup> 
            <InputOTPSlot index={0} /> 
            <InputOTPSlot index={1} /> 
            <InputOTPSlot index={2} /> 
        </InputOTPGroup> 
        <InputOTPSeparator separatorSymbol="+"  /> 
        <InputOTPGroup> 
            <InputOTPSlot index={3} /> 
            <InputOTPSlot index={4} /> 
            <InputOTPSlot index={5} /> 
        </InputOTPGroup> 
    </InputOTP> 
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <IconLock size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                {mode === "set" ? "Set Your PIN" : "Enter PIN"}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
                    {mode === "set" 
                        ? "Create a secure 6-digit PIN to protect your wallet." 
                        : "Please enter your 6-digit PIN to continue."}
                </p>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 w-full">
            {mode === "set" && <span className="text-sm font-medium text-neutral-500">Enter New PIN</span>}
            {renderOtpInput(setPin, "main")}
          </div>

          {mode === "set" && (
            <div className="flex flex-col items-center gap-3 w-full">
                <span className="text-sm font-medium text-neutral-500">Confirm PIN</span>
                {renderOtpInput(setConfirmPin, "confirm")}
            </div>
          )}

          {(error || localError) && (
            <p className="text-red-500 text-sm font-medium text-center">{localError || error}</p>
          )}

          <div className="flex gap-3 w-full mt-2">
            {onCancel && (
                <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium transition-colors"
                >
                Cancel
                </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : (mode === "set" ? "Set PIN" : "Submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

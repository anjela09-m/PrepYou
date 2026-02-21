import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const UIModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = "alert", // alert, confirm, prompt
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    inputPlaceholder = "",
    defaultValue = ""
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen && type === "prompt") {
            setInputValue(defaultValue);
        }

        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, type, defaultValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (type === "prompt") {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            <div className="relative bg-[#FDFBF7] rounded-[2rem] shadow-2xl shadow-teal-900/10 w-full max-w-md transform transition-all scale-100 border border-stone-100 overflow-hidden">
                {/* Header - Teal/Primary Gradient */}
                <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        {title || (type === "confirm" ? "Confirm Action" : type === "prompt" ? "Input Required" : "Notice")}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {message && (
                        <p className="text-text-primary font-serif text-lg leading-relaxed">
                            {message}
                        </p>
                    )}

                    {type === "prompt" && (
                        <div>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={inputPlaceholder}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-text-primary placeholder:text-text-muted resize-none min-h-[100px]"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex items-center gap-4 justify-end">
                    {type !== "alert" && (
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-3 rounded-xl text-text-muted font-bold hover:bg-stone-100 hover:text-text-primary transition-all text-sm uppercase tracking-wide disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (type === "prompt" && !inputValue.trim())}
                        className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-teal-900/10 transition-all text-sm uppercase tracking-wide transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${type === "alert" ? "bg-primary hover:bg-brand-ink w-full" : "bg-primary hover:bg-brand-ink"
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            confirmText || "OK"
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UIModal;

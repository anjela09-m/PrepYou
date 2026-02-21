import React, { useState } from "react";
import "./RegenerateModal.css";

const RegenerateModal = ({ isOpen, onClose, onConfirm, isRegenerating }) => {
    const [prompt, setPrompt] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(prompt);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Regenerate Plan</h2>
                <p>Tell the AI what you'd like to change about this plan.</p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="regenerate-input"
                        placeholder="e.g., 'Too many math problems', 'Focus more on Coding today', 'Make it lighter'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                    />

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isRegenerating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-confirm"
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? "Regenerating..." : "Regenerate"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegenerateModal;

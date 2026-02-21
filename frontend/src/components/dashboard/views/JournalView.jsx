import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createEntry, getEntries } from "../../../api/journalApi";
import UIModal from "../../common/UIModal";

const JournalView = () => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState([]);
    const [sentiment, setSentiment] = useState(null);
    const [sentimentSkipped, setSentimentSkipped] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

    const fetchEntries = async () => {
        try {
            const res = await getEntries();
            setEntries(res.data);
        } catch (error) {
            console.error("Failed to fetch journals", error);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        try {
            const res = await createEntry(content);
            setSentiment(res.data.sentiment);
            setSentimentSkipped(res.data.sentimentSkipped || false);
            setContent("");
            fetchEntries();

            if (res.data.sentimentSkipped) {
                toast("Journal saved. AI limit reached for this month.", {
                    icon: '📝',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            } else {
                toast.success("Reflection analyzed!");
            }
        } catch (error) {
            setErrorModal({
                isOpen: true,
                message: "Failed to save entry: " + (error.response?.data?.message || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    const getSentimentEmoji = (s) => {
        switch (s?.toLowerCase()) {
            case 'motivated': return '🔥';
            case 'neutral': return '😐';
            case 'stressed': return '😰';
            case 'demotivated': return '📉';
            default: return '🧠';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
            <UIModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                type="alert"
                title="Journal Error"
                message={errorModal.message}
                onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
            />
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl -z-10 -mr-40 -mt-40"></div>

                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter leading-tight">
                        Daily <span className="text-primary">Journal</span>
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <textarea
                            className="w-full rounded-[2.5rem] border-gray-100 bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/5 p-8 text-lg font-bold transition-all min-h-[200px] shadow-inner"
                            placeholder="How was your learning today? What felt challenging?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-8">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">AI Analysis Active</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {sentiment && (
                            <div className={`flex items-center space-x-4 p-4 rounded-2xl border animate-in zoom-in duration-500 ${sentimentSkipped ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                                <div className="text-3xl">{getSentimentEmoji(sentiment)}</div>
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${sentimentSkipped ? 'text-amber-500' : 'text-indigo-400'}`}>
                                        {sentimentSkipped ? 'AI Limit Reached' : 'AI Detected State'}
                                    </p>
                                    <p className={`text-sm font-black capitalize ${sentimentSkipped ? 'text-amber-700' : 'text-indigo-700'}`}>
                                        {sentimentSkipped ? 'Saved (No Analysis)' : sentiment}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="ml-auto bg-primary text-white h-16 px-12 rounded-3xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                        >
                            {loading ? "Analyzing..." : "Reflect & Save"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-black text-text-primary px-4 tracking-tight">Previous Reflections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entries.map((entry) => (
                        <div key={entry._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    {new Date(entry.date).toLocaleDateString()}
                                </span>
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg border border-gray-100 group-hover:scale-110 transition-transform">
                                    {getSentimentEmoji(entry.sentiment)}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-text-primary leading-relaxed line-clamp-3">
                                {entry.content}
                            </p>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 text-center">
                            <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No reflections yet. Start your journey today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JournalView;

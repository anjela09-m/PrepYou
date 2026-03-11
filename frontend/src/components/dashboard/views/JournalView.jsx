import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createEntry, getEntries } from "../../../api/journalApi";
import UIModal from "../../common/UIModal";
import { useAuth } from "../../../context/AuthContext";

const JournalView = () => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState([]);
    const [sentiment, setSentiment] = useState(null);
    const [sentimentSkipped, setSentimentSkipped] = useState(false);
    const [motivationalQuote, setMotivationalQuote] = useState("");
    const [isStackExpanded, setIsStackExpanded] = useState(false);
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
            setMotivationalQuote(res.data.motivationalQuote || "");
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
            <div className="bg-gradient-to-br from-orange-50/80 to-pink-50/80 p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-orange-100/50 border border-orange-100/50 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-3xl -z-0 -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-200/30 to-rose-200/30 rounded-full blur-3xl -z-0 -ml-40 -mb-40"></div>

                <div className="mb-10 text-center md:text-left relative z-10">
                    <h2 className="text-4xl font-black text-rose-950 tracking-tighter leading-tight">
                        Daily <span className="text-orange-500">Journal</span>
                    </h2>
                    <p className="text-rose-800/80 mt-2 max-w-md font-bold text-lg italic tracking-tight">...let it all out {user?.name ? user.name.split(' ')[0] : ''}, feel free!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="relative group">
                        <textarea
                            className="w-full rounded-[2.5rem] bg-white/60 border border-rose-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-200/50 p-8 text-lg font-bold text-rose-950 placeholder-rose-900/30 transition-all min-h-[220px] shadow-inner backdrop-blur-md"
                            placeholder="How was your learning today? What felt challenging?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {sentiment && (
                            <div className={`flex items-center space-x-4 p-4 rounded-2xl border animate-in zoom-in duration-500 backdrop-blur-md ${sentimentSkipped ? 'bg-amber-100/50 border-amber-200' : 'bg-orange-100/50 border-orange-200'}`}>
                                <div className="text-3xl drop-shadow-sm">{getSentimentEmoji(sentiment)}</div>
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${sentimentSkipped ? 'text-amber-600' : 'text-orange-500'}`}>
                                        {sentimentSkipped ? 'AI Limit Reached' : 'AI Detected State'}
                                    </p>
                                    <p className={`text-sm font-black capitalize ${sentimentSkipped ? 'text-amber-800' : 'text-orange-900'}`}>
                                        {sentimentSkipped ? 'Saved (No Analysis)' : sentiment}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="ml-auto bg-gradient-to-r from-orange-400 to-rose-400 text-white h-16 px-12 rounded-3xl font-black text-lg hover:from-orange-500 hover:to-rose-500 transition-all shadow-xl shadow-orange-200 active:scale-95 disabled:opacity-50 disabled:grayscale w-full md:w-auto"
                        >
                            {loading ? "Analyzing..." : "Reflect & Save"}
                        </button>
                    </div>
                </form>

                {motivationalQuote && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-teal-100 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom relative z-10 backdrop-blur-md flex gap-5 items-center">
                        <div className="text-4xl">✨</div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-teal-600 font-bold mb-1">Dedicated Neural Motivation</p>
                            <p className="text-xl font-bold leading-tight text-emerald-950">"{motivationalQuote}"</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Previous Reflections</h3>
                    {entries.length > 0 && (
                        <button 
                            onClick={() => setIsStackExpanded(!isStackExpanded)}
                            className="text-xs font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-full"
                        >
                            {isStackExpanded ? "Stack Cards" : "Spread Cards"}
                        </button>
                    )}
                </div>

                {entries.length === 0 ? (
                    <div className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[3rem] border border-dashed border-indigo-200 text-center">
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">No reflections yet. Start your journey today.</p>
                    </div>
                ) : (
                    <div 
                        className="relative w-full transition-all duration-700 ease-in-out" 
                        style={{ height: isStackExpanded ? `${entries.length * 200}px` : `${Math.min(entries.length * 30 + 150, 400)}px` }}
                    >
                        {entries.map((entry, idx) => {
                            // Reverse order for Solitaire feel so oldest is bottom, newest is top
                            const reverseIdx = entries.length - 1 - idx;
                            
                            // Visual calc
                            const topPosition = isStackExpanded ? idx * 180 : idx * 20;
                            const scale = isStackExpanded ? 1 : 1 - (reverseIdx * 0.05);
                            const zIndex = entries.length - idx;
                            const opacity = (isStackExpanded || idx < 5) ? 1 : 0; // Hide deep cards if stacked

                            const pastelColors = [
                                "from-blue-50 to-indigo-50 border-indigo-200/60 shadow-indigo-100/50 text-indigo-950 text-indigo-500",
                                "from-emerald-50 to-teal-50 border-teal-200/60 shadow-teal-100/50 text-teal-950 text-teal-600",
                                "from-amber-50 to-orange-50 border-orange-200/60 shadow-orange-100/50 text-orange-950 text-orange-600",
                                "from-pink-50 to-rose-50 border-rose-200/60 shadow-rose-100/50 text-rose-950 text-rose-500",
                                "from-purple-50 to-fuchsia-50 border-fuchsia-200/60 shadow-fuchsia-100/50 text-fuchsia-950 text-fuchsia-600"
                            ];
                            const theme = pastelColors[idx % pastelColors.length].split(" ");

                            return (
                                <div 
                                    key={entry._id} 
                                    className={`absolute w-[95%] md:w-[80%] left-0 right-0 mx-auto bg-gradient-to-br ${theme[0]} ${theme[1]} p-8 rounded-[2.5rem] border ${theme[2]} shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-700 ease-in-out group`}
                                    style={{
                                        top: `${topPosition}px`,
                                        transform: `scale(${Math.max(0.7, scale)}) translateY(${isStackExpanded ? 0 : 0}px)`,
                                        zIndex: zIndex,
                                        opacity: opacity,
                                        boxShadow: isStackExpanded 
                                            ? '0 20px 40px -10px rgba(0,0,0,0.05)' 
                                            : `0 ${reverseIdx === 0 ? 25 : 5}px ${reverseIdx === 0 ? 50 : 15}px -10px rgba(0,0,0,${reverseIdx === 0 ? 0.08 : 0.03})`
                                    }}
                                    onClick={() => !isStackExpanded && setIsStackExpanded(true)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] font-black ${theme[5]} uppercase tracking-widest bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm`}>
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className={`w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${theme[2]} group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                                            {getSentimentEmoji(entry.sentiment)}
                                        </div>
                                    </div>
                                    <p className={`text-base font-bold ${theme[4]} leading-relaxed ${!isStackExpanded && idx > 0 ? 'line-clamp-2 opacity-60' : ''}`}>
                                        {entry.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalView;

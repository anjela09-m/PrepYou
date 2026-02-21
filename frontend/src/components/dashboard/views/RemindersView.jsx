import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getUserProfile, updateUserSettings } from "../../../api/userApi";

const RemindersView = () => {
    const defaultReminders = [
        { id: '1', title: "Daily Study Session", time: "09:00 AM", type: "academic", active: true },
        { id: '2', title: "Journal Entry Reflection", time: "09:00 PM", type: "mindset", active: true },
    ];

    const [reminders, setReminders] = useState(() => {
        const saved = localStorage.getItem("prepyou_reminders");
        return saved ? JSON.parse(saved) : defaultReminders;
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: "", time: "09:00", type: "academic" });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sync with Backend on Mount
    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const res = await getUserProfile();
                if (res.data && res.data.reminders && res.data.reminders.length > 0) {
                    setReminders(res.data.reminders);
                    localStorage.setItem("prepyou_reminders", JSON.stringify(res.data.reminders));
                } else {
                    saveRemindersToBackend(reminders);
                }
            } catch (error) {
                console.error("Failed to sync reminders", error);
            }
        };
        fetchReminders();
    }, []);

    const saveRemindersToBackend = async (newRemindersList) => {
        setReminders(newRemindersList);
        localStorage.setItem("prepyou_reminders", JSON.stringify(newRemindersList));
        try {
            await updateUserSettings({ reminders: newRemindersList });
        } catch (error) {
            console.error("Failed to save reminders to backend", error);
        }
    };

    const toggleReminder = (id) => {
        const updated = reminders.map(r =>
            r.id === id ? { ...r, active: !r.active } : r
        );
        saveRemindersToBackend(updated);
        toast.success("Reminder status updated");
    };

    const handleEdit = (reminder) => {
        // Convert "09:00 AM" -> "09:00" for input
        const [timePart, modifier] = reminder.time.split(' ');
        let [hours, minutes] = timePart.split(':');

        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

        const time24 = `${hours.toString().padStart(2, '0')}:${minutes}`;

        setNewReminder({
            title: reminder.title,
            time: time24,
            type: reminder.type
        });
        setEditingId(reminder.id);
        setIsAdding(true);
    };

    const handleDelete = (id) => {
        const updated = reminders.filter(r => r.id !== id);
        saveRemindersToBackend(updated);
        toast.success("Reminder deleted");
        if (editingId === id) {
            setIsAdding(false);
            setEditingId(null);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Convert 24h to 12h for display
        const [h, m] = newReminder.time.split(":");
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = ((h % 12) || 12).toString().padStart(2, '0');
        const displayTime = `${hour12}:${m} ${suffix}`;

        if (editingId) {
            const updated = reminders.map(r =>
                r.id === editingId
                    ? { ...r, ...newReminder, time: displayTime }
                    : r
            );
            saveRemindersToBackend(updated);
            toast.success("Reminder updated!");
        } else {
            const id = Date.now().toString();
            const updated = [...reminders, { ...newReminder, id, time: displayTime, active: true }];
            saveRemindersToBackend(updated);
            toast.success("Reminder set successfully!");
        }

        setIsAdding(false);
        setEditingId(null);
        setNewReminder({ title: "", time: "09:00", type: "academic" });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-2">Punctuality <span className="text-primary italic">is Elite.</span></h2>
                    <p className="text-text-muted font-bold tracking-tight uppercase text-[10px] tracking-widest opacity-60">Manage your AI-suggested focus triggers.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewReminder({ title: "", time: "09:00", type: "academic" });
                        setIsAdding(true);
                        if (Notification.permission === 'default') {
                            Notification.requestPermission();
                        }
                    }}
                    className="bg-primary text-white h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    + Set Reminder
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-indigo-100/50 animate-in zoom-in duration-300">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Reminder Label</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-primary/5"
                                    placeholder="e.g. System Design Review"
                                    value={newReminder.title}
                                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-primary/5"
                                        value={newReminder.time}
                                        onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Type</label>
                                    <select
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-primary/5"
                                        value={newReminder.type}
                                        onChange={e => setNewReminder({ ...newReminder, type: e.target.value })}
                                    >
                                        <option value="academic">Academic</option>
                                        <option value="revision">Revision</option>
                                        <option value="mindset">Mindset</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                {editingId ? "Update Trigger" : "Activate Trigger"}
                            </button>
                            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-8 py-4 bg-gray-50 text-text-muted rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reminders.map((r) => (
                    <div key={r.id} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all duration-500 flex items-center justify-between group">
                        <div className="flex items-center space-x-5 cursor-pointer" onClick={() => handleEdit(r)}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${r.active ? 'bg-indigo-50 text-primary' : 'bg-gray-50 text-gray-300 opacity-60'}`}>
                                {r.type === 'academic' ? '📚' : r.type === 'revision' ? '⚡' : '✍️'}
                            </div>
                            <div>
                                <h4 className={`font-black tracking-tight transition-colors ${r.active ? 'text-text-primary' : 'text-text-muted'}`}>{r.title}</h4>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">{r.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleReminder(r.id); }}
                                className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner ${r.active ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ${r.active ? 'left-8' : 'left-1'}`}></div>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                                title="Delete Reminder"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-indigo-600 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="relative z-10 space-y-4">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/20">AI Strategic Suggestion</span>
                    <h3 className="text-2xl font-black leading-tight max-w-sm">"Your peak focus hours are between 10 AM and 12 PM. Consider adding a deep-work trigger then."</h3>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            </div>
        </div>
    );
};

export default RemindersView;

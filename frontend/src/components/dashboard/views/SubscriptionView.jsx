import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createOrder, verifyPayment, getSubscriptionStatus } from "../../../api/subscriptionApi";

const SubscriptionView = ({ onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [subData, setSubData] = useState(null);
    const [planDuration, setPlanDuration] = useState("monthly");

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await getSubscriptionStatus();
            setSubData(res.data);
        } catch (error) {
            console.error("Failed to fetch subscription", error);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await createOrder({ planDuration });
            const { id: order_id, currency, amount } = orderRes.data;

            // 2. Open Razorpay
            console.log("Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY_ID);

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_RDRydETJkRioj4",
                amount: amount.toString(),
                currency: currency,
                name: "PrepYou Pro",
                description: "Upgrade to Unlimited AI Access",
                image: "/logo.svg",
                order_id: order_id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planDuration
                        });
                        toast.success(verifyRes.data.message);
                        fetchStatus(); // Refresh UI
                        if (onUpdate) onUpdate();
                    } catch (error) {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: "User Name", // Ideally calculate from context
                    email: "user@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: "PrepYou Corporate Office"
                },
                theme: {
                    color: "#6366f1"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Upgrade error:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!subData) {
        return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent"></div></div>;
    }

    const isPro = subData.planType === "pro" && subData.status === "active";
    const usagePercent = isPro ? 0 : Math.min((subData.usageCount / subData.usageLimit) * 100, 100);

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter leading-tight">
                        Subscription Plan
                    </h2>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
                        Manage your access level
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Plan Card */}
                <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden transition-all duration-500 ${isPro ? 'bg-primary border-secondary text-white' : 'bg-white border-gray-100'}`}>
                    {isPro && <div className="absolute top-0 right-0 bg-gradient-to-bl from-accent to-secondary text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest">Premium Active</div>}

                    <div className="space-y-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4" style={{ backgroundColor: isPro ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }}>
                            {isPro ? '💎' : '🌱'}
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isPro ? 'text-secondary' : 'text-text-muted'}`}>Current Plan</p>
                            <h3 className={`text-3xl font-black ${isPro ? 'text-white' : 'text-text-primary'}`}>
                                {isPro ? 'PrepYou Pro' : 'Free Starter'}
                            </h3>
                        </div>

                        {!isPro && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                    <span>Usage This Month</span>
                                    <span>{subData.usageCount} / {subData.usageLimit}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-accent' : 'bg-primary'}`}
                                        style={{ width: `${usagePercent}%` }}
                                    ></div>
                                </div>
                                {usagePercent >= 100 && (
                                    <p className="text-xs font-bold text-accent mt-2">⚠️ Limit Reached. Upgrade to continue.</p>
                                )}
                            </div>
                        )}

                        {isPro && (
                            <div className="text-secondary text-sm font-semibold">
                                <p>✅ Unlimited AI Journal Analysis</p>
                                <p>✅ Usage limits removed</p>
                                <p>✅ Priority Support</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upgrade / Status Card */}
                <div className="p-8 bg-gradient-to-br from-background to-white rounded-[2.5rem] border border-secondary/20 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group">
                    {!isPro ? (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-text-primary">Upgrade to Pro</h3>
                                <p className="text-sm font-bold text-text-muted max-w-xs mx-auto">Get unlimited AI insights and power up your preparation.</p>
                            </div>

                            {/* Plan Toggle */}
                            <div className="bg-white border border-gray-100 p-1 rounded-full flex items-center relative w-full max-w-[200px] mx-auto shadow-sm">
                                <div className={`absolute top-1 bottom-1 w-[48%] bg-primary rounded-full shadow-sm transition-all duration-300 ${planDuration === 'monthly' ? 'left-1' : 'left-[51%]'}`}></div>
                                <button
                                    onClick={() => setPlanDuration("monthly")}
                                    className={`flex-1 relative z-10 text-[10px] font-black uppercase tracking-widest py-2 transition-colors ${planDuration === 'monthly' ? 'text-white' : 'text-text-muted'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setPlanDuration("yearly")}
                                    className={`flex-1 relative z-10 text-[10px] font-black uppercase tracking-widest py-2 transition-colors ${planDuration === 'yearly' ? 'text-white' : 'text-text-muted'}`}
                                >
                                    Yearly
                                </button>
                            </div>

                            <div className="text-4xl font-black text-primary transition-all duration-300">
                                {planDuration === 'monthly' ? (
                                    <>₹199<span className="text-base text-text-muted font-bold">/mo</span></>
                                ) : (
                                    <>₹1,599<span className="text-base text-text-muted font-bold">/yr</span></>
                                )}
                            </div>

                            {planDuration === 'yearly' && (
                                <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Save 33%</span>
                            )}

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full max-w-xs py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-accent/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : `⚡ Upgrade ${planDuration === 'monthly' ? 'Monthly' : 'Yearly'}`}
                            </button>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest pt-4">Secured by Razorpay</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-4xl mb-2">🎉</div>
                            <h3 className="text-xl font-black text-text-primary">You're all set!</h3>
                            <p className="text-sm font-bold text-text-muted">Thanks for being a Pro member.</p>
                            <p className="text-xs text-text-muted mt-4">Next billing date: {new Date(subData.endDate).toLocaleDateString()}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-8 pb-4">
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Plan Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-text-muted text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-4">Feature</th>
                                <th className="px-8 py-4 text-center">
                                    Free Starter
                                    <span className="block text-[9px] font-bold text-text-muted mt-1 normal-case tracking-normal opacity-70">Performance-based smart planning</span>
                                </th>
                                <th className="px-8 py-4 text-center text-primary">
                                    Pro Plan
                                    <span className="block text-[9px] font-bold text-secondary mt-1 normal-case tracking-normal opacity-80">Emotion-aware adaptive intelligence</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { feature: "Journal Writing", free: "Unlimited", pro: "Unlimited" },
                                { feature: "AI Sentiment Analysis", free: "10 / month", pro: "Unlimited" },
                                { feature: "Performance-based Adaptation", free: "Yes", pro: "Yes" },
                                { feature: "Emotional Adaptation", free: "Limited", pro: "Unlimited" },
                                { feature: "Weekly Reflection Summary", free: "Basic", pro: "Advanced" },
                                { feature: "Mood-Performance Graph", free: "No", pro: "Yes" }
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 font-bold text-text-primary">{row.feature}</td>
                                    <td className="px-8 py-4 text-center font-medium text-text-muted">{row.free}</td>
                                    <td className="px-8 py-4 text-center font-bold text-primary bg-primary/5">{row.pro}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionView;

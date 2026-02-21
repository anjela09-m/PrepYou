import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const ReminderNotifier = () => {
    const lastNotifiedRef = useRef(null);

    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    useEffect(() => {
        // Request notification permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'

            // Format: "09:00 AM" (pad hours with 0)
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

            // Prevent multiple notifications in the same minute
            if (lastNotifiedRef.current === formattedTime) {
                return;
            }

            const saved = localStorage.getItem("prepyou_reminders");
            if (!saved) return;

            try {
                const reminders = JSON.parse(saved);
                let notified = false;

                reminders.forEach(reminder => {
                    // Check if reminder is active and time matches
                    if (reminder.active && reminder.time === formattedTime) {

                        const title = `Reminder: ${reminder.title}`;
                        const body = `It's time for your ${reminder.type} session!`;

                        // Browser Notification
                        if (Notification.permission === "granted") {
                            new Notification(title, {
                                body: body,
                                icon: '/favicon.ico' // Use favicon as icon
                            });
                        }

                        // App Toast (Visible if app is in foreground)
                        toast(title, {
                            icon: '⏰',
                            duration: 6000,
                            style: {
                                borderRadius: '10px',
                                background: '#333',
                                color: '#fff',
                            },
                        });

                        notified = true;
                    }
                });

                if (notified) {
                    playNotificationSound();
                }

                // Update last notified time only if we processed this minute
                lastNotifiedRef.current = formattedTime;

            } catch (error) {
                console.error("Error parsing reminders:", error);
            }
        };

        // Check every 10 seconds
        const intervalId = setInterval(checkReminders, 10000);

        // Initial check
        checkReminders();

        return () => clearInterval(intervalId);
    }, []);

    return null; // Logic-only component
};

export default ReminderNotifier;

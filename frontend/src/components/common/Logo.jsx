import React from 'react';

const Logo = ({ className = "w-8 h-8", color = "currentColor" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Target Circle (Focus) */}
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />

            {/* Lightbulb Base Curve (Insight) - Bottom of the bulb inside */}
            <path d="M9 16C9 16 9.5 17 12 17C14.5 17 15 16 15 16" stroke={color} strokeWidth="2" strokeLinecap="round" />

            {/* Upward Growth Arrow (Progress) - Rising from center */}
            <path d="M12 13V7M12 7L9.5 9.5M12 7L14.5 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Spark/Ideas */}
            <path d="M16 10L17 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M8 10L7 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
};

export const ArrowLogo = ({ className = "w-6 h-6" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export { Logo };
export default ArrowLogo;

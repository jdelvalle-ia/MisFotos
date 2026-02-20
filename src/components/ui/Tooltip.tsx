import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top', className = 'w-fit' }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Margen reducido para que se acerque más al elemento
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
        left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
        right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    };

    return (
        <div
            className={`relative flex items-center group ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md shadow-lg shadow-indigo-500/30 whitespace-nowrap opacity-100 transition-opacity duration-200 pointer-events-none border border-indigo-400/50 ${positionClasses[position]}`}
                    role="tooltip"
                >
                    {text}
                    {/* Flecha indicadora */}
                    <div className={`absolute w-2.5 h-2.5 bg-indigo-600 border-indigo-400/50 transform rotate-45 ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' :
                        position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' :
                            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
                                'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
                        }`}></div>
                </div>
            )}
        </div>
    );
};

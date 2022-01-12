import React from 'react'
import { useTheme } from '../contexts/ThemeContext';

export default function ToggleIcon({ active, onClick, caption, tooltip }) {
    const theme = useTheme();

    const iconStyle = {
        cursor: "pointer",
        margin: "0 3px"
    };
    return (
        <div style={iconStyle} onClick={(e) => onClick && onClick()} title={tooltip && tooltip}>
            <svg viewBox="-50 -50 100 100" height="20px" width="20px">
                <rect x="-50" y="-50" height="100" width="100" rx="30" ry="30" fill={active ? theme.accent1 : theme.accent2}/>
                <text x="0" y="0" fill="white" fontSize="50" textAnchor="middle" dominantBaseline="middle">{caption && caption}</text>
            </svg>
        </div>
    )
}

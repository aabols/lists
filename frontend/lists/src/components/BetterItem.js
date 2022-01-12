import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useDrag } from 'react-dnd';

export default function BetterItem({ item, toggle, rename, move }) {
    const theme = useTheme();
    const [collected, drag, dragPreview] = useDrag(() => ({
        type: 'item',
        end: (dragItem, monitor) => {
            if (!monitor.didDrop()) return;
            const dropResult = monitor.getDropResult();
            move(item, dropResult.id);
        },
        item: {...item}
    }));

    function handleClick(e) {
        toggle(item);
    }

    function handleRightClick(e) {
        e.preventDefault();
        rename(item);
    }

    const itemStyle={
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        margin: "0 2px",
        cursor: "pointer"
    };
    const captionStyle = {
        textAlign: "left",
        fontSize: theme.fontSize - 0.2 + "em"
    };
    return (
        <div ref={drag} style={itemStyle} onClick={handleClick} onContextMenu={handleRightClick}>
            <input type="checkbox" readOnly checked={item.checked}/>
            <div style={captionStyle}>
                {item.caption}
            </div>
        </div>
    )
}
import React, { useState, useEffect } from 'react';
import uuid from 'react-uuid';
import BetterItem from './BetterItem';
import { useTheme } from '../contexts/ThemeContext';
import useLanisServer from '../hooks/useLanisServer';
import fetchLanis from '../functions/fetchLanis';
import { useAuth } from '../contexts/AuthContext';
import { useDev } from '../contexts/DevContext';
import { useDrop, useDrag } from 'react-dnd';

export default function BetterList({ list, onCaptionRightClick }) {
    const auth = useAuth();
    const devMode = useDev();
    const [items, setItems] = useLanisServer({
        type: "item",
        jwt: auth.token,
        filter: list.id,
        refreshRate: 1000
    });
    const theme = useTheme();
    const [, drop] = useDrop(() => ({
        accept: 'item',
        canDrop: (item, monitor) => item.listId !== list.id,
        drop: (item, monitor) => {
            return list;
        }
    }));

    function toggleItem(item) {
        let newItems = items.map(prevItem => prevItem.id === item.id ? {...prevItem, checked: 1 - prevItem.checked, modified: Date.now()} : {...prevItem});
        setItems(newItems);
    }

    function renameItem(item) {
        let newCaption = window.prompt("Rename item", item.caption);
        if (newCaption === '') {
            // old way of deleting
            // let newItems = items.filter(prevItem => prevItem.id !== item.id);
            let newItems = items.map(prevItem => prevItem.id === item.id ? {...prevItem, modified: Date.now(), active: 1-prevItem.active} : prevItem);
            setItems(newItems);
            return;
        }
        if (!newCaption) {
            return;
        }
        let newItems = items.map(prevItem => prevItem.id === item.id ? {...prevItem, caption: newCaption, modified: Date.now()} : {...prevItem});
        setItems(newItems);
    }

    function addItem(caption) {
        let newItems = [...items, {
            id: uuid(),
            listId: list.id,
            caption: caption,
            checked: 0,
            modified: Date.now(),
            seqNo: 0,
            active: 1
        }];
        setItems(newItems);
    }

    async function moveItem(item, targetListId) {
        const res = await fetchLanis({
            jwt: auth.token,
            action: 'update',
            type: 'item',
            payload: [{...item, modified: Date.now(), listId: targetListId}]
        }, devMode);
        setItems(prev => prev.filter(f => f.id !== item.id));
    }

    function handleNewItemKeyPress(e) {
        if (e.charCode === 13) {
            e.preventDefault();
            addItem(e.target.innerText);
            e.target.innerText = "";
        }
    }

    function handleCaptionRightClick(e) {
        e.preventDefault();
        onCaptionRightClick(list);
    }

    //#region styles
    const fieldsetStyle = {
        display: (theme?.shoppingMode && items?.filter(item => !item.checked).length === 0) ? "none" : "flex",
        flexDirection: "column",
        marginTop: "5px",
        textAlign: "center",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: theme.accent1,
        color: theme.accent1,
        borderRadius: "5px",
        minWidth: "100px",
        // maxWidth: "100%",
        // flexGrow: 1,
        padding: "0 2px 2px 2px",
        order: items?.length
    };
    const legendStyle = {
        margin: "0 auto",
        cursor: "pointer",
        padding: "0 5px",
        fontSize: theme.fontSize + "em"
    };
    const textBoxStyle = {
        border: "1px solid #ccc",
        padding: "1px 6px",
        cursor: true ? "auto" : "pointer",
        fontSize: theme.fontSize + "em",
        flexGrow: "1",
        margin: "3px 5px"
    };
    //#endregion

    return (
        list ? <fieldset style={fieldsetStyle} ref={drop}>
            <legend style={legendStyle} onContextMenu={handleCaptionRightClick}>
                {list.caption}
            </legend>
            <div role="textbox" contentEditable suppressContentEditableWarning style={textBoxStyle} onKeyPress={handleNewItemKeyPress}></div>
            {
                items && items.filter(item => !theme.shoppingMode || !item.checked).filter(item => item.active === 1).sort((a,b) => a.caption < b.caption ? -1 : 0).map(item => {
                    return (
                        <BetterItem key={item.id} item={item} toggle={toggleItem} rename={renameItem} move={moveItem}/>
                        )
                    })
            }
        </fieldset> : null
    )
}
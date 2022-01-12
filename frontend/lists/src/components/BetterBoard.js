import React, { useState, useEffect } from 'react';
import uuid from 'react-uuid';
import useLanisServer from '../hooks/useLanisServer';
import fetchLanis from '../functions/fetchLanis';
import BetterList from './BetterList';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useDev } from '../contexts/DevContext';
import { useDrop } from 'react-dnd';

export default function BetterBoard({ match }) {
    const auth = useAuth();
    const devMode = useDev();
    const boardId = match.params.id;
    const [lists, setLists] = useLanisServer({
        type: "list",
        filter: boardId,
        jwt: auth.token,
        refreshRate: 5000
    });
    const [, drop] = useDrop(() => ({
        accept: 'list',
        canDrop: (list, monitor) => list.boardId !== boardId,
        drop: (list, monitor) => boardId
    }));

    function addList(){
        let caption = window.prompt("Give your group a caption");
        if (!caption) return;
        let newLists = [...lists, {
            id: uuid(),
            boardId: boardId,
            caption: caption,
            modified: Date.now(),
            seqNo: 0,
            active: 1
        }];
        setLists(newLists);
    }

    function renameList(list) {
        let caption = window.prompt("Rename list", list.caption);
        if (caption === "") {
            let confirmDelete = window.prompt("Are you sure?","no");
            if (confirmDelete === "yes") {
                // old way of deleting
                // let newLists = lists.filter(prevList => prevList.id !== list.id);
                let newLists = lists.map(prevList => prevList.id === list.id ? {...prevList, modified: Date.now(), active: 1-prevList.active} : prevList);
                setLists(newLists);
            }
            return;
        }
        if (!caption) return;
        let newLists = lists.map(prevList => prevList.id === list.id ? {...prevList, caption: caption, modified: Date.now()} : prevList);
        setLists(newLists);
    }

    //#region styles
    const containerStyle = {
        maxHeight: "calc(100vh - 35px - 16px)",
        overflowY: "auto"
    };
    const boardStyle = {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        alignItems: "flex-start"
    };
    const breakStyle={
        flexBasis: "100%",
        height: "0"
    };
    //#endregion

    return (
        <div style={containerStyle}>
            <div style={boardStyle}>
                <Button caption="+Group" onClick={addList}/>
                <div style={breakStyle}></div>
                {
                    lists && lists.filter(list => list.active === 1).map(list => {
                        return (
                            <BetterList key={list.id} list={list} onCaptionRightClick={renameList}/>
                        );
                    })
                }
            </div>
        </div>
    )
}
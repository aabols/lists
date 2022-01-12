import React, { useState, useEffect } from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import fetchLanis from '../functions/fetchLanis';
import fetchLanisShare from '../functions/fetchLanisShare';
import useLanisServer from '../hooks/useLanisServer';
import BetterBoard from './BetterBoard';
import { useTheme, useThemeUpdate } from '../contexts/ThemeContext';
import Button from './Button';
import uuid from 'react-uuid';
import ToggleIcon from './ToggleIcon';
import { useAuth } from '../contexts/AuthContext';
import { useDev } from '../contexts/DevContext';

export default function BetterLists() {
    const auth = useAuth();
    const [boards, setBoards] = useLanisServer({
        type: "board",
        filter: "",
        jwt: auth.token,
        refreshRate: 10000
    });
    const theme = useTheme();
    const setTheme = useThemeUpdate();
    const [sharePopup, setSharePopup] = useState(false);
    const [shareRecipients, setShareRecipients] = useState();
    const [users, setUsers] = useState([]);

    const devMode = useDev();

    useEffect(() => {
        async function fetchUsers() {
            const serverResponse = await fetchLanis({
                type: "user",
                jwt: auth.token,
                action: "select"
            }, devMode);
            const receivedUsers = await serverResponse.json();
            setUsers(receivedUsers);
        }

        fetchUsers();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        async function fetchOwners() {
            const serverResponse = await fetchLanisShare({
                jwt: auth.token,
                action: "view",
                resourceId: boards.find(b => window.location.href.includes(b.id)).id
            }, devMode);
            if (serverResponse.status !== 200) {
                const err = await serverResponse.text();
                console.log(err);
                return;
            };
            const receivedUsers = await serverResponse.json();
            setShareRecipients(receivedUsers);
        }

        !sharePopup && setShareRecipients(undefined);
        sharePopup && fetchOwners();

    }, [sharePopup]);

    function addBoard() {
        let caption = window.prompt("Give your list a caption");
        if (!caption) return;
        let newBoards = [...boards, {
            id: uuid(),
            caption: caption,
            modified: Date.now(),
            seqNo: 0,
            active: 1
        }];
        setBoards(newBoards);
    }

    function renameBoard(board) {
        let caption = window.prompt("Rename list", board.caption);
        if (caption === "") {
            let confirmDelete = window.prompt("Sure you want to delete list?","no");
            if (confirmDelete === "yes") {
                // old way of deleting
                // let newBoards = boards.filter(prevBoard => prevBoard.id !== board.id);
                let newBoards = boards.map(prevBoard => prevBoard.id === board.id ? {...prevBoard, modified: Date.now(), active: 1-prevBoard.active} : prevBoard);
                setBoards(newBoards);
            }
            return;
        }
        if (!caption) return;
        let newBoards = boards.map(prevBoard => prevBoard.id === board.id ? {...prevBoard, caption: caption, modified: Date.now()} : prevBoard);
        setBoards(newBoards);
    }

    //#region styles
    const listsStyle = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start"
    };
    const leftStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch"
    };
    const linkStyle = {
        borderRadius: "5px",
        textDecoration: "none",
        textAlign: "center",
        marginTop: "1px",
        padding: "10px",
        whiteSpace: "nowrap",
        fontSize: theme.fontSize + "em"
    };
    const linkInactiveStyle = {
        ...linkStyle,
        backgroundColor: theme.accent2,
        color: theme.accent1
    };
    const linkActiveStyle = {
        ...linkStyle,
        backgroundColor: theme.accent1,
        color: theme.accent2
    };
    const rightStyle = {
        flexGrow: "1",
    };
    const toolbarStyle = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        flexGrow: "1",
        marginTop: "20px"
    };
    const backdropStyle = {
        display: sharePopup ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        width: "100vw",
        height: "100vh",
        left: "0",
        top: "0",
        backgroundColor: "rgba(0,0,0,0.6)"
    };
    const popupStyle = {
        border: `2px solid ${theme.accent1}`,
        backgroundColor: "#fff",
        padding: "5px 20px",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center"
    };
    const popupHeaderStyle = {
        color: theme.accent1,
        margin: "0px 5px 5px 5px"
    };
    const shareHeadingStyle = {
        color: theme.accent1,
        margin: "5px 0 0 0"
    };
    const recipientBoxStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "start",
        alignSelf: "center"
    };
    const recipientStyle = {
        fontSize: "0.8em",
        marginLeft: "5px"
    };
    const removeRecipientStyle = {
        fontWeight: "bold",
        fontSize: "0.8em",
        color: theme.accent1,
        marginLeft: "4px",
        cursor: "pointer"
    };
    const shareFormStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "start"
    };
    //#endregion

    return (
        <div style={listsStyle}>
            <div style={leftStyle}>
                {
                    boards && boards.filter(board => board.active === 1).map(board => {
                        return (
                            <NavLink to={`/lists/${board.id}`} key={board.id} style={linkInactiveStyle} activeStyle={linkActiveStyle}>
                                <div key={board.id} onContextMenu={(e) => {
                                        e.preventDefault();
                                        renameBoard(board);
                                    }}>
                                    {board.caption}
                                </div>
                            </NavLink>
                        )
                    })
                }
                <Button caption="+List" onClick={addBoard}/>
                <div style={toolbarStyle}>
                    <ToggleIcon active={theme?.shoppingMode} onClick={() => setTheme(prevTheme => {return {...prevTheme, shoppingMode: !prevTheme?.shoppingMode}})} caption="SM" tooltip="Shopping Mode"/>
                    <ToggleIcon active={true} onClick={() => {
                        const currentBoard = boards.find(b => window.location.href.includes(b.id));
                        if (!!currentBoard) {
                            setSharePopup(true)
                        } else {
                            window.alert("Select a list to share!");
                        }
                    }} caption="SH" tooltip="Share list..."/>
                </div>
            </div>
            <div style={rightStyle}>
                    <Switch>
                        <Route path="/lists/:id" exact component={BetterBoard}/>
                    </Switch>
            </div>
            <div style={backdropStyle} onClick={(e) => setSharePopup(false)}>
                <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
                    <h4 style={popupHeaderStyle}>
                        {boards.find(b => window.location.href.includes(b.id))?.caption}
                    </h4>
                    <form style={shareFormStyle}>
                        <div style={shareHeadingStyle}>
                            Shared with:
                        </div>
                        <div style={recipientBoxStyle}>
                            {shareRecipients ? shareRecipients.map(rec => (
                                <div key={rec}>
                                    <span style={removeRecipientStyle} onClick={(e) => {
                                        if (shareRecipients.length === 1) {
                                            window.alert("Cannot leave a list without users!");
                                            return;
                                        }
                                        fetchLanisShare({
                                            jwt: auth.token,
                                            action: "unshare",
                                            userName: rec,
                                            resourceId: boards.find(b => window.location.href.includes(b.id))?.id
                                        }, devMode).then(res => {
                                            if (res.status === 200) {
                                                setShareRecipients(prev => prev.filter(r => r !== rec));
                                            }
                                        });
                                    }}>X</span>
                                    <span style={recipientStyle}>{rec}</span>
                                </div>
                            )) : "Loading..."}
                        </div>
                        <div style={shareHeadingStyle}>
                            Share with...
                        </div>
                        <input list="shareUsers" onChange={(e) => {
                            let curVal = e.target.value;
                            e.target.value = "";
                            let selectedUser = users.find(u => u.userName === curVal);
                            if (!selectedUser) return;
                            fetchLanisShare({
                                jwt: auth.token,
                                action: "share",
                                userName: selectedUser.userName,
                                resourceId: boards.find(b => window.location.href.includes(b.id))?.id
                            }, devMode).then(res => {
                                if (res.status === 200) {
                                    setShareRecipients(prev => [...prev, selectedUser.userName]);
                                } else {
                                    setSharePopup(false);
                                    console.log(res);
                                }
                            });
                        }}/>
                        <datalist id="shareUsers">
                            {users.filter(user => shareRecipients ? !shareRecipients.find(rec => rec === user.userName) : true).map(user => <option key={user.userName} value={user.userName}/>)}
                        </datalist>
                    </form>
                </div>
            </div>
        </div>
    )
}
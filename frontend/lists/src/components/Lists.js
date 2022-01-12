import React, { useState, useRef, useEffect } from 'react';
import ListBoard from './ListBoard';
import SelectMenu from './SelectMenu';
import uuid from 'react-uuid';
import { useAuth } from '../contexts/AuthContext';

function Lists() {

  const [boards, setBoards] = useState([])
  const [serverBoards, setServerBoards] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState()
  const [menuSearch, setMenuSearch] = useState("")
  const [lastSaved, setLastSaved] = useState(new Date())
  const [uncheckedOnly, setUncheckedOnly] = useState(false)

  const auth = useAuth();

  useEffect(() => {
    syncFromServer()
    const interval = setInterval(() => {
      syncFromServer()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  },[])

  useEffect(() => {
    loaded && boards && syncToServer()
  }, [boards])

  const menuSearchRef = useRef()

  function syncFromServer() {
    setLoaded(false)
    fetch("http://www.lanis.co.uk/php/orm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "get",
        payload: {
          type: "board"
        },
        jwt: ""
      })
    })
    .then(response => response.json())
    .then(refreshFromServer)
    .then(() => {
      setLoaded(true)
      setLastSaved(new Date())
    })
  }

  function refreshFromServer(boardObjects) {
    setBoards(boardObjects)
    setServerBoards(boardObjects)
  }

  function syncToServer() {
    let boardObjects = boards.map(b => {
      let {id, caption, modified, seqNo} = b
      return {id, caption, modified, seqNo}
    })
    let serverBoardObjects = serverBoards.map(b => {
      let {id, caption, modified, seqNo} = b
      return {id, caption, modified, seqNo}
    })

    let listObjects = boards.reduce((l, b) => {
      return [...l, ...b.lists]
    }, []).map(l => {
      let {id, caption, boardId, modified, seqNo} = l
      return {id, caption, boardId, modified, seqNo}
    })
    let serverListObjects = serverBoards.reduce((l, b) => {
      return [...l, ...b.lists]
    }, []).map(l => {
      let {id, caption, boardId, modified, seqNo} = l
      return {id, caption, boardId, modified, seqNo}
    })

    let itemObjects = boards.reduce((i, b) => {
      return [...i, ...b.lists.reduce((i, l) => {
        return [...i, ...l.items]
      }, [])]
    }, [])
    let serverItemObjects = serverBoards.reduce((i, b) => {
      return [...i, ...b.lists.reduce((i, l) => {
        return [...i, ...l.items]
      }, [])]
    }, [])
    
    let changedBoards = boardObjects.filter(b => serverBoardObjects.some(sb => b.id === sb.id && b.modified !== sb.modified))
    let changedLists = listObjects.filter(l => serverListObjects.some(sl => l.id === sl.id && l.modified !== sl.modified))
    let changedItems = itemObjects.filter(i => serverItemObjects.some(si => i.id === si.id && i.modified !== si.modified))

    let createdBoards = boardObjects.filter(b => !serverBoardObjects.some(sb => b.id === sb.id))
    let createdLists = listObjects.filter(l => !serverListObjects.some(sl => l.id === sl.id))
    let createdItems = itemObjects.filter(i => !serverItemObjects.some(si => i.id === si.id))

    let deletedBoards = serverBoardObjects.filter(sb => !boardObjects.some(b => b.id === sb.id))
    let deletedLists = serverListObjects.filter(sl => !listObjects.some(l => l.id === sl.id))
    let deletedItems = serverItemObjects.filter(si => !itemObjects.some(i => i.id === si.id))

    changedBoards.length > 0 && updateServer("board", changedBoards)
    changedLists.length > 0 && updateServer("list", changedLists)
    changedItems.length > 0 && updateServer("item", changedItems)

    createdBoards.length > 0 && insertServer("board", createdBoards)
    createdLists.length > 0 && insertServer("list", createdLists)
    createdItems.length > 0 && insertServer("item", createdItems)

    deletedBoards.length > 0 && deleteServer("board", deletedBoards)
    deletedLists.length > 0 && deleteServer("list", deletedLists)
    deletedItems.length > 0 && deleteServer("item", deletedItems)
  }

  function updateServer(objectType, updatedObjects) {
    let fetchBody = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "update",
        payload: {
          type: objectType,
          content: [...updatedObjects]
        },
        jwt: ""
      })
    }

    fetch("http://www.lanis.co.uk/php/orm", fetchBody)
    .then(response => {setLastSaved(new Date())})
    .then(()=>{syncFromServer()})
  }

  function insertServer(objectType, insertedObjects) {
    let fetchBody = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "insert",
        payload: {
          type: objectType,
          content: [...insertedObjects]
        },
        jwt: ""
      })
    }

    console.log(fetchBody)

    fetch("http://www.lanis.co.uk/php/orm", fetchBody)
    .then(response => {setLastSaved(new Date())})
    .then(()=>{syncFromServer()})
  }

  function deleteServer(objectType, updatedObjects) {
    let fetchBody = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "delete",
        payload: {
          type: objectType,
          content: [...updatedObjects]
        },
        jwt: ""
      })
    }

    fetch("http://www.lanis.co.uk/php/orm", fetchBody)
    .then(response => {setLastSaved(new Date())})
    .then(()=>{syncFromServer()})
  }

  function saveToServer() {
    let fetchBody = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "save",
        payload: {
          type: "board",
          content: [...boards]
        },
        jwt: ""
      })
    }

    fetch("http://www.lanis.co.uk/php/orm", fetchBody)
    .then(response => {setLastSaved(new Date())})
  }

  function updateBoard(updatedBoard) {
    setBoards(prevBoards => prevBoards.map(prevBoard => prevBoard.id === updatedBoard.id ? updatedBoard : prevBoard))
    //syncToServer()
  }

  function addBoard(newBoardCaption) {
    let newBoard = {
      id: uuid(),
      caption: newBoardCaption,
      lists: [],
      modified: Date.now(),
      seqNo: 0
    }
    setBoards(prevBoards => [...prevBoards, newBoard])
  }

  function handleAddClick(e) {
    addBoard(menuSearchRef.current.value)
    menuSearchRef.current.value = ""
  }

  function handleMenuSearchChange(e) {
    setMenuSearch(e.target.value)
  }

  function handleMenuSearchKeyDown(e) {
    if (e.code !== "Enter") return
    addBoard(menuSearchRef.current.value)
    menuSearchRef.current.value = ""
  }

  function changeBoard(selectedBoard) {
    setSelectedBoardId(selectedBoard.id)
  }

  function renameBoard(renamedBoard) {
    setBoards(prevBoards => prevBoards.map(prevBoard => prevBoard.id === renamedBoard.id ? {...prevBoard, caption: renamedBoard.caption, modified: Date.now()} : prevBoard))
  }

  function deleteBoard(deletedBoard) {
    if (selectedBoardId === deletedBoard.id) {setSelectedBoardId(null)}
    setBoards(prevBoards => prevBoards.filter(prevBoard => prevBoard.id !== deletedBoard.id))
  }

  function transferList(list, targetBoardIdentifier) {
    let sourceBoard = {...boards.find(board => !!board.lists.find(l => l.id === list.id))}
    let targetBoard = {...boards.find(board => board.id === targetBoardIdentifier.id)}

    if (sourceBoard.id === targetBoard.id) return

    let updatedSourceBoard = {
      ...sourceBoard,
      lists: [...sourceBoard.lists.filter(l => l.id !== list.id)]
    }

    let updatedTargetBoard = {
      ...targetBoard,
      lists: [...boards.find(board => board.id === targetBoard.id).lists, list]
    }

    setBoards(prevBoards => prevBoards.map(
      prevBoard => {
        if (prevBoard.id === updatedTargetBoard.id) return updatedTargetBoard
        if (prevBoard.id === updatedSourceBoard.id) return updatedSourceBoard
        return prevBoard
      }
    ))
  }

  function boardItemDrop(e, dropTargetItem) {
    try {
      let droppedObject = JSON.parse(e.dataTransfer.getData("text"))
      if (droppedObject?.type === "list") {
        transferList(droppedObject.content, dropTargetItem)
      }
    } catch (e) {}
  }

  function handleUncheckedChange(e) {
    setUncheckedOnly((prev) => !prev)
  }

  //#region STYLES
  const divStyle = {
    display: "flex",
    justifyItems: "stretch",
    fontFamily: "Trebuchet MS",
    maxWidth: "100vw"
  }

  const leftStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch"
  }

  const rightStyle = {
    flexGrow: "1",
    maxHeight: "90vh",
    maxWidth: "100%",
    overflowY: "auto",
  }

  const spanStyle = {
    whiteSpace: "nowrap",
    display: "inline-block",
    marginBottom: "5px"
  }

  const saveDivStyle = {
    marginTop: "5px",
    fontSize: "0.6em",
    color: "grey"
  }

  const menuSearchStyle = {
    maxWidth: "150px"
  }

  const loadingDivStyle = {
    fontSize: "0.7em",
    margin: "5px 0"
  }

  const shoppingModeStyle = {
    textAlign: "center",
    fontSize: "0.8em"
  }
  //#endregion

  return (
    <div style={divStyle}>
      <div style={leftStyle}>
        <span style={spanStyle}>
          <input type="text" ref={menuSearchRef} defaultValue={menuSearch} placeholder="New group" onChange={handleMenuSearchChange} onKeyDown={handleMenuSearchKeyDown} style={menuSearchStyle}/><button onClick={handleAddClick}>+</button>
        </span>
        {!loaded && !boards && <div style={loadingDivStyle}>Loading...</div>}
        <SelectMenu items={boards.map(board => ({id: board.id, caption: board.caption, active: board.id === selectedBoardId}))} selectItem={changeBoard} updateItem={renameBoard} deleteItem={deleteBoard} onItemDrop={boardItemDrop}/>
        <div style={saveDivStyle}>
          Last sync {lastSaved.toLocaleString()}
        </div>
        <div style={shoppingModeStyle}>
          <input type="Checkbox" id="shoppingMode" checked={!!uncheckedOnly} onChange={handleUncheckedChange}/>
          <label htmlFor="shoppingMode">Shopping mode</label>
        </div>
      </div>
      <div style={rightStyle}>
        {selectedBoardId && boards.find(board => board.id === selectedBoardId) && <ListBoard key={selectedBoardId} board={boards.find(board => board.id === selectedBoardId)} updateBoard={updateBoard} uncheckedOnly={uncheckedOnly}/>}
      </div>
    </div>
  );
}

export default Lists;
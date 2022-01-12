import React from 'react'
import CheckList from './CheckList'
import uuid from 'react-uuid'

function ListBoard({ board, updateBoard, uncheckedOnly }) {

  function updateList(updatedList) {
    let updatedBoard = {
      ...board,
      lists: board.lists.map(list => list.id === updatedList.id ? updatedList : list)
    }
    updateBoard(updatedBoard)
  }

  function addList() {
    let newListCaption = window.prompt("New list", "New list name")
    if (!newListCaption) return
    let newList = {
      id: uuid(),
      caption: newListCaption,
      boardId: board.id,
      items: [],
      modified: Date.now(),
      seqNo: 0
    }
    let updatedBoard = {
      ...board,
      lists: [...board.lists, newList]
    }
    updateBoard(updatedBoard)
  }

  function deleteList(deletedList) {
    let updatedBoard = {
      ...board,
      lists: board.lists.filter(list => list.id !== deletedList.id)
    }
    updateBoard(updatedBoard)
  }

  function getAccentColor(id) {
    let idIndex = board.lists.findIndex(list => list.id === id)
    let hueStep = Math.round(360 / board.lists.length)
    let hue = 45 + hueStep * idIndex
    let hsl = "hsl(" + hue + ", 50%, 45%)"
    return hsl
  }

  function handleButtonClick(e) {
    addList()
  }

  const divStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "start",
    justifyContent: "center"
  }

  const buttonStyle = {
    alignSelf: "flex-end",
    margin: "5px 20px",
    width: "50px",
    height: "40px",
    fontSize: "1.3em"
  }

  const breakDivStyle = {
    flexBasis: "100%",
    height: "0"
  }

  return (
    <div style={divStyle}>
      {board.lists.filter(list => !uncheckedOnly || list.items.filter(item => !item.checked).length > 0).sort((a,b) => a.items.length - b.items.length).map(list => <CheckList key={list.id} list={list} updateList={updateList} deleteList={deleteList} accentColor={getAccentColor(list.id)} uncheckedOnly={uncheckedOnly} />)}
      <div style={breakDivStyle}></div>
      {!uncheckedOnly && <button style={buttonStyle} onClick={handleButtonClick}>+</button>}
    </div>
  );
}

export default ListBoard
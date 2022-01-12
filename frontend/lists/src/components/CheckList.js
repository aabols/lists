import React, { useState, useRef, useEffect } from 'react'
import uuid from 'react-uuid'
import ItemList from './ItemList'

function CheckList({ list, updateList, deleteList, accentColor, uncheckedOnly }) {

  const [searchQuery, setSearchQuery] = useState("")
  const [editable, setEditable] = useState(false)

  const searchBoxRef = useRef()
  const legendRef = useRef()

  useEffect(() => {
    // legendRef.current.focus()
    var range = document.createRange()
    var sel = window.getSelection()
    
    range.setStart(legendRef.current, 1)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
  }, [editable])

  function updateItem(updatedItem) {
    let updatedList = {
      ...list,
      items: list.items.map(item => item.id === updatedItem.id ? updatedItem : item)
    }
    updateList(updatedList)
    // searchBoxRef.current.focus()
  }

  function addItem(newItem) {
    let updatedList = {
      ...list,
      items: [...list.items, newItem]
    }
    updateList(updatedList)
  }

  function deleteItem(deletedItem) {
    let updatedList = {
      ...list,
      items: list.items.filter(item => item.id !== deletedItem.id)
    }
    updateList(updatedList)
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value)
  }

  function handleLegendRightClick(e) {
    e.preventDefault()
    setEditable(true)
  }

  function handleLegendBlur(e) {
    setEditable(false)
    if (list.caption === e.target.innerText) return
    let updatedList = {
      ...list,
      caption: e.target.innerText,
      modified: Date.now()
    }
    updateList(updatedList)
  }

  function handleLegendKeyDown(e) {
    e.code === "Enter" && e.target.blur()
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    if (searchBoxRef.current.value === "") return
    addItem({
      id: uuid(),
      caption: searchBoxRef.current.value,
      checked: 0,
      listId: list.id,
      modified: Date.now(),
      seqNo: 0
    })

    setSearchQuery("")
    searchBoxRef.current.value = ""
  }

  function handleButtonClick(e) {
    deleteList(list)
  }

  function handleDragStart(e) {
    let draggedObject = {
      type: "list",
      content: {...list}
    }
    e.dataTransfer.setData("text", JSON.stringify(draggedObject))
  }

  const divStyle = {
    display: "flex",
    flexDirection: "column"
  }

  const searchStyle = {
  }

  const legendStyle = {
    margin: "0 auto"
  }

  const legendSpanStyle = {
    border: editable ? "1px solid #ccc" : "none",
    padding: "1px 6px",
    cursor: editable ? "auto" : "pointer"
  }

  const fieldsetStyle = {
    marginTop: "5px",
    textAlign: "center",
    borderStyle: "solid",
    borderWidth: "2px",
    borderColor: accentColor,
    color: accentColor,
    borderRadius: "5px",
    maxWidth: "100%"
  }

  const formStyle = {
    display: "flex",
    flexDirection: "column"
  }

  const buttonStyle = {
    marginLeft: "5px"
  }

  return (
    list ? <fieldset style={fieldsetStyle} draggable={false} onDragStart={handleDragStart}>
      <legend style={legendStyle}>
        <span role="textbox" ref={legendRef} contentEditable={editable} suppressContentEditableWarning={true} style={legendSpanStyle} onContextMenu={handleLegendRightClick} onBlur={handleLegendBlur} onKeyDown={handleLegendKeyDown}>{list.caption}</span>
        {editable && <button style={buttonStyle} onClick={handleButtonClick}>-</button>}
      </legend>
      <div style={divStyle}>
        <form onSubmit={handleFormSubmit} style={formStyle}>
          <input type="text" ref={searchBoxRef} defaultValue={searchQuery} style={searchStyle} onChange={handleSearchChange}/>
        </form>
        <ItemList key="unChecked" list={{ items: list.items.filter(item => !item.checked).sort((a,b) => a.modified - b.modified) }} updateItem={updateItem} deleteItem={deleteItem} accentColor={accentColor}/>
        {!uncheckedOnly && 
        <ItemList key="checked" list={{ items: list.items.filter(item => item.checked && item.caption.toLowerCase().includes(searchQuery.toLowerCase())).sort((a,b) => b.modified - a.modified) }} updateItem={updateItem} deleteItem={deleteItem} accentColor={accentColor}/>
        }
      </div>
    </fieldset> : null
  )
}

export default CheckList;
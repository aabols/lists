import React, { useState, useEffect, useRef } from 'react'

export default function MenuItem({ item, selectItem, updateItem, deleteItem, onDrop }) {

  const [editable, setEditable] = useState(false)

  const spanRef = useRef()

  useEffect(() => {
    if (!editable) return
    var range = document.createRange()
    var sel = window.getSelection()
    
    range.setStart(spanRef.current, 1)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
  }, [editable])

  function handleDivClick(e) {
    selectItem && selectItem(item)
  }

  function handleDivRightClick(e) {
    if (!updateItem && !deleteItem) return
    e.preventDefault()
    setEditable(true)
  }

  function handleDivBlur(e) {
    if (!editable) return
    if (item.caption === e.target.innerText) return
    let updatedItem = {
      ...item,
      caption: e.target.innerText
    }
    updateItem && updateItem(updatedItem)
    setEditable(false)
  }

  function handleButtonClick(e) {
    deleteItem && deleteItem(item)
  }

  function handleDragOver(e) {
    if (!onDrop) return
    e.preventDefault()
  }

  function handleDrop(e) {
    onDrop && onDrop(e, item)
  }

  const baseHue = 80;
  const themeHue = baseHue + (item.active ? 20 : 0);

  const divStyle = {
    backgroundColor: `hsl(${themeHue}, 45%, 75%)`,
    borderColor: `hsl(${themeHue}, 50%, 40%)`,
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "3px",
    height: "35px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.8em",
    cursor: "pointer"
  }

  const buttonStyle = {
    marginLeft: "10px"
  }

  const spanStyle ={
    border: editable ? "1px solid #ccc" : "none",
    backgroundColor: editable ? "hsla(0, 100%, 100%, 70%)" : null,
    padding: "1px 6px"
  }

  return (
    <div style={divStyle} onClick={handleDivClick} onContextMenu={handleDivRightClick} onDragOver={handleDragOver} onDrop={handleDrop}>
      <span style={spanStyle} ref={spanRef} contentEditable={editable} suppressContentEditableWarning={true} onBlur={handleDivBlur}>{item.caption}</span>
      {editable && <button style={buttonStyle} onClick={handleButtonClick}>-</button>}
    </div>
  )
}
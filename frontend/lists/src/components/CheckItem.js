import React, { useState, useEffect, useRef } from 'react'

export default function CheckItem({ item, updateItem, deleteItem, accentColor }) {

  const [editable, setEditable] = useState(false)
  const [hover, setHover] = useState(false)

  const itemTextRef = useRef()

  useEffect(() => {
    if (!editable) return
    var range = document.createRange()
    var sel = window.getSelection()

    let curPos = itemTextRef.current.innerText === "" ? 0 : 1
    
    range.setStart(itemTextRef.current, curPos)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)

  }, [editable])

  function toggleItem() {
    let updatedItem = {
      ...item,
      checked: 1 - item.checked,
      modified: Date.now()
    }
    updateItem(updatedItem)
  }

  function updateItemCaption(newCaption) {
    if (item.caption === newCaption) return
    let updatedItem = {
      ...item,
      caption: newCaption,
      modified: Date.now()
    }
    updateItem(updatedItem)
  }

  function handleCheckboxChange(e) {
    toggleItem()
  }

  function handleTextClick(e) {
    !editable && toggleItem()
  }

  function handleTextRightClick(e) {
    e.preventDefault()
    setEditable(true)
  }

  function handleTextBlur(e) {
    // editable && updateItemCaption(e.target.value)
    if (!editable) return
    if (e.target.innerText === "") {
      deleteItem(item)
      return
    }
    updateItemCaption(e.target.innerText)
    setEditable(false)
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    editable && updateItemCaption(itemTextRef.current.value)
    setEditable(false)
  }

  function handleTextKeyDown(e) {
    e.code === "Enter" && e.target.blur()
  }

  function handleMouseEnter(e) {
    setHover(true)
  }

  function handleMouseLeave(e) {
    setHover(false)
  }

  const divStyle = {
    cursor: "pointer",
    display: "flex",
    backgroundColor: hover ? "#f8f8f8" : "transparent"
  }

  const formStyle = {
    flexGrow: "1",
    display: "flex"
  }

  const textStyle = {
    textDecorationLine: !!item.checked && !editable ? "line-through" : "none",
    cursor: editable ? "auto" : "inherit",
    border: "none",
    flexGrow: "1",
    backgroundColor: "transparent",
    color: !!item.checked && !editable ? "#aaa" : "inherit"
  }

  const checkStyle = {
    cursor: "inherit",
    backgroundColor: accentColor
  }

  const spanStyle ={
    color: !!item.checked && !editable ? "#aaa" : "inherit",
    textDecorationLine: !!item.checked && !editable ? "line-through" : "none",
    border: editable ? "1px solid #ccc" : "none",
    padding: "1px 6px"
  }

  return (
    <>
      {
        item && <div style={divStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleTextClick}>
          <input type="Checkbox" checked={!!item.checked} style={checkStyle} onChange={handleCheckboxChange}/>
          <span style={spanStyle} ref={itemTextRef} contentEditable={editable} suppressContentEditableWarning={true} onClick={handleTextClick} onContextMenu={handleTextRightClick} onBlur={handleTextBlur} onKeyDown={handleTextKeyDown}>{item.caption}</span>
          {/* <form onSubmit={handleFormSubmit} style={formStyle}>
            <input type="text" ref={itemTextRef} defaultValue={item.caption} readOnly={!editable} style={textStyle} onClick={handleTextClick} onContextMenu={handleTextRightClick} onBlur={handleTextBlur} onKeyDown={handleTextKeyDown}/>
          </form> */}
        </div>
      }
    </>
  )
}
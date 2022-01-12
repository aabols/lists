import React from 'react'
import MenuItem from './MenuItem'

export default function SelectMenu({ items, selectItem, updateItem, deleteItem, onItemDrop }) {

  return (
    items.map(item => <MenuItem key={item.id} item={item} selectItem={selectItem} updateItem={updateItem} deleteItem={deleteItem} onDrop={onItemDrop}/>)
  )
}
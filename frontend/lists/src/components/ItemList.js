import React from 'react'
import CheckItem from './CheckItem'

function ItemList({ list, updateItem, deleteItem, accentColor }) {

  return (
    list && list.items && list.items.map(item => {
      return <CheckItem key={item.id} item={item} updateItem={updateItem} deleteItem={deleteItem} accentColor={accentColor}/>
    })
  )
}

export default ItemList;
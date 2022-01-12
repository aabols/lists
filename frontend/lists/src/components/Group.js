import React from 'react';
import Ingredient from './Ingredient';
import { useDrag, useDrop } from 'react-dnd';

export default function Group(props) {
    console.log("group render props");
    console.log(props);
    const [dropCollected, dropRef] = useDrop(() => ({
        accept: ['ingredient','group'],
        canDrop: (item, monitor) => true,
        drop: (item, monitor) => {
            console.log("drop item");
            console.log(item);
            handleDrop(item);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver()
        })
    }));
    const [dragCollected, dragRef] = useDrag(() => ({
        type: 'group',
        item: {...props}
    }));
    const caption = props.caption && props.caption;
    function handleDrop(droppedItem) {
        console.log("handleDrop old props");
        console.log(props);
        const updatedProps = {
            ...props,
            items: [...props.items, {...droppedItem}]
        };
        console.log("handleDrop updatedProps");
        console.log(updatedProps);
        props.onChange && props.onChange(updatedProps);
    };
    function handleChange(newValue) {
        !!props.onChange && props.onChange(
            {
                ...props,
                items: props.items.map(
                    prevItem => prevItem.id === newValue.id
                        ? newValue
                        : prevItem
                )
            }
        )
    };
    const contents = props.items?.map(
        item => {
            switch (item.type) {
                case 'group':
                    return <Group
                        key={item.id}
                        id={item.id}
                        caption={item.caption}
                        items={item.items}
                        onChange={handleChange}
                    />
                case 'ingredient':
                    return <Ingredient
                        key={item.id}
                        id={item.id}
                        caption={item.caption}
                        amount={item.amount}
                        unit={item.unit}
                    />
                default:
                    return undefined;
            }
        }
    );

    return (
        <fieldset>
            {!!caption && <legend ref={dragRef}>{caption}</legend>}
            <div ref={dropRef}>
                {contents}
            </div>
        </fieldset>
    );
};
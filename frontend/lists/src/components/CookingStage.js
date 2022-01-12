import React from 'react';
import styles from './CookingStage.module.css';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import Ingredient from './Ingredient';

export default function CookingStage(props) {
    const [collected, drop] = useDrop(() => ({
        accept: ['ingredient','stage'],
        canDrop: (item, monitor) => true,
        drop: (item, monitor) => {
            props.onDrop && props.onDrop(item, props.id);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver()
        })
    }));
    const [dragCollected, drag] = useDrag(() => ({
        type: 'stage',
        item: {...props}
    }));
    const fieldsetClassName = classNames({
        [styles.frame]: true,
        [styles.empty]: !props.children,
        [styles.receiving]: collected.isOver
    });
    const captionLegend = <legend>{props.caption}</legend>;
    return (
        <div className={styles.body} ref={drop}>
            <fieldset className={fieldsetClassName} ref={drag}>
                {!!props.caption && captionLegend}
                <div>
                    {props.children?.map((value, index) => {
                        switch (value.type) {
                            case 'ingredient':
                                return <Ingredient key={value.id} caption={value.caption} amount={value.amount} unit={value.unit}/>;
                            case 'stage':
                                return <CookingStage key={value.id} caption={value.caption}>
                                    {value.children}
                                </CookingStage>;
                            default:
                                return undefined;
                        }
                    })}
                </div>
            </fieldset>
        </div>
    )
};
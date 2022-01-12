import React from 'react';
import styles from './Ingredient.module.css';
import { useDrag } from 'react-dnd';

export default function Ingredient(props) {
    const [collected, drag] = useDrag(() => ({
        type: 'ingredient',
        item: {...props}
    }));
    return (
        <div className={styles.body} ref={drag}>
            {props.caption && <div className={styles.caption}>{props.caption}</div>}
            {props.amount && <div className={styles.amount}>
                <span className={styles.amountQuantity}>{props.amount}</span>
                {props.unit && <span className={styles.amountUnits}>{props.unit}</span>}
            </div>}
        </div>
    )
}
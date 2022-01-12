import React from 'react';
import styles from './NumberField.module.css';

export default function NumberField(props) {
    return (
        <div className={styles.body}>
            <label className={styles.label}>{props.caption}: </label>
            <input className={styles.input} type='number' defaultValue={props.value} onChange={props.onChange}/>
        </div>
    )
};
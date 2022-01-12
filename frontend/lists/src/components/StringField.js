import React from 'react';
import styles from './StringField.module.css';

export default function StringField(props) {
    return (
        <div className={styles.body}>
            <label className={styles.label}>{props.caption}: </label>
            <input className={styles.input} type='text' defaultValue={props.value} onChange={props.onChange}/>
        </div>
    )
};
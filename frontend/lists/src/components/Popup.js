import React from 'react';
import styles from './Popup.module.css';

export default function Popup(props) {
    return (
        <div className={styles.background} onClick={props.onClose}>
            {props.children}
        </div>
    )
}

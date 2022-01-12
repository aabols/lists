import React from 'react';
import styles from './Button.module.css';

export default function Button({ caption, onClick }) {
    return (
        <span className={styles.body} onClick={onClick}>
            {caption}
        </span>
    )
}
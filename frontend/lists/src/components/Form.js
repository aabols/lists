import React, { useState, useEffect } from 'react';
import StringField from './StringField';
import NumberField from './NumberField';
import styles from './Form.module.css';
import Button from './Button.js';

export default function Form(props) {
    const sourceObject = props.data;
    const caption = Object.keys(sourceObject)[0];
    const displayObject = sourceObject[caption];
    const [formResult, setFormResult] = useState({...displayObject});

    function updateResult(key, value) {
        setFormResult(prevResult => ({
            ...prevResult,
            [key]: value
        }));
    };

    function handleCallback(callback) {
        callback(formResult);
    };

    useEffect(() => {
        props.onUpdate && props.onUpdate(caption, formResult);
    }, [formResult]);
    
    const fields = Object.keys(displayObject).map((key, index) => {
        switch (typeof displayObject[key]) {
            case 'string':
                return <StringField key={key} caption={key} value={displayObject[key]} onChange={(e) => updateResult(key, e.target.value)}/>;
            
            case 'number':
                return <NumberField key={key} caption={key} value={displayObject[key]} onChange={(e) => updateResult(key, e.target.value)}/>;
                
            case 'object':
                if (displayObject[key] === null) {
                    return <StringField key={key} caption={key} value={displayObject[key]}/>;
                } else {
                    return <Form key={key} data={{[key]: displayObject[key]}} onUpdate={updateResult}/>;
                }   
            
            case 'function':
                return <Button key={key} caption={key} onClick={() => handleCallback(displayObject[key])}/>;

            case 'undefined':
                return undefined;
            
            default:
                return <div key={key} className={styles.jsonField}>{JSON.stringify({[key]: displayObject[key]},undefined,1)}</div>
        }
    });
    return (
        <fieldset className={styles.border}>
            {!!caption && <legend className={styles.caption}>{caption}</legend>}
            <div className={styles.fields}>
                {fields}
            </div>
        </fieldset>
    )
};
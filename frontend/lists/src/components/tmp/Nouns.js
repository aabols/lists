import React, { useState, useEffect, useRef } from 'react';
import uuid from 'react-uuid';
import fetchLanis from '../../functions/fetchLanis';
import { useAuth } from '../../contexts/AuthContext';

export default function Nouns() {
    const auth = useAuth();
    const dec = useRef();
    const nom = useRef();
    const eng = useRef();
    const proper = useRef();

    const [status, setStatus] = useState("Status text");
    const [err, setErr] = useState(false);
    const [lastWord, setLastWord] = useState();

    async function handleFormSubmit(e) {
        e.preventDefault();
        setStatus("");
        setErr(false);
        const data = {
            id: uuid(),
            dec: parseInt(dec.current.value),
            nom: nom.current.value,
            eng: eng.current.value,
            proper: proper.current.checked ? 1 : 0
        };
        if (data.id === "" || !data.dec || data.dec < 1 || data.dec > 6 || data.nom === "" || data.eng === "" || data.proper < 0 || data.proper > 1) {
            setErr(true);
            setStatus("Form incorrect!");
            return;
        }
        const res = await fetchLanis({
            jwt: auth.token,
            type: 'noun',
            action: 'insert',
            payload: [data]
        }, true);
        const resText = await res.text();
        if (res.status !== 200) {
            setErr(true);
        } else {
            nom.current.value="";
            eng.current.value="";
            nom.current.focus();
            setLastWord(`${data.nom} - ${data.eng}`);
        }
        setStatus(`${res.status.toString()}: ${resText}`);
    }

    function handleNomBlur(e) {
        const n = nom.current.value;
        if (n.endsWith('is')) {
        dec.current.value = 2;
        } else if (n.endsWith('us')) {
        dec.current.value = 3;
        } else if (n.endsWith('s') || n.endsWith('š')) {
            dec.current.value = 1;
        } else if (n.endsWith('a')) {
            dec.current.value = 4;
        } else if (n.endsWith('e')) {
            dec.current.value = 5;
        } else {
            dec.current.value = '';
        }
    }

    const bodyStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        alignItems: "center"
    };
    const formStyle = {
        display: "flex",
        flexDirection: "column"
    };
    const statusStyle = {
        color: err ? "red" : "green"
    };
    const lastWordStyle = {
        fontSize: "0.7em",
        color: "#ccc"
    };
    return (
        <div style={bodyStyle}>
            <form style={formStyle} onSubmit={handleFormSubmit}>
                <label htmlFor="nom">Nominatīvs:</label>
                <input type="text" id="nom" name="nom" ref={nom} onBlur={handleNomBlur}></input>

                <label htmlFor="dec">Declension:</label>
                <input type="number" id="dec" name="dec" ref={dec}></input>

                <label htmlFor="eng">English:</label>
                <input type="text" id="eng" name="eng" ref={eng}></input>

                <div>
                    <input type="checkbox" id="proper" name="proper" ref={proper}></input>
                    <label htmlFor="proper">Proper noun</label>
                </div>

                <input type="submit" value="Submit"/>
            </form>
            <div style={statusStyle}>
                {status && status}
            </div>
            <div style={lastWordStyle}>
                {lastWord && lastWord}
            </div>
        </div>
    )
}
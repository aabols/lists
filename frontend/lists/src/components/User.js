import React from 'react';
import Button from './Button';
import { useAuthUpdate } from '../contexts/AuthContext';

export default function User() {
    const authUpdate = useAuthUpdate();

    function handleLogout() {
        authUpdate(null);
    }

    const menuStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center"
    };

    return (
        <div style={menuStyle}>
            <Button caption="Log Out" onClick={handleLogout}/>
        </div>
    )
}

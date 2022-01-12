import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function SportsMenu() {
    const theme = useTheme();
    const sportOptions = [
        {path: "/sports/squash",caption: "Squash",},
        {path: "/sports/tennis",caption: "Tennis",},
        {path: "/sports/gym",caption: "Gym",},
    ];
    const menuStyle = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        height: "100%"
    };
    const linkStyle = {
        display: "flex",
        textDecoration: "none",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.accent1,
        color: theme.accent2,
        aspectRatio: "1 / 1",
        minWidth: "110px",
        cursor: "pointer",
        fontSize: "1.4em",
        borderRadius: "5px"
    };
    return (
        <div style={menuStyle}>
            {
                sportOptions.map(option => (
                    <NavLink key={option.path} to={option.path} style={linkStyle}>
                            {option.caption}
                    </NavLink>
                ))
            }
        </div>
    )
}

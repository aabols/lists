import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemeUpdate } from '../contexts/ThemeContext';
import './NavigationBar.css';
import classNames from 'classnames';

export default function NavigationBar() {
    const auth = useAuth();
    const theme = useTheme();
    const setTheme = useThemeUpdate();
    const [navMenu, setNavMenu] = useState("");

    const navTabs = [
        {
            caption: "Lists",
            path: "/lists"
        },{
            caption: "Sports",
            path: "/sports"
        },{
            caption: "Cookbook",
            path: "/cookbook"
        },{
            caption: "Games",
            menu: [
                {
                    caption: 'VocabBuilder',
                    path: '/games/vocabbuilder'
                },{
                    caption: 'WordPop',
                    path: '/games/wordpop'
                }
            ]
        }
    ];

    function capitalLetters(text) {
        return text.replace(/[a-z]/g, "");
    }

    function getInitials(userName) {
        return capitalLetters(userName).substring(0,2) || userName.substring(0,1);
    }

    const userInitials = auth && getInitials(auth.user.name);

    const barStyle = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    };
    const linkStyle = {
        textDecoration: "none"
    };
    const userStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        height: "30px",
        width: "30px",
        backgroundColor: "#ddd",
        cursor: "pointer",
        marginBottom: "5px"
    };
    const userNameStyle = {
        fontSize: "0.9em"
    };

    return (
        <div style={barStyle}>
            {
                navTabs.map(tab => {
                    return tab.path ? (
                        <NavLink className="NavigationBarLink" activeClassName="NavigationBarActiveLink" to={tab.path} key={tab.path}>
                            <span className="NavigationBarTab">
                                {tab.caption}
                            </span>
                        </NavLink>
                    ) : (
                        <span key={tab.caption} className="NavigationBarMenu" onClick={() => {
                            setNavMenu((prev) => prev === tab.caption ? '' : tab.caption);
                            // console.log("outer span click")
                        }} onMouseLeave={() => {
                            setNavMenu('');
                        }}>
                            {tab.caption}
                            {
                                tab.caption === navMenu ? (
                                    <div>
                                        {tab.menu.map(menuItem => (
                                            <NavLink className="NavigationBarLink" activeClassName="NavigationBarActiveLink" to={menuItem.path} key={menuItem.path}>
                                                <div key={menuItem.path}>
                                                    {menuItem.caption}
                                                </div>
                                            </NavLink>
                                        ))}
                                    </div>
                                ) : null
                            }
                        </span>
                    );
                })
            }
            <div style={{flexGrow: "1"}}></div>
            <NavLink to="/user" style={linkStyle}>
                <div style={userStyle}>
                    <div style={userNameStyle}>
                        {auth ?
                            userInitials :
                            <svg width="20" height="20">
                                <circle cx="10" cy="7" r="4" fill="#bbb" />
                                <circle cx="10" cy="20" r="7" fill="#bbb" />
                            </svg>
                        }
                    </div>
                </div>
            </NavLink>
        </div>
    )
}
import React from 'react';
import { NavLink } from 'react-router-dom';
import './GameMenu.css';

const GAMES = [
    {
        caption: "VocabBuilder",
        link: "/games/vocabbuilder"
    },{
        caption: "WordPop",
        link: "/games/wordpop"
    },{
        caption: 'Sylla-ble',
        link: '/games/syllable'
    }
];

export default function GameMenu() {
    return (
        <div className="GameMenuBody">
            {GAMES.map(v => (
                <NavLink key={v.link} to={v.link}>
                    {v.caption}
                </NavLink>
            ))}
        </div>
    )
};
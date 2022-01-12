import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const victoryPoints = 2;
const lossPoints = 1;

export default function Squash() {
    const theme = useTheme();
    const [players, setPlayers] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        setPlayers(prevPlayers => prevPlayers.map(player => {
            return {
                name: player.name,
                points: results.filter(res => (res.playerA === player.name && res.pointsA > res.pointsB) || (res.playerB === player.name && res.pointsB > res.pointsA)).length * victoryPoints + results.filter(res => (res.playerA === player.name && res.pointsA < res.pointsB) || (res.playerB === player.name && res.pointsB < res.pointsA)).length * lossPoints,
                tiebreak: results.reduce((prev, cur) => prev + (cur.playerA === player.name ? cur.pointsA - cur.pointsB : 0) + (cur.playerB === player.name ? cur.pointsB - cur.pointsA : 0), 0),
                games: [...results.filter(res => res.playerA === player.name).map(res => ({ against: res.playerB, scored: res.pointsA, lost: res.pointsB })), ...results.filter(res => res.playerB === player.name).map(res => ({ against: res.playerA, scored: res.pointsB, lost: res.pointsA }))]
            };
        }).sort((a,b) => b.points - a.points + b.tiebreak/1000 - a.tiebreak/1000));
    }, [results]);

    function addPlayer() {
        let newPlayerName = window.prompt("New player");
        !!newPlayerName && setPlayers(prev => [...prev, { name: newPlayerName }]);
    }
    function removePlayer(playerName) {
        setPlayers(prev => prev.filter(prevPlayer => prevPlayer.name !== playerName));
    }
    function addResult(playerA, playerB) {
        let newPointsA = window.prompt("Points for " + playerA);
        let newPointsB = window.prompt("Points for " + playerB);
        newPointsA && newPointsB && setResults(prevResults => [...prevResults, {
            playerA: playerA,
            playerB: playerB,
            pointsA: parseInt(newPointsA),
            pointsB: parseInt(newPointsB)
        }]);
    }

    const squashStyle = {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    };
    const selfStyle = {
        backgroundColor: "#aaa",
    };
    const otherStyle = {
        textAlign: "center",
        cursor: "pointer"
    };

    console.log(players);
    return (
        <div style={squashStyle}>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Points</th>
                        {
                            players.map(player => (
                                <th key={"th_" + player.name}>{player.name}</th>
                            ))
                        }
                        <th>TB</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        players.map((player, rank) => {
                            return (
                                <tr key={"tb_" + player.name}>
                                    <td>
                                        <span style={{
                                            backgroundColor: theme.accent2,
                                            color: theme.accent1,
                                            padding: "0 3px",
                                            marginRight: "5px",
                                            cursor: "pointer"
                                        }} onClick={(e) => removePlayer(player.name)}>
                                            X
                                        </span>
                                        {rank+1 + ". " + player.name}
                                    </td>
                                    <td style={{textAlign: "center"}}>
                                        {player.points}
                                    </td>
                                    {
                                        players.map(playerIn => {
                                            let game = player?.games?.find(game => game.against === playerIn.name);
                                            let scoreText = game ? game.scored + "-" + game.lost : "?";
                                            return (
                                                <td key={player.name + "_" + playerIn.name} style={player.name === playerIn.name ? selfStyle : otherStyle} onClick={(e) => addResult(player.name, playerIn.name)}>
                                                    {player.name === playerIn.name ? null : scoreText}
                                                </td>
                                            )
                                        })
                                    }
                                    <td style={{textAlign: "center"}}>
                                        {player.tiebreak}
                                    </td>
                                </tr>
                            )
                        })
                    }
                    <tr>
                        <td>
                            <div style={{
                                backgroundColor: theme.accent1,
                                color: theme.accent2,
                                borderRadius: "5px",
                                padding: "2px 5px",
                                cursor: "pointer",
                                textAlign: "center"
                            }} onClick={(e) => {
                                addPlayer()
                            }}>
                                +Player
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

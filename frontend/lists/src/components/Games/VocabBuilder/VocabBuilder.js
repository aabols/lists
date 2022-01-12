import React, { useState, useEffect } from 'react';
import fetchLanis from '../../../functions/fetchLanis';
import classNames from 'classnames';
import './VocabBuilder.css';
import { useDev } from '../../../contexts/DevContext';

const BATCH_SIZE = 10;
const OPTION_COUNT = 7;
const ADVANCE_DELAY = 1000;

export default function VocabBuilder() {
    const [nouns, setNouns] = useState([]);
    const [reverse, setReverse] = useState(false);
    const [play, setPlay] = useState(false);
    const [batch, setBatch] = useState([]);
    const [round, setRound] = useState();
    const [options, setOptions] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    const devMode = useDev();

    useEffect(() => {
        (async () => {
            const resp = await fetchLanis({
                type: 'noun',
                action: 'select'
            }, devMode);
            if (resp.status !== 200) return;
            const res = await resp.json();
            setNouns(res);
        })();
    }, []);

    function startGame(reverseGame = false) {
        if (!nouns.length) return;
        setReverse(reverseGame);
        const newBatch = nouns
            .sort(() => 0.5 - Math.random())
            .slice(0, BATCH_SIZE);
        const newOptions = newBatch.map(m => {
            const decoys = nouns
                .filter(f => reverseGame ? f.eng !== m.eng : f.nom !== m.nom)
                .sort(() => 0.5 - Math.random())
                .slice(0, OPTION_COUNT-1);
            return [m, ...decoys]
                .sort(() => 0.5 - Math.random());
        });
        setBatch(newBatch);
        setOptions(newOptions);
        setRound(0);
        setGameOver(false);
        setPlay(true);
    };

    function submitAnswer(option) {
        if (gameOver) return;
        const nextRound = batch.findIndex((v,i) => !('correct' in v) && i !== round);
        setBatch(prev => prev.map((v, i) => i === round ? {...v, correct: batch[round].id === option.id, givenAnswer: option} : v));
        setTimeout(() => {
            nextRound > -1 ? setRound(nextRound) : setGameOver(true);
        }, ADVANCE_DELAY);
    };

    return (
        play ? (
            <div className="VocabBuilderBody">
                <div className="VocabBuilderQuestion">
                    {reverse ? batch[round].nom : batch[round].eng}
                </div>
                <div className="VocabBuilderOptions">
                    {options[round].map(option => (
                        <div
                            key={`${round}:${option.id}`}
                            onClick={() => !gameOver && !('correct' in batch[round]) && submitAnswer(option)}
                            className={classNames({
                                VocabBuilderCorrect: 'correct' in batch[round] && option.id === batch[round].id,
                                VocabBuilderIncorrect: 'correct' in batch[round] && !(option.id === batch[round].id),
                                VocabBuilderCurrent: 'correct' in batch[round] && batch[round].givenAnswer.id === option.id,
                            })}
                        >
                            <div>
                                {reverse ? option.eng : option.nom}
                            </div>
                            <div className="VocabBuilderAnswer">
                                {'correct' in batch[round] && (reverse ? option.nom : option.eng)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="VocabBuilderScore">
                    {batch.map((v, i) => (
                        <span
                            key={i}
                            className={classNames({
                                VocabBuilderCurrent: i === round,
                                VocabBuilderCorrect: 'correct' in v && v.correct,
                                VocabBuilderIncorrect: 'correct' in v && !v.correct,
                            })}
                            onClick={() => setRound(i)}
                        >
                            {i+1}
                        </span>
                    ))}
                </div>
                {gameOver && (
                    <div className="VocabBuilderReplay" onClick={() => gameOver && startGame(reverse)}>
                        Play Again
                    </div>
                )}
            </div>
        ) : (
            <div className="VocabBuilderMenu">
                <div className="VocabBuilderTitle">
                    Vocabulary Builder
                </div>
                <div className="VocabBuilderGameOptions" onClick={() => startGame()}>
                    <div onClick={(e) => startGame()}>
                        English - Latvian
                    </div>
                    <div onClick={(e) => startGame(true)}>
                        Latvian - English
                    </div>
                </div>
            </div>
        )
    )
};
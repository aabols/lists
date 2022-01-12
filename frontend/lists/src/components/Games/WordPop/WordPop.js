import React, { useState, useEffect, useRef } from 'react';
import fetchLanis from '../../../functions/fetchLanis';
import './WordPop.css';
import 'classnames';
import uuid from 'react-uuid';
import classNames from 'classnames';
import correctAudio from './correct.mp3';
import incorrectAudio from './incorrect.mp3'
import { useDev } from '../../../contexts/DevContext';

// const incorrectAudio = new Audio('./incorrect.mp3');
const correctSound = new Audio(correctAudio);
const incorrectSound = new Audio(incorrectAudio);

export default function WordPop() {
    function playCorrect() {
        correctSound.pause();
        correctSound.currentTime = 0;
        incorrectSound.pause();
        incorrectSound.currentTime = 0;
        correctSound.play();
    };
    function playIncorrect() {
        correctSound.pause();
        correctSound.currentTime = 0;
        incorrectSound.pause();
        incorrectSound.currentTime = 0;
        incorrectSound.play();
    };
    const [bubbles, setBubbles] = useState([]);
    const [dictionary, setDictionary] = useState([]);
    const [score, setScore] = useState(0);
    const [missedWords, setMissedWords] = useState([]);
    const lifeSymbol = '\u2764';
    const [lives, setLives] = useState(5);

    let newWordInterval = useRef();

    const devMode = useDev();

    useEffect(() => {
        if (!dictionary.length) return;
        newWordInterval.current = setInterval(() => {
            addRandomWord();
        }, 1000);

        return () => clearInterval(newWordInterval.current);
    }, [dictionary]);

    function generateFakeNouns(nouns) {
        function genFakes(noun) {
            let fakes = [];
            for (let i=0; i<noun.length; i++) {
                const l = noun.substring(i,i+1);
                let fn = null;
                switch (l) {
                    case 'a':
                        fn = `${noun.substring(0,i)}ā${noun.substring(i+1)}`;
                        break;
                    case 'ā':
                        fn = `${noun.substring(0,i)}a${noun.substring(i+1)}`;
                        break;
                    case 'e':
                        fn = `${noun.substring(0,i)}ē${noun.substring(i+1)}`;
                        break;
                    case 'ē':
                        fn = `${noun.substring(0,i)}e${noun.substring(i+1)}`;
                        break;
                    case 'i':
                        fn = `${noun.substring(0,i)}ī${noun.substring(i+1)}`;
                        break;
                    case 'ī':
                        fn = `${noun.substring(0,i)}i${noun.substring(i+1)}`;
                        break;
                    case 'u':
                        fn = `${noun.substring(0,i)}ū${noun.substring(i+1)}`;
                        break;
                    case 'ū':
                        fn = `${noun.substring(0,i)}u${noun.substring(i+1)}`;
                        break;
                }
                fn && fakes.push(fn);
            }
            return fakes;
        }
        let fakeNouns = [];
        nouns.forEach(n => {
            fakeNouns.push(...genFakes(n.nom));
        })
        return fakeNouns;
    }

    useEffect(() => {
        async function getNouns() {
            const res = await fetchLanis({
                type: 'noun',
                action: 'select'
            }, devMode);
            if (res.status === 200) {
                const nouns = await res.json();
                const fakeNouns = generateFakeNouns(nouns);
                setDictionary([...nouns.map(n => ({
                    id: n.id,
                    latvian: n.nom,
                    english: n.eng
                })),...fakeNouns.map(fn => ({id: uuid(), latvian: fn}))]);
            }
        };

        getNouns();
    }, []);

    useEffect(() => {
        if (lives === 0) {
            setBubbles(prev => prev.map(b => ({...b, class:{...b.class, WordPopPaused: true}})));
            clearInterval(newWordInterval.current);
        }


    }, [lives]);

    function addRandomWord() {
        const dictionaryIndex = Math.round((dictionary.length-1)*Math.random());
        const targetWord = dictionary[dictionaryIndex];
        const horizontalPosition = Math.random();
        let posStyle = {};
        if (horizontalPosition > 0.5) {
            posStyle = {
                right: `${Math.round((1-horizontalPosition)*100).toString()}%`
            };
        } else {
            posStyle = {
                left: `${Math.round((horizontalPosition)*100).toString()}%`
            }
        }
        setBubbles(prev => [...prev, {
            id: uuid(),
            wordId: targetWord.id,
            word: targetWord.latvian,
            translation: targetWord.english || "Gotcha!",
            posStyle: posStyle,
            class: {
                WordPopBubble: true,
                WordPopUnpopped: true,
                WordPopPopped: false,
                WordPopBubbleRising: true,
                WordPopGotcha: !targetWord.english
            }
        }]);
    }

    function popBubble(id, uncaught=false) {
        const bubble = bubbles.find(b => b.id === id);
        const dictionaryEntry = dictionary.find(d => d.id === bubble.wordId);

        if (uncaught && !!dictionaryEntry.english) {
            setMissedWords(prev => {
                if (!prev.find(p => p.id === dictionaryEntry.id)) {
                    // word not yet in missed words
                    return [...prev, {...dictionaryEntry, missedCount: 1}];
                } else {
                    return prev.map(p => p.id === dictionaryEntry.id ? {...p, missedCount: p.missedCount+1} : p)
                }
            });
        }

        if (!uncaught && !!dictionaryEntry.english) {
            setMissedWords(prev => prev.filter(p => p.id !== dictionaryEntry.id));
            // setLives(prev => Math.min(prev + 1,5));
        }

        if ((uncaught && !dictionaryEntry.english) || (!uncaught && !!dictionaryEntry.english)) {
            // playCorrect();
        } else {
            // playIncorrect();
            setLives(prev => Math.max(prev - 1,0));
        }

        setBubbles(prev => prev.map(b => b.id === id ? {
            ...b,
            class: {
                ...b.class,
                WordPopUnpopped: false,
                WordPopPopped: true,
                WordPopUncaught: uncaught
            }
        } : b));
        const timer = setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.id !== id));
        }, uncaught && !!dictionaryEntry.english ? 2000 : 500)
    }

    function handleBodyClick(e) {
        // addRandomWord();
    }

    function handleBubbleClick(e) {
        e.stopPropagation();
        popBubble(e.target.parentElement.id);
    }

    function handleBubbleRisen(e) {
        popBubble(e.target.id, true);
    }

    return (
        <div className="WordPopBody" onClick={handleBodyClick}>
            {bubbles.map(b => (
                <div id={b.id} key={b.id} className={classNames(b.class)} style={b.posStyle} onAnimationEnd={handleBubbleRisen}>
                    <div className="WordPopContent" onClick={handleBubbleClick}>
                        {b.word}
                    </div>
                    <div className="WordPopResult">
                        {b.translation}
                    </div>
                </div>
            ))}
            <div className="WordPopToolbar">
                {/* <div className="WordPopScore">
                    Score: {score}
                </div> */}
                <div className="WordPopLives">
                    {
                        lives > 0 ? lifeSymbol.repeat(lives) : "GAME OVER"
                    }
                </div>
                {/* <div className = "WordPopMissed">
                    Missed: {missedWords.sort((a,b) => b.missedCount - a.missedCount).map(w => (
                        <span key={w.id} className="WordPopMissedWord">
                            {w.latvian}({w.missedCount})
                        </span>
                    ))}
                </div> */}
            </div>
        </div>
    )
}

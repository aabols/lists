import React, { useState, useEffect } from 'react';
import fetchLanis from '../../../functions/fetchLanis';
import classNames from 'classnames';

const OPTION_COUNT = 16;

function breakIntoSyllables(word) {
    switch (word) {
        case 'garastāvoklis':
            return ['ga', 'ra', 'stā', 'vo', 'klis'];
        case 'ieeja':
            return ['ie', 'e', 'ja'];
        case 'augstums':
            return ['augs', 'tums'];
        case 'celtniecība':
            return ['celt', 'nie', 'cī', 'ba'];
        case 'pildspalva':
            return ['pild', 'spal', 'va'];
        case 'granātābols':
            return ['gra', 'nāt', 'ā', 'bols'];
        case 'situācija':
            return ['si', 'tu', 'ā', 'ci', 'ja'];
        case 'bibliotēka':
            return ['bib', 'li', 'o', 'tē', 'ka'];
        case 'uzacs':
            return ['uz', 'acs'];
        case 'pulkstenis':
            return ['pulk', 'ste', 'nis'];
        default:
    }
    const syllableRegex = /[^aāeēiīouū]*[aāeēiīouū]+(?:[^aāeēiīouū]*$|[^aāeēiīouū](?=[^aāeēiīouū]))?/gi;
    if (word.endsWith('klis')) return [...breakIntoSyllables(word.substring(0,word.length-4)), 'klis'];
    return word.match(syllableRegex);
};

export default function Syllable() {
    const [nouns, setNouns] = useState();
    const [current, setCurrent] = useState();
    useEffect(() => {
        (async () => {
            const resp = await fetchLanis({type: 'noun',action: 'select'}, window.location.href.includes('localhost'));
            if (resp.status !== 200) return;
            const res = await resp.json();
            if (!res.length) return;
            setNouns(
                res.sort(() => 0.5 - Math.random())
            );
        })();
    }, []);

    function startGame() {
        if (!nouns) return;
        setCurrent(prev => {
            const newIndex = prev ? (prev.index + 1) % nouns.length : 0;
            const decoyWords = nouns
                .filter((v, i) => i !== newIndex)
                .sort(() => 0.5 - Math.random())
                .slice(0, OPTION_COUNT)
                .flatMap((t,v,i) => breakIntoSyllables(t.nom));
            console.log(decoyWords);
            return {
                index: newIndex
            };
        });
    };

    if (!nouns) return (
        <div className="SyllableLoading">
            Loading...
        </div>
    );

    return (
        <div>
            {current && nouns[current.index].nom}
            <div className="SyllablePlay" onClick={() => startGame()}>
                Play Syllable
            </div>
            {nouns.map(n => (
                <div key={n.id}>
                    {n.nom}: {breakIntoSyllables(n.nom).join('-')}
                </div>
            ))}
        </div>
    );
};
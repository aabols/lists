import React from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import NavigationBar from './NavigationBar';
import Login from './Login';
import User from './User';
import BetterLists from './BetterLists';
import SportsMenu from './SportsMenu';
import Squash from './Squash';
import Gym from './Gym';
import Cookbook from './Cookbook';
import Fifths from './Fifths';
import WordPop from './Games/WordPop/WordPop';
import Nouns from './tmp/Nouns';
import VocabBuilder from './Games/VocabBuilder/VocabBuilder';
import GameMenu from './Games/GameMenu';
import Syllable from './Games/Syllable/Syllable';

export default function LanisRouter() {
    const auth = useAuth();

    const topStyle = {

    };
    const bottomStyle = {
        flexGrow: "1",
    };
    return (
        <Router>
            <div style={topStyle}>
                <Route path="/"><NavigationBar/></Route>
            </div>
            <div style={bottomStyle}>
                <Switch>
                    <Route path="/games" exact><GameMenu/></Route>
                    <Route path="/games/wordpop"><WordPop/></Route>
                    <Route path="/games/vocabbuilder"><VocabBuilder/></Route>
                    <Route path="/games/syllable"><Syllable/></Route>
                    {
                        !auth && <Route path="/"><Login /></Route>
                    }

                    <Route path="/user" exact><User/></Route>

                    <Route path="/lists"><BetterLists/></Route>

                    <Route path="/sports" exact><SportsMenu/></Route>
                    <Route path="/sports/squash"><Squash/></Route>
                    <Route path="/sports/gym"><Gym/></Route>

                    <Route path='/cookbook'><Cookbook/></Route>

                    <Route path="/fifths"><Fifths/></Route>
                    <Route path="/tmp/nouns"><Nouns/></Route>
                </Switch>
            </div>
        </Router>
    )
}
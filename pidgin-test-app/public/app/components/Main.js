import React from 'react'
import { Switch, Route } from 'react-router-dom'
import AllTests from '../pages/AllTests'
import Home from '../pages/Home'
import ChooseTests from '../pages/ChooseTests'

const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Home}/>
            <Route exact path='/home' component={Home}/>
            <Route path='/AllTests' component={AllTests}/>
            <Route path='/ChooseTests' component={ChooseTests}/>

        </Switch>
    </main>
);

export default Main

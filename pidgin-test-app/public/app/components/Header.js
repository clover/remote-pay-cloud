import React from 'react'
import { Link } from 'react-router-dom'

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
    <header>
        <nav>
            <ul>
                <li><Link to='/home'>Home</Link></li>
                <li><Link to='/AllTests'>Run All Tests</Link></li>
                <li><Link to='/ChooseTests'>ChooseTests Tests</Link></li>
            </ul>
        </nav>
    </header>
);

export default Header

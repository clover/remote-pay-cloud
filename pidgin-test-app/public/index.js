import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Layout from './app/Layout';

render((
    <BrowserRouter>
        <Layout />
    </BrowserRouter>
), document.getElementById('react-root'));

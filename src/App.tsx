import React from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from './pages/Home/Home';
import Critmas from './pages/Critmas/Critmas';

function App() {
    return (
        <div className="app">
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/critmas/*" element={<Critmas/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;

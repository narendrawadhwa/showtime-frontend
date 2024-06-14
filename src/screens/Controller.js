import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../screens/home/Home';
import Details from '../screens/details/Details';
import BookShow from '../screens/bookshow/BookShow';
import Confirmation from '../screens/confirmation/Confirmation';
import 'tailwindcss/tailwind.css';
import './Container.css';


const Controller = () => {
    const baseUrl = "https://backend-project-amvf.onrender.com";
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const handleSelectMovie = (movieId) => {
        setSelectedMovieId(movieId);
    };

    return (
        <Router>
            <div className="main-container">
                <Routes>
                    <Route
                        path="/"
                        element={<Home baseUrl={baseUrl} />}
                    />
                    <Route
                        path="/movie/:id"
                        element={<Details onSelectMovie={handleSelectMovie} baseUrl={baseUrl} />}
                    />
                    <Route
                        path="/bookshow/:id"
                        element={<BookShow selectedMovieId={selectedMovieId} baseUrl={baseUrl} />}
                    />
                    <Route
                        path="/confirm/:id"
                        element={<Confirmation baseUrl={baseUrl} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default Controller;

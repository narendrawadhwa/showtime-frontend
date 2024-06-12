import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../screens/home/Home';
import Details from '../screens/details/Details';
import BookShow from '../screens/bookshow/BookShow';
import Confirmation from '../screens/confirmation/Confirmation';
import 'tailwindcss/tailwind.css';
import './Container.css';


const Controller = () => {
    const baseUrl = "http://localhost:8085/api/";
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const handleSelectMovie = (movieId) => {
        setSelectedMovieId(movieId);
    };

    return (
        <Router>
            <div className="main-container">
                <Routes>
                    <Route 
                        path="https://showtime-frontend-vltk.onrender.com/"   
                        element={<Home baseUrl={baseUrl} />} 
                    />
                    <Route 
                        path="https://showtime-frontend-vltk.onrender.com/movie/:id" 
                        element={<Details onSelectMovie={handleSelectMovie} baseUrl={baseUrl} />} 
                    />
                    <Route
                        path="https://showtime-frontend-vltk.onrender.com/bookshow/:id"
                        element={<BookShow selectedMovieId={selectedMovieId} baseUrl={baseUrl} />} 
                    />
                    <Route
                        path="https://showtime-frontend-vltk.onrender.com/confirm/:id"
                        element={<Confirmation baseUrl={baseUrl} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default Controller;

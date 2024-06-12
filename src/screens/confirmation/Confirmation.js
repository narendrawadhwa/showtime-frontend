import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../common/header/Header';
import axios from 'axios';
import { FaMapMarkerAlt, FaClock, FaTheaterMasks } from 'react-icons/fa'; 
import { IoTicket, IoPricetags, IoLanguage } from "react-icons/io5";
import QRCode from 'qrcode.react'; 

import './Confirmation.css';

const ConfirmationPage = ({ baseUrl }) => {
    const location = useLocation();
    const [movieDetails, setMovieDetails] = useState(null);
    const [showDetails, setShowDetails] = useState(null);

    console.log('Show ID:', location.state.showId);
    console.log('Movie ID:', location.state.movieId);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await axios.get(`${baseUrl}movies/${location.state.movieId}`);
                setMovieDetails(response.data);
                console.log('Movie Details Response:', response.data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        fetchMovieDetails();
    }, [baseUrl, location.state.movieId]);

    useEffect(() => {
        if (movieDetails) {
            const selectedShow = movieDetails.shows.find(show => show.id === location.state.showId);
            setShowDetails(selectedShow);
            console.log('Selected Show:', selectedShow);
        }
    }, [movieDetails, location.state.showId]);

    return (
        <React.Fragment>
            <Header />
            <div className="confirmation-page">
                <div className="left-section">
                    {movieDetails && <img src={movieDetails.poster_url} alt="Movie Poster" className="movie-poster" />}
                </div>
                <div className="middle-section">
                    {movieDetails && showDetails && (
                        <div className="details-card">
                            <h2>{movieDetails.title}</h2>
                            <div className="show-details">
                                <span className="show-detail"><FaTheaterMasks className="icon" /> {showDetails.theatre.name}</span>
                                <span className="show-detail"><FaMapMarkerAlt className="icon"/> {showDetails.theatre.city}</span>
                                <span className="show-detail"><FaClock className="icon"/> {showDetails.show_timing}</span>
                                <span className="show-detail"><IoLanguage className="icon"/> {showDetails.language}</span>
                                <span className="show-detail"><IoTicket className="icon" /> {location.state.seats}</span>
                                <span className="show-detail"><IoPricetags className="icon" /> Rs. {showDetails.unit_price}</span>
                            </div>
                            <div className="qr-code">
                                <QRCode value={location.state.reference_number} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="right-section">
                    <div className="pricing-card">
                        <h3>Pricing</h3>
                        {showDetails && (
                            <React.Fragment>
                                <div className="price-detail">
                                    <span>{location.state.seats} x Rs. {showDetails.unit_price} = Rs. {location.state.seats * showDetails.unit_price}</span>
                                </div>
                                {location.state.couponCode && location.state.price_before_coupon !== location.state.final_amount && (
                                    <div className="price-detail">
                                        <span>Coupon ({location.state.couponCode}) Applied:</span>
                                        <span>- Rs. {location.state.price_before_coupon - location.state.final_amount}</span>
                                    </div>
                                )}
                                <hr />
                                <div className="price-detail">
                                    <strong>Final Price:</strong>
                                    <strong>Rs. {location.state.final_amount}</strong>
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ConfirmationPage;

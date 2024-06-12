import React from 'react';
import { Route, useNavigate } from 'react-router-dom';

const isTokenValid = () => {
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('authTokenExpiration');
    if (!token || !expiration) return false;

    const currentTime = Date.now();
    return currentTime < parseInt(expiration);
};

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const navigate = useNavigate();

    if (!isTokenValid()) {
        navigate('/');
        return null;
    }

    return <Route {...rest} element={Component} />;
};

export default ProtectedRoute;

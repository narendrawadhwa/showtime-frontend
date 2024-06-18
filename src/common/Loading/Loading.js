import React from 'react';
import MoonLoader from 'react-spinners/MoonLoader';
import './Loading.css'
const Loading = () => {
    return (
        <div className="loading">
            <MoonLoader
                height={35}
                width={4}
                radius={2}
                margin={2}
                color="#000"
                loading={true}
            />
        </div>
    );
};

export default Loading;

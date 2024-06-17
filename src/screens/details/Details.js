import React, { useState, useEffect } from 'react';
import Header from '../../common/header/Header';
import Typography from '@material-ui/core/Typography';
import './Details.css';
import YouTube from 'react-youtube';
import { TiStarFullOutline } from "react-icons/ti";
import { LuDot } from "react-icons/lu";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'tailwindcss/tailwind.css';


const Details = ({ onSelectMovie, baseUrl }) => {

    const totalStars = 5;

    const [movie, setMovie] = useState({
        _id: "",
        genres: [],
        trailer_url: "",
        artists: []
    });

    const [starIcons, setStarIcons] = useState([
        { id: 1, stateId: "star1", color: "gray" },
        { id: 2, stateId: "star2", color: "black" },
        { id: 3, stateId: "star3", color: "black" },
        { id: 4, stateId: "star4", color: "black" },
        { id: 5, stateId: "star5", color: "black" }
    ]);

    const params = useParams();
    const [starStyles, setStarStyles] = useState(Array.from({ length: totalStars }, () => "empty"));


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseUrl}api/movies/${params.id}`);
                const fetchedMovie = response.data;
                setMovie(fetchedMovie);
                onSelectMovie(fetchedMovie._id);
                console.log('Movie State:', fetchedMovie);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        fetchData();
    }, [baseUrl, params.id]);



    const artistClickHandler = (url) => {
        window.open(url, '_blank');
    }

    const starClickHandler = (id) => {
        setStarIcons(starIcons.map(star => ({
            ...star,
            color: star.id <= id ? "yellow" : "grey"
        })));
    }

    const handleStarClick = (index) => {
        const newStarStyles = [...starStyles];
        for (let i = 0; i <= index; i++) {
            newStarStyles[i] = "filled";
        }
        for (let i = index + 1; i < starStyles.length; i++) {
            newStarStyles[i] = "empty";
        }
        setStarStyles(newStarStyles);
    };

    const releaseYear = new Date(movie.release_date).getFullYear();

    const durationHours = Math.round(movie.duration / 60);


    const handlePlayerReady = (event) => {
        console.log('YouTube player is ready!');
        event.target.playVideo();
    };

    const opts = {
        height: '420',
        width: '700',
        playerVars: {
            autoplay: 0
        }
    };



    return (
        <div className="details">
            <Header id={params.id} baseUrl={baseUrl} showBookShowButton="true" />

            <div className='details-content'>
                <div className="col-one">
                    <div style={{ marginBottom: '10px' }}>
                        <Typography variant="headline" component="h2" className='title'>{movie.title}</Typography>
                        <div className='time'>
                            {releaseYear}<LuDot />{durationHours}h
                        </div>

                        <div className='rate-movie-medium'>
                            <Typography>
                                <span className="ratings"> ShowTime Rating</span><br />
                                <span className='rating-star'>
                                    <TiStarFullOutline className='star' /> <span style={{ color: 'white' }}>{movie.critic_rating}<span style={{ fontSize: '18px', color: '#dad8d8', fontWeight: 400 }}>/5</span></span>
                                </span>
                            </Typography>
                            <div>
                                <Typography>
                                    <span className="ratings">Your Rating </span>
                                </Typography>
                                <div style={{display:'flex'}} className='star-box'>
                                    {starStyles.map((style, index) => (
                                        <TiStarFullOutline
                                            className={style === "filled" ? "filled-star" : "empty-star"}
                                            key={"star" + index}
                                            onClick={() => handleStarClick(index)}
                                        />
                                    ))}

                                </div>
                            </div>
                        </div>

                        <div>
                            <Typography style={{ margin: 0 }}>
                                {movie.genres.map((genre, index) => (
                                    <span key={index} className="genreTag">{genre}</span>
                                ))}
                            </Typography>
                        </div>
                    </div>


                    <div className='rate-movie'>
                        <Typography>
                            <span className="ratings"> ShowTime Rating</span><br />
                            <span className='rating-star'>
                                <TiStarFullOutline className='star' /> <span style={{ color: 'white' }}>{movie.critic_rating}<span style={{ fontSize: '18px', color: '#dad8d8', fontWeight: 400 }}>/5</span></span>
                            </span>
                        </Typography>
                        <div>
                            <Typography>
                                <span className="ratings">Your Rating </span>
                            </Typography>
                            <div className='star-box'>
                                {starStyles.map((style, index) => (
                                    <TiStarFullOutline
                                        className={style === "filled" ? "filled-star" : "empty-star"}
                                        key={"star" + index}
                                        onClick={() => handleStarClick(index)}
                                    />
                                ))}

                            </div>
                        </div>
                    </div>



                </div>

                <div className='top'>
                    <div className="left-top">
                        <img src={movie.poster_url} className="movie-poster" alt={movie.title} />
                    </div>

                    <div className="middle-top">
                        <YouTube
                            videoId={movie.trailer_url.split("?v=")[1]}
                            opts={opts}
                            onReady={handlePlayerReady}
                            style={{ height: '420px' }}
                        />
                    </div>


                </div>
                <div className='bottom'>

                    <Typography className='plot'><a href={movie.wiki_url} className='wiki-link'>(Wiki Link)</a> <span>{movie.story_line}</span></Typography>
                    <div className="artist-wrapper">
                        {movie.artists != null && movie.artists.map(artist => (
                            <div key={artist.id} className="artist-container" onClick={() => artistClickHandler(artist.wiki_url)}        >
                                <img src={artist.profile_url} alt={`${artist.first_name} ${artist.last_name}`} className='artist-img' />
                                <p className='artist-name'>{artist.first_name} {artist.last_name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;

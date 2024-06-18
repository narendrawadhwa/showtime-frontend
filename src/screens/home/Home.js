import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from '../../common/header/Header';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper
    },
    upcomingMoviesHeading: {
        textAlign: 'center',
        background: '#ff9999',
        padding: '8px',
        fontSize: '1rem'
    },
    gridListUpcomingMovies: {
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
        width: '100%'
    },
    gridListMain: {
        transform: 'translateZ(0)',
        cursor: 'pointer'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 240,
        maxWidth: 240
    },
    title: {
        color: theme.palette.primary.light,
    }
});

const Home = ({ baseUrl }) => {
    const navigate = useNavigate();
    const [movieName, setMovieName] = useState("");
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [releasedMovies, setReleasedMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [artists, setArtists] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [artistsList, setArtistsList] = useState([]);
    const [releaseDateStart, setReleaseDateStart] = useState("");
    const [releaseDateEnd, setReleaseDateEnd] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [upcomingRes, releasedRes, genresRes, artistsRes] = await Promise.all([
                    axios.get(`${baseUrl}api/movies?status=PUBLISHED`),
                    axios.get(`${baseUrl}api/movies?status=RELEASED`),
                    axios.get(`${baseUrl}api/genres`),
                    axios.get(`${baseUrl}api/artists`)
                ]);
                setUpcomingMovies(upcomingRes.data.movies);
                setReleasedMovies(releasedRes.data.movies);
                setGenresList(genresRes.data.genres);
                setArtistsList(artistsRes.data.artists);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
                fetchData();

    }, []);

    const movieClickHandler = (id) => {
        navigate('/movie/' + id);
    };

    const filterApplyHandler = async () => {
        if (movieName !== "") {
            queryString += "&title=" + movieName;
        }
        if (genres.length > 0) {
            queryString += "&genres=" + genres.join(',');
        }
        if (artists.length > 0) {
            queryString += "&artists=" + artists.join(',');
        }
        if (releaseDateStart !== "") {
            queryString += "&releaseDateStart=" + releaseDateStart;
        }
        if (releaseDateEnd !== "") {
            queryString += "&releaseDateEnd=" + releaseDateEnd;
        }

        
        try {
            const res = await axios.get(`${baseUrl}api/movies${encodeURI(queryString)}`);
            setReleasedMovies(res.data.movies);
        } catch (error) {
            console.error('Error filtering movies:', error);
        }
    };

    return (
        <div>
            <Header baseUrl={baseUrl} />
            <div className="upcomingMoviesHeading">
                <span>Upcoming Movies</span>
            </div>

            <GridList cols={5} className="gridListUpcomingMovies" >
                {upcomingMovies.map(movie => (
                    <GridListTile key={"upcoming" + movie._id}>
                        <img src={movie.poster_url} className="movie-poster" alt={movie.title} />
                        <GridListTileBar title={movie.title} />
                    </GridListTile>
                ))}
            </GridList>

            <div className="flex-container">
                <div className="left">
                    <GridList cellHeight={350} cols={4} className="gridListMain">
                        {releasedMovies.map(movie => (
                            <GridListTile onClick={() => movieClickHandler(movie.movieid)} className="released-movie-grid-item" key={"grid" + movie._id}>
                                <img src={movie.poster_url} className="movie-poster" alt={movie.title} />
                                <GridListTileBar
                                    title={movie.title}
                                    subtitle={<span>Release Date: {new Date(movie.release_date).toDateString()}</span>}
                                />
                            </GridListTile>
                        ))}
                    </GridList>
                </div>
                <div className="right">
                    <Card style={{padding:'20px'}}>
                    <FormControl className="formControl">
                                <Typography className="find-movie-title" color="textSecondary">
                                    FIND MOVIES BY:
                                </Typography>
                            </FormControl>
                        <CardContent className='find-movie-form'>
                                                 <FormControl className="formControl">
                                <InputLabel htmlFor="movieName">Movie Name</InputLabel>
                                <Input id="movieName" onChange={(e) => setMovieName(e.target.value)} />
                            </FormControl>
                            <FormControl className="formControl">
                                <InputLabel htmlFor="select-multiple-checkbox">Genres</InputLabel>
                                <Select
                                    multiple
                                    input={<Input id="select-multiple-checkbox-genre" />}
                                    renderValue={selected => selected.join(',')}
                                    value={genres}
                                    onChange={(e) => setGenres(e.target.value)}
                                >
                                    {genresList.map(genre => (
                                        <MenuItem key={genre.genreid} value={genre.genre}>
                                            <Checkbox checked={genres.indexOf(genre.genre) > -1} />
                                            <ListItemText primary={genre.genre} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl className="formControl">

                            <InputLabel htmlFor="select-multiple-checkbox">Artists</InputLabel>
    <Select
        multiple
        input={<Input id="select-multiple-checkbox" />}
        renderValue={selected => selected.join(',')}
        value={artists}
        onChange={(e) => setArtists(e.target.value)}
    >
        {artistsList.map(artist => (
            <MenuItem key={artist.artistid} value={`${artist.first_name} ${artist.last_name}`}>
                <Checkbox checked={artists.indexOf(`${artist.first_name} ${artist.last_name}`) > -1} />
                <ListItemText primary={`${artist.first_name} ${artist.last_name}`} />
            </MenuItem>
        ))}
    </Select>
</FormControl>
<FormControl className="formControl">
                                <TextField
                                    id="releaseDateStart"
                                    label="Release Date Start"
                                    type="date"
                                    defaultValue=""
                                    InputLabelProps={{ shrink: true }}
                                    onChange={(e) => setReleaseDateStart(e.target.value)}
                                />
                            </FormControl>

                            <FormControl className="formControl">
                                <TextField
                                    id="releaseDateEnd"
                                    label="Release Date End"
                                    type="date"
                                    defaultValue=""
                                    InputLabelProps={{ shrink: true }}
                                    onChange={(e) => setReleaseDateEnd(e.target.value)}
                                />
                            </FormControl>
                            <FormControl className="formControl">
                                <Button onClick={() => filterApplyHandler()} variant="contained" color="primary">
                                    APPLY
                                </Button>
                            </FormControl>
                        </CardContent>
                    </Card>
                </div> </div>
        </div>
    );
};
export default withStyles(styles)(Home);

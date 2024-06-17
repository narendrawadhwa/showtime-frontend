import React, { useState, useEffect } from 'react';
import Header from '../../common/header/Header';
import Typography from '@material-ui/core/Typography';
import './BookShow.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const BookShow = ({ baseUrl }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [couponCodes, setCouponCodes] = useState([]);
    const [token, setToken] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        
        location: "",
        theatre: "",
        language: "",
        showDate: "",
        tickets: 0,
        unitPrice: 500,
        availableTickets: 0,
        reqLocation: "dispNone",
        reqTheatre: "dispNone",
        reqLanguage: "dispNone",
        reqShowDate: "dispNone",
        reqTickets: "dispNone",
        locations: [],
        languages: [],
        theatres: [],
        showDates: [],
        showTimes: [],
        originalShows: [],
        movieId: '', 
        selectedCoupon: null, 
    finalPrice: 0 

    });

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        console.log(storedToken)
        if (storedToken) {
            setToken(storedToken);
        } else {
            setAlert({ open: true, message: "Login first to access this page", severity: "warning" });
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchCouponCodes = async () => {
            try {
                const response = await axios.get(`${baseUrl}api/user/coupons`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Coupon Codes:", response.data.coupons);
                setCouponCodes(response.data.coupons);
            } catch (error) {
                console.error('Error fetching coupon codes:', error);
            }
        };
        
        fetchCouponCodes();
    }, [baseUrl]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseUrl}api/movies/${id}`);
                console.log("Response Data",response.data)
                const originalShows = response.data.shows;
                const newLocations = [...new Set(originalShows.map(show => show.theatre.city))];
                setState(prevState => ({
                    ...prevState,
                    originalShows: originalShows,
                    locations: newLocations.map(loc => ({ id: loc, location: loc })),
                    movieId: response.data._id
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id, baseUrl]);

    useEffect(() => {
        const fetchCouponCodes = async () => {
            try {
                const response = await axios.get(`${baseUrl}api/auth/coupons`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCouponCodes(response.data.coupons);
                console.log(response.data.coupons)
            } catch (error) {
                console.error('Error fetching coupon codes:', error);
            }
        };

        if (token) {
            fetchCouponCodes();
        }
    }, [baseUrl, token]);

    const locationChangeHandler = (event) => {
        const selectedLocation = event.target.value;
        const newTheatres = state.originalShows
            .filter(show => show.theatre.city === selectedLocation)
            .map(show => ({ id: show.theatre.name, theatre: show.theatre.name }));

        setState(prevState => ({
            ...prevState,
            location: selectedLocation,
            theatres: newTheatres,
            reqLocation: "dispNone",
            reqTheatre: "dispNone",
            reqLanguage: "dispNone",
            reqShowDate: "dispNone",
            reqTickets: "dispNone",
            language: "",
            showDate: "",
            tickets: 0
        }));
    };

    const theatreChangeHandler = (event) => {
        const selectedTheatre = event.target.value;
        const newLanguages = state.originalShows
            .filter(show => show.theatre.city === state.location && show.theatre.name === selectedTheatre)
            .map(show => ({ id: show.language, language: show.language }));

        setState(prevState => ({
            ...prevState,
            theatre: selectedTheatre,
            languages: newLanguages,
            reqTheatre: "dispNone",
            reqLanguage: "dispNone",
            reqShowDate: "dispNone",
            reqTickets: "dispNone",
            language: "",
            showDate: "",
            tickets: 0
        }));
    };

    const languageChangeHandler = (event) => {
        const selectedLanguage = event.target.value;
        const newShowDates = state.originalShows
            .filter(show => show.theatre.city === state.location && show.theatre.name === state.theatre && show.language === selectedLanguage)
            .map(show => ({ id: show.show_timing, showDate: show.show_timing }));

        setState(prevState => ({
            ...prevState,
            language: selectedLanguage,
            showDates: newShowDates,
            reqLanguage: "dispNone",
            reqShowDate: "dispNone",
            reqTickets: "dispNone",
            showDate: "",
            tickets: 0
        }));
    };

    const showDateChangeHandler = (event) => {
        const selectedShowDate = event.target.value;
        const { unit_price: unitPrice, available_seats: availableTickets } = state.originalShows
            .find(show => show.theatre.city === state.location && show.theatre.name === state.theatre && show.language === state.language && show.show_timing === selectedShowDate);

        setState(prevState => ({
            ...prevState,
            showDate: selectedShowDate,
            unitPrice: unitPrice,
            availableTickets: availableTickets,
            reqShowDate: "dispNone",
            reqTickets: "dispNone",
            tickets: 0
        }));
        console.log(availableTickets)
    };

    const ticketsChangeHandler = (event) => {
        const selectedTickets = parseInt(event.target.value, 10);
        
        setState(prevState => ({
            ...prevState,
            tickets: selectedTickets,
            reqTickets: isNaN(selectedTickets) || selectedTickets <= 0 ? "dispBlock" : "dispNone"
        }));
    
        if (state.selectedCoupon) {
            applyCouponHandler(state.selectedCoupon); 
         }
    };
    
    
    const applyCouponHandler = (coupon) => {
        const totalPrice = state.unitPrice * state.tickets;
    
        if (totalPrice < coupon.minTotalAmount) {
            console.error(`Coupon conditions not met: Total price (${totalPrice}) is less than the minimum required amount (${coupon.minTotalAmount})`);
    
            setState(prevState => ({
                ...prevState,
                selectedCoupon: null,
                finalPrice: totalPrice
            }));
            return;
        }
    
        const maxDiscount = (totalPrice * coupon.discount) / 100;
    
        const finalDiscount = Math.min(maxDiscount, coupon.maxDiscountAmount);
    
        const finalPrice = totalPrice - finalDiscount;
    
        setState(prevState => ({
            ...prevState,
            selectedCoupon: coupon,
            finalPrice: finalPrice
        }));

    };
    
    
    
    
    

    const bookShowButtonHandler = () => {
        console.log("Token:", token)

        if (!token) {
            setAlert({ open: true, message: "Login first to access this page", severity: "warning" });
            setTimeout(() => {
                navigate('/');
            }, 4000);     
            return;
            
        }
        const { location, theatre, language, showDate, tickets, movieId } = state;
    
        if (!location || !theatre || !language || !showDate || !tickets || tickets.length === 0) {
            setState(prevState => ({
                ...prevState,
                reqLocation: location ? "dispNone" : "dispBlock",
                reqTheatre: theatre ? "dispNone" : "dispBlock",
                reqLanguage: language ? "dispNone" : "dispBlock",
                reqShowDate: showDate ? "dispNone" : "dispBlock",
                reqTickets: tickets && tickets.length > 0 ? "dispNone" : "dispBlock"
            }));
            return;
        }
    

        const selectedShow = state.originalShows.find(show => (
            show.theatre.city === location &&
            show.theatre.name === theatre &&
            show.language === language &&
            show.show_timing === showDate
        ));
    
        if (selectedShow) {
            const { id: showId } = selectedShow;

            axios.post(
                `${baseUrl}auth/book-show`,
                {
                    movieId: state.movieId,
                    showId: showId,
                    seats: state.tickets,
                    couponCode: state.selectedCoupon ? state.selectedCoupon.code : null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(response => {
                const { reference_number, movie_name, show_time, price_before_coupon, price_after_coupon, final_amount, seats } = response.data;

            navigate(`/confirm/${id}`, {
                state: {
                    reference_number: reference_number,
                    movie_name: movie_name,
                    show_time: show_time,
                    price_before_coupon: price_before_coupon,
                    price_after_coupon: price_after_coupon,
                    final_amount: final_amount,
                    movieId: state.movieId,
                    showId: showId,
                    seats: state.tickets,
                    couponCode: response.data.couponCode
                    }
                });
            })
            .catch(error => {
                console.error('Error booking show:', error);
            });
        } else {
            console.error('Selected show not found');
        }
    };
    
    useEffect(() => {
        const totalPrice = state.unitPrice * state.tickets;
            setState(prevState => ({
            ...prevState,
            totalPrice: totalPrice,
            totalPriceVisibility: totalPrice <= 0 ? "hidden" : "visible"
        }));
    }, [state.tickets, state.unitPrice]);

    const [alert, setAlert] = React.useState({
        open: false,
        message: '',
        severity: 'success'
    });
  
    const handleClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <div>
            <Header />
            <div className="bookShow">
                <Typography className="back">
                    <Link to={`/movie/${id}`}>&#60; Back to Movie Details</Link>
                </Typography>

                <Card className="cardStyle" style={{padding:'5px 15px'}}>
                    <CardContent>
                        <Typography variant="headline" component="h2">
                            BOOK SHOW
                        </Typography><br />

                        <FormControl required className="formControl">
                            <InputLabel htmlFor="location">Choose Location:</InputLabel>
                            <Select
                                value={state.location}
                                onChange={locationChangeHandler}
                            >
                                {state.locations.map(loc => (
                                    <MenuItem key={loc.id} value={loc.location}>
                                        {loc.location}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className={state.reqLocation}>
                                <span className="red">Required</span>
                            </FormHelperText>
                        </FormControl>
                        <br /><br />

                        <FormControl required className="formControl">
                            <InputLabel htmlFor="theatre">Choose Theatre:</InputLabel>
                            <Select
                                value={state.theatre}
                                onChange={theatreChangeHandler}
                            >
                                {state.theatres.map(theatre => (
                                    <MenuItem key={theatre.id} value={theatre.theatre}>
                                        {theatre.theatre}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className={state.reqTheatre}>
                                <span className="red">Required</span>
                            </FormHelperText>
                        </FormControl>
                        <br /><br />

                        <FormControl required className="formControl">
                            <InputLabel htmlFor="language">Choose Language:</InputLabel>
                            <Select
                                value={state.language}
                                onChange={languageChangeHandler}
                            >
                                {state.languages.map(lang => (
                                    <MenuItem key={lang.id} value={lang.language}>
                                        {lang.language}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className={state.reqLanguage}>
                                <span className="red">Required</span>
                            </FormHelperText>
                        </FormControl>
                        <br /><br />

                        <FormControl required className="formControl">
                            <InputLabel htmlFor="showDate">Choose Show Date:</InputLabel>
                            <Select
                                value={state.showDate}
                                onChange={showDateChangeHandler}
                            >
                                {state.showDates.map(date => (
                                    <MenuItem key={date.id} value={date.showDate}>
                                        {date.showDate}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className={state.reqShowDate}>
                                <span className="red">Required</span>
                            </FormHelperText>
                        </FormControl>
                        <br /><br />

                        <FormControl required className="formControl">
    <InputLabel htmlFor="tickets">Number of Tickets</InputLabel>
    <Input
        id="tickets"
        type="number"
        value={state.tickets !== 0 ? state.tickets : ""}
        onChange={ticketsChangeHandler}
    />
    <FormHelperText className={state.reqTickets}>
        <span className="red">Required</span>
    </FormHelperText>
</FormControl>

                        <br /><br />

                     
<Typography style={{ display: state.tickets > 0 ? 'block' : 'none' }}>
<Typography>
    Available Seats: {state.availableTickets}
</Typography>
                        <Typography>
    Unit Price: Rs. {state.unitPrice}
</Typography>
<br />
{typeof state.totalPrice === 'number' && !isNaN(state.totalPrice) && state.totalPrice !== 0 && (
    <Typography>
        Total Price: Rs. {state.totalPrice}
    </Typography>
)}
    <br />
    <div>
    {couponCodes && couponCodes.length > 0 && (
        <Typography>
            Available Coupons:
        </Typography>
    )}
    <div>
        {couponCodes && couponCodes.map(coupon => (
            <div key={coupon.code}>
                <div className="coupon-container">
                    <div className="coupon-details">
                        <Typography style={{fontWeight:'600'}}>
                            {coupon.code}
                        </Typography >
                        <span className='detail'>
                            Min Value: Rs. {coupon.minTotalAmount}
                        </span>
                        <span className='detail'>
                            Max Discount: Rs. {coupon.maxDiscountAmount} ({coupon.discount}% off)
                        </span>
                    </div>
                    <div className="apply-btn">
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={state.selectedCoupon === coupon || state.totalPrice <= coupon.minTotalAmount}
                            onClick={() => applyCouponHandler(coupon)}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        ))}
    </div>
    {state.selectedCoupon ? (
        <Typography>
            Final Price after Coupon ({state.selectedCoupon.code}): Rs. {state.finalPrice}
        </Typography>
    ) : null}
</div>
</Typography>
<br />

<Button variant="contained" onClick={bookShowButtonHandler} color="primary"    style={{width:'100%'}}
    disabled={state.tickets.length === 0 || state.tickets.length > state.availableSeats}

>
    BOOK SHOW
</Button>
                    </CardContent>
                </Card>
<Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                <MuiAlert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </MuiAlert>
            </Snackbar>
            </div>
        </div>
    );
};

export default BookShow;

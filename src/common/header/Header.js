import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './Header.css';
import Button from '@material-ui/core/Button';
import logo from '../../assets/favicon.png';
import Modal from 'react-modal';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import PropTypes from 'prop-types';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IconButton } from '@material-ui/core';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    }
};

const TabContainer = (props) => {
    return (
        <Typography component="div" style={{ padding: 0, textAlign: 'center' }}>
            {props.children}
        </Typography>
    );
};

TabContainer.propTypes = {
    children: PropTypes.node.isRequired
};

const saveAuthToken = (token, expiresIn) => {
    const expirationTime = expiresIn * 1000;
    console.log(expiresIn)
    console.log(expirationTime)
    console.log(Date.now())
    localStorage.setItem('authToken', token);
    localStorage.setItem('authTokenExpiration', expirationTime);
};

const isTokenExpired = () => {
    const expirationTime = localStorage.getItem('authTokenExpiration');
   
    if (expirationTime) {
        return Date.now() >= expirationTime;
    } else {
        return true;
    }
};

const getAuthToken = () => {
    if (isTokenExpired()) {
        clearAuthToken();
        return null;
    }
    return localStorage.getItem('authToken');
};

const clearAuthToken = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
};

const Header = (props) => {
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [value, setValue] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [formState, setFormState] = useState({
        usernameRequired: "dispNone",
        username: "",
        loginPasswordRequired: "dispNone",
        loginPassword: "",
        firstnameRequired: "dispNone",
        firstname: "",
        lastnameRequired: "dispNone",
        lastname: "",
        emailRequired: "dispNone",
        email: "",
        registerPasswordRequired: "dispNone",
        registerPassword: "",
        contactRequired: "dispNone",
        contact: "",
        registrationSuccess: false
    });

    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        setLoggedIn(isLoggedIn);
    }, []);

    useEffect(() => {
        const authToken = getAuthToken();
        setLoggedIn(!!authToken);
        if (authToken) {
            const events = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
            events.forEach(event => {
                window.addEventListener(event, checkTokenExpiration);
            });
        }

        return () => {
            const events = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
            events.forEach(event => {
                window.removeEventListener(event, checkTokenExpiration);
            });
        };
    }, []);

    const checkTokenExpiration = () => {
        if (isTokenExpired()) {
            handleSessionExpired();
        }
    };

    const openModalHandler = () => {
        setModalIsOpen(true);
        setValue(0);
        setFormState({
            usernameRequired: "dispNone",
            username: "",
            loginPasswordRequired: "dispNone",
            loginPassword: "",
            firstnameRequired: "dispNone",
            firstname: "",
            lastnameRequired: "dispNone",
            lastname: "",
            emailRequired: "dispNone",
            email: "",
            registerPasswordRequired: "dispNone",
            registerPassword: "",
            contactRequired: "dispNone",
            contact: ""
        });
    };

    const closeModalHandler = () => {
        setModalIsOpen(false);
    };

    const tabChangeHandler = (event, newValue) => {
        setValue(newValue);
    };

    const loginClickHandler = () => {
        const { username, loginPassword } = formState;
    
        if (!username || !loginPassword) {
            setAlert({ open: true, message: "Please fill all required details.", severity: "warning" });
            return;
        }
    
        axios.post(`${backendUrl}/api/auth/login`, { username, password: loginPassword })
            .then(response => {
                if (response.data.token && response.data.expiresIn) {
                    const { token, expiresIn } = response.data;
                    saveAuthToken(token, expiresIn);
                    localStorage.setItem("loggedIn", true);
                    setLoggedIn(true);
                    setSessionExpired(false);
                    setAlert({ open: true, message: "Login successful!", severity: "success" });
                    closeModalHandler();
                } else {
                    console.error("Token not found in response.");
                    setAlert({ open: true, message: "Error Occured! Please try again later", severity: "error" });
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                if (error.response) {
                    if (error.response.status === 404) {
                        setAlert({ open: true, message: "User not found. Please check your username.", severity: "warning" });
                    } else if (error.response.status === 401) {
                        setAlert({ open: true, message: "Incorrect password. Please try again.", severity: "error" });
                    } else {
                        setAlert({ open: true, message: "Error Occured!", severity: "error" });
                    }
                } else {
                    setAlert({ open: true, message: "Network error. Please check your connection.", severity: "error" });
                }
            });
    };

    const inputChangeHandler = (event) => {
        const { id, value } = event.target;
        setFormState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const registerClickHandler = () => {
        const { firstname, lastname, email, registerPassword, contact } = formState;

        if (!firstname || !lastname || !email || !registerPassword || !contact) {
            setAlert({ open: true, message: "Please fill all required details.", severity: "warning" });
            return;
        }

        axios.post(`${baseUrl}api/auth/signup`, { first_name: firstname, last_name: lastname, email_address: email, password: registerPassword, mobile_number: contact })
            .then(response => {
                setFormState(prevState => ({
                    ...prevState,
                    registrationSuccess: true
                }));
                setAlert({ open: true, message: "Registration successful! Please login.", severity: "success" });
                setValue(0);
            })
            .catch(error => {
                console.error("Registration error:", error);
                setAlert({ open: true, message: "Registration failed. Please try again later.", severity: "error" });
            });
    };

    const logoutHandler = () => {
        setAlert({ open: true, message: "Logged out successfully.", severity: "success" });
    
        setTimeout(() => {
            clearAuthToken();
            localStorage.removeItem("loggedIn");
            setLoggedIn(false);
            setSessionExpired(false);
            navigate('/');
        }, 4000); 
    };

    const handleSessionExpired = () => {
        setLoggedIn(false);
        setSessionExpired(true);
        clearAuthToken();
        localStorage.removeItem("loggedIn");
        setAlert({ open: true, message: "Session expired. Please log in again.", severity: "warning" });
        setTimeout(() => {
            navigate('/');
        }, 4000);     
    };

    const toggleLoginPasswordVisibility = () => {
                setShowLoginPassword(!showLoginPassword);
            };

    const toggleRegisterPasswordVisibility = () => {
        setShowRegisterPassword(!showRegisterPassword);
    };

    const [alert, setAlert] = useState({ open: false, message: "", severity: "" });

    const handleClose = () => {
        setAlert({ open: false, message: "", severity: "" });
    };

    return (
        <div>
            <header className="app-header">
                <Link to="/">
                    <div className='logo'>
                        <img src={logo} className="app-logo" alt="Movies App Logo" /> <span>ShowTime</span>
                    </div>
                </Link>

                <div>
                    {!loggedIn &&
                        <div className="login-button">
                            <Button variant="contained" color="default" onClick={openModalHandler}>
                                Login
                            </Button>
                        </div>
                    }
                    {loggedIn &&
                        <div className="login-button">
                            <Button variant="contained" color="default" onClick={logoutHandler}>
                                Logout
                            </Button>
                        </div>
                    }
                    {props.showBookShowButton === "true" && !loggedIn
                        ? <div className="bookshow-button">
                            <Button variant="contained" color="primary" className='bookshow' onClick={openModalHandler}>
                                Book Show
                            </Button>
                        </div>
                        : ""
                    }

                    {props.showBookShowButton === "true" && loggedIn
                        ? <div className="bookshow-button">
                            <Link to={"/bookshow/" + props.id}>
                                <Button variant="contained" color="primary" className='bookshow'>
                                    Book Show
                                </Button>
                            </Link>
                        </div>
                        : ""
                    }
                </div>
            </header>
            <Modal
                ariaHideApp={false}
                isOpen={modalIsOpen}
                contentLabel="Login"
                onRequestClose={closeModalHandler}
                style={customStyles}
            >
                <Tabs className="tabs" value={value} onChange={tabChangeHandler}>
                    <Tab label="Login" />
                    <Tab label="Register" />
                </Tabs>

                {value === 0 &&
                    <div className='form-input'>
                        {/* Login Form Content */}
                        <FormControl required >
                            <InputLabel htmlFor="username">Username</InputLabel>
                            <Input id="username" type="text" username={formState.username} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.usernameRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <FormControl required>
                            <InputLabel htmlFor="loginPassword">Password</InputLabel>
                            <Input
                                id="loginPassword"
                                type={showLoginPassword ? "text" : "password"}
                                loginpassword={formState.loginPassword}
                                onChange={inputChangeHandler}
                                endAdornment={
                                    <IconButton onClick={toggleLoginPasswordVisibility} style={{ width: '35px', padding: '5px' }}>
                                        {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                    </IconButton>
                                }
                            />
                            <FormHelperText className={formState.loginPasswordRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>

                        <Button variant="contained" color="primary" onClick={loginClickHandler} style={{ marginTop: '30px' }}>LOGIN</Button>
                    </div>
                }

                {value === 1 &&
                    <div className='form-input-register'>
                        {/* Register Form Content */}
                        <FormControl required>
                            <InputLabel htmlFor="firstname">First Name</InputLabel>
                            <Input id="firstname" type="text" firstname={formState.firstname} onChange={inputChangeHandler} />

                        </FormControl>

                        <FormControl required>
                            <InputLabel htmlFor="lastname">Last Name</InputLabel>
                            <Input id="lastname" type="text" lastname={formState.lastname} onChange={inputChangeHandler} />

                        </FormControl>

                        <FormControl required>
                            <InputLabel htmlFor="email">Email</InputLabel>
                            <Input id="email" type="text" email={formState.email} onChange={inputChangeHandler} />

                        </FormControl>

                        <FormControl required>
                            <InputLabel htmlFor="registerPassword">Password</InputLabel>
                            <Input
                                id="registerPassword"
                                type={showRegisterPassword ? "text" : "password"} 
                                registerPassword={formState.registerPassword}
                                onChange={inputChangeHandler}
                                endAdornment={
                                    <IconButton onClick={toggleRegisterPasswordVisibility} style={{ width: '35px', padding: '5px' }}>
                                        {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                    </IconButton>
                                }
                            />

                        </FormControl>
                        <FormControl required>
                            <InputLabel htmlFor="contact">Contact</InputLabel>
                            <Input id="contact" type="text" contact={formState.contact} onChange={inputChangeHandler} />

                        </FormControl>

                        <Button variant="contained" color="primary" onClick={registerClickHandler} style={{ marginTop: '30px' }}>REGISTER</Button>
                    </div>
                }
            </Modal>
<Snackbar
                open={sessionExpired || alert.open}
                autoHideDuration={ 6000 }
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                <MuiAlert onClose={handleClose} severity={sessionExpired ? "warning" : alert.severity} sx={{ width: '100%' }}>
                    {sessionExpired ? "Session Expired! Please Login Again" : alert.message}
                </MuiAlert>
            </Snackbar>
        </div>
    );
};

export default Header;

import axios from 'axios';
import React, { useState } from 'react';
import './Header.css';
import Button from '@material-ui/core/Button';
import logo from '../../assets/logo.svg';
import Modal from 'react-modal';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import PropTypes from 'prop-types';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Link } from 'react-router-dom';


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
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

const Header = (props) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [value, setValue] = useState(0);
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
        registrationSuccess: false,
        loggedIn: sessionStorage.getItem("access-token") === null ? false : true
    });

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
    
        // Check if username or loginPassword is empty
        if (username === "") {
            setFormState({ ...formState, usernameRequired: "dispBlock" });
        } else {
            setFormState({ ...formState, usernameRequired: "dispNone" });
        }
    
        if (loginPassword === "") {
            setFormState({ ...formState, loginPasswordRequired: "dispBlock" });
        } else {
            setFormState({ ...formState, loginPasswordRequired: "dispNone" });
        }
    
        // Make POST request to login endpoint
        axios.post(`${props.baseUrl}auth/login`, {}, {
            headers: {
                "Authorization": `Basic ${window.btoa(username + ":" + loginPassword)}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            }
        })
        .then(response => {
            // Handle successful login
            const { id, "access-token": accessToken } = response.data;
            sessionStorage.setItem("uuid", id);
            sessionStorage.setItem("access-token", accessToken);
            setFormState({ ...formState, loggedIn: true });
            closeModalHandler();
        })
        .catch(error => {
            // Handle login error
            console.error("Login error:", error);
        });
    };
    

    const inputChangeHandler = (event) => {
        const { id, value } = event.target;
        setFormState({ ...formState, [id]: value });
    };

    const registerClickHandler = () => {
        const {
            firstname,
            lastname,
            email,
            registerPassword,
            contact
        } = formState;

        const {
            baseUrl
        } = props;

        // Validate form fields
        if (!firstname || !lastname || !email || !registerPassword || !contact) {
            setFormState({
                firstnameRequired: firstname ? "dispNone" : "dispBlock",
                lastnameRequired: lastname ? "dispNone" : "dispBlock",
                emailRequired: email ? "dispNone" : "dispBlock",
                registerPasswordRequired: registerPassword ? "dispNone" : "dispBlock",
                contactRequired: contact ? "dispNone" : "dispBlock",
            });
            return;
        }

        // Make API call to register user
        axios.post(`${baseUrl}auth/signup`, {
                email_address: email,
                first_name: firstname,
                last_name: lastname,
                mobile_number: contact,
                password: registerPassword
            })
            .then(response => {
                // Handle registration success
                setFormState({
                    ...formState,
                    registrationSuccess: true
                });
            })
            .catch(error => {
                // Handle registration error
                console.error('Registration failed:', error);
            });
    }

    const logoutHandler = () => {
        const {
            baseUrl
        } = props;

        const uuid = sessionStorage.getItem("uuid");

        // Make API call to logout user
        axios.post(`${baseUrl}auth/logout`, {
                uuid: uuid
            })
            .then(response => {
                if (response.data.message === "Logged Out successfully.") {
                    // Remove session storage items
                    sessionStorage.removeItem("uuid");
                    sessionStorage.removeItem("access-token");

                    // Update component state
                    setFormState({
                        loggedIn: false
                    });
                }
            })
            .catch(error => {
                // Handle logout error
                console.error('Logout failed:', error);
            });
    }

    return (
        <div>
            <header className="app-header">
                <img src={logo} className="app-logo" alt="Movies App Logo" />
                {!formState.loggedIn ?
                    <div className="login-button">
                        <Button variant="contained" color="default" onClick={openModalHandler}>
                            Login
                        </Button>
                    </div>
                    :
                    <div className="login-button">
                        <Button variant="contained" color="default" onClick={logoutHandler}>
                            Logout
                        </Button>
                    </div>
                }
                {props.showBookShowButton === "true" && !formState.loggedIn
                    ? <div className="bookshow-button">
                        <Button variant="contained" color="primary" onClick={openModalHandler}>
                            Book Show
                        </Button>
                    </div>
                    : ""
                }

                {props.showBookShowButton === "true" && formState.loggedIn
                    ? <div className="bookshow-button">
                        <Link to={"/bookshow/" + props.id}>
                            <Button variant="contained" color="primary">
                                Book Show
                            </Button>
                        </Link>
                    </div>
                    : ""
                }
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
                    <TabContainer>
                        {/* Login Form Content */}
                        <FormControl required>
                            <InputLabel htmlFor="username">Username</InputLabel>
                            <Input id="username" type="text" username={formState.username} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.usernameRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br /><br />
                        <FormControl required>
                            <InputLabel htmlFor="loginPassword">Password</InputLabel>
                            <Input id="loginPassword" type="text" loginpassword={formState.loginPassword} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.loginPasswordRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                    <br /><br />
                    {formState.loggedIn === true &&
                                <FormControl>
                                    <span className="successText">
                                        Login Successful!
                                    </span>
                                </FormControl>
                            }
                             <br /><br />
                        <Button variant="contained" color="primary" onClick={loginClickHandler}>LOGIN</Button>
                    </TabContainer>
                }

                {value === 1 &&
                    <TabContainer>
                        {/* Register Form Content */}
                        <FormControl required>
                            <InputLabel htmlFor="firstname">First Name</InputLabel>
                            <Input id="firstname" type="text" firstname={formState.firstname} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.firstnameRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br/><br/>

                        <FormControl required>
                            <InputLabel htmlFor="lastname">Last Name</InputLabel>
                            <Input id="lastname" type="text" lastname={formState.lastname} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.lastnameRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br/><br/>

                        <FormControl required>
                            <InputLabel htmlFor="email">Email</InputLabel>
                            <Input id="email" type="text" email={formState.email} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.emailRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br/><br/>

                        <FormControl required>
                            <InputLabel htmlFor="registerPassword">Password</InputLabel>
                            <Input id="registerPassword" type="password" registerPassword={formState.registerPassword} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.registerPasswordRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br/><br/>
                        <FormControl required>
                            <InputLabel htmlFor="contact">Contact</InputLabel>
                            <Input id="contact" type="text" contact={formState.contact} onChange={inputChangeHandler} />
                            <FormHelperText className={formState.contactRequired}>
                                <span className="red">required</span>
                            </FormHelperText>
                        </FormControl>
                        <br/><br/>

                        {formState.registrationSuccess &&
                        <FormControl>
                        <span className="successText">
                        Registration Successful. Please Login! 
                        </span>
                        </FormControl>
                        }
                        <br/><br/>

<Button variant="contained" color="primary" onClick={registerClickHandler}>REGISTER</Button>
                    </TabContainer>
                }
                
            </Modal>
        </div>
    );
};

export default Header;



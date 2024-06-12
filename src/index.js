
import React from 'react';
import { render } from 'react-dom'; 
import Controller from './screens/Controller';


const root = document.getElementById('root'); 
render(
  <React.StrictMode>
    <Controller />
  </React.StrictMode>,
  root
);
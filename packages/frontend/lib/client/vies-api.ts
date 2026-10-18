//import VIESAPI from 'viesapi-client';

// Create the service client object
// id - a string representing the API key identifier
// key - a string representing the API key
//export const viesapi = new VIESAPI.VIESAPIClient(process.env.VIES_ID, process.env.VIES_KEY);

import axios from 'axios';

const options = {method: 'GET', url: 'https://api.vatcomply.com/'};

export const viesapi = axios.create({
  baseURL: options.url,
  method: options.method
});
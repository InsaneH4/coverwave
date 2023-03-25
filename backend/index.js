import { createRequire } from "module";
const require = createRequire(import.meta.url);
//const SpotifyWebApi = require('spotify-web-api-node');
import SpotifyWebApi from 'spotify-web-api-node';
const express = require('express');
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {

    apiKey: "AIzaSyAXCOlpGlTlJh8gA-TSXMwPLnVH97XmMXY",

    authDomain: "coverwave-c6eef.firebaseapp.com",

    projectId: "coverwave-c6eef",

    storageBucket: "coverwave-c6eef.appspot.com",

    messagingSenderId: "771616364404",

    appId: "1:771616364404:web:755dc8ab06e20df7b23e21",

    measurementId: "G-23SVN8B5GL",

    databaseUrl: "https://coverwave-c6eef-default-rtdb.firebaseio.com/"

};

const fbApp = initializeApp(firebaseConfig);

const database = getDatabase(fbApp);

const scopes = [
    'ugc-image-upload',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
];

var spotifyApi = new SpotifyWebApi({
    clientId: 'ee221dffbe9c403e94f8fac15b651f41',
    clientSecret: 'ace4279e5ad84eee95127a39b7b7c8d5',
    redirectUri: 'http://localhost:8888/callback',
})

const expApp = express();

expApp.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

async function writeAccessToken(token) {
    const db = getDatabase();
    //const username = await spotifyApi.getMe().then(data => data.body.id);
    const username = "test";
    set(ref(db, 'users/' + username), {
        access_token: token
    });
}

expApp.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];
            writeAccessToken(access_token);
            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);

            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);

            console.log(
                `Sucessfully retreived access token. Expires in ${expires_in} s.`
            );
            res.send('Success! You can now close the window.');

            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

expApp.listen(8888, () =>
    console.log('HTTP Server up. [http://localhost:8888/login]')
);

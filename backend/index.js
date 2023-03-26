const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
import("node-fetch").then((fetch) => {
    global.fetch = fetch.default;
});

let access_token = "0";

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
    redirectUri: 'http://localhost:8000/callback',
})

const app = express();

app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

async function writeAccessToken(token) {
    const db = getDatabase();
    //const username = await spotifyApi.getMe().then(data => data.body.id);
    const username = getMe();
    set(ref(db, 'users/' + username), {
        access_token: token
    });
}

async function getMe() {
    return (await spotifyApi.getMe()).body.id;
}

//GET MY PLAYLISTS
async function getMyPlaylists() {
    let userName = await getMe();
    const data = await spotifyApi.getUserPlaylists(userName);

    //console.log("---------------+++++++++++++++++++++++++");
    let playlists = [];
    for (let p of data.body.items) {
        //let tracks = await getPlaylistTracks(playlist.id, playlist.name);
        // console.log(tracks);
        playlists.push(p);
    }
    //console.log(playlists);
    //console.log("PLAYLISTStypeof playlists");        
    return playlists;
}

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId) {

    const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 100,
        fields: 'items'
    });

    // console.log('The playlist contains these tracks', data.body);
    // console.log('The playlist contains these tracks: ', data.body.items[0].track);
    // console.log("'" + playlistName + "'" + ' contains these tracks:');
    let tracks = [];

    for (let track_obj of data.body.items) {
        const track = track_obj.track
        tracks.push(track);
        //console.log(track.name + " : " + track.artists[0].name);
    }
    //console.log("---------------+++++++++++++++++++++++++")
    return tracks;
}

async function analyzePlaylist(playlist) {
    let analysis = [0, 0, 0, 0, 0, 0];
    var prompt = "";
    for (let track of playlist) {
        const response = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${access_token}` }
        });
        var res = JSON.parse(await response.text());
        //console.log(res);
        if (!res.error) {
            //concat to prompt in if statements
            analysis[0] += res.danceability;
            analysis[1] += res.energy;
            analysis[2] += res.loudness;
            analysis[3] += res.mode;
            analysis[4] += res.tempo;
            analysis[5] += res.valence;
        }
    }
    // calculates average for each value
    analysis.forEach((element, index) => {
        analysis[index] = element / playlist.length;
    });
    // console.log(analysis); //works!!!!!
    return prompt;
}

app.get('/callback', (req, res) => {
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
            console.log("HEEYY:", data.body);
            access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];
            //writeAccessToken(access_token);
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
                access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
            let myPlaylists = getMyPlaylists();
            //INSANEEEEEE
            myPlaylists.then(console.log);
            let selectedPlist = myPlaylists.then((playlists) => {
                return getPlaylistTracks(playlists[0].id);
            });
            selectedPlist.then(console.log);
            let prompt = selectedPlist.then(analyzePlaylist);
            prompt.then(console.log);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

app.listen(8000, () =>
    console.log('HTTP Server up. [http://localhost:8000/login]')
);

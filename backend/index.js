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

    console.log("---------------+++++++++++++++++++++++++")
    let playlists = [];
    for (let p of data.body.items) {
        console.log("Name: " + p.name + ", ID: " + p.id);

        //let tracks = await getPlaylistTracks(playlist.id, playlist.name);
        // console.log(tracks);    
        playlists.push(p);
    }
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
    let analysis = [];
    const features = {
        acousticness: 0,
        danceability: 1,
        energy: 2,
        instrumentalness: 3,
        key: 4,
        liveness: 5,
        loudness: 6,
        speechiness: 7,
        tempo: 8
    }
    for (let track of playlist) {
        const response = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${access_token}` }
        });
        console.log(response);
        var res = JSON.parse(await response.text());
        if (!res.error) {
            // audio features
            //+= each index in analysis based on score in category
            /* 
                0: acousticness
                1: danceability
                2: energy
                3: instrumentalness
                4: key (0 - 9)
                5: liveness
                6: loudness
                7: speechiness
                8: tempo   
            */
            // analysis[]
        }
    }
    // calculates average for each value
    analysis.forEach((element, index) => {
        analysis[index] = element / playlist.length;
    });
    return analysis;
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
            console.log(JSON.stringify(myPlaylists));
            let currPlaylist = getPlaylistTracks(myPlaylists[0].id);
            //[0] is temp            
            analyzePlaylist(currPlaylist);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

app.listen(8000, () =>
    console.log('HTTP Server up. [http://localhost:8000/login]')
);

import { writeFileSync } from 'fs';
import SpotifyWebApi from 'spotify-web-api-node';
const token = 'BQBuifiyQvw80wCw8wJwfqf9WB1CEvzS3r0APw1GQYh1h0H4aexuW1ErjyE0X8_hvvvdr8p0xSxQ5q1AVCmrHbUwJQMDtBAxZOlktzORUzQETe8srJoaozkK-TYOsne8CxP1YxuGv_50Zm6BqQtmJuhpxSCJhUtykwXunHBlFd6ajWDAOvfKEqv3VMiBIredaA3OgMyROMmvTz5bVqmTWnN50wg2YxY_st7GrL3IkpPGQvdbsZu6UUO8y3j2OIFu1AN7IZoC_ZXN9OE7jVUt';

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

function getMyData() {
    (async () => {
        const me = await spotifyApi.getMe();
        getUserPlaylists(me.body.id);
    })().catch(e => {
        console.error(e);
    })
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
    const data = await spotifyApi.getUserPlaylists(userName);

    console.log("---------------+++++++++++++++++++++++++")
    let playlists = [];

    for (let playlist of data.body.items) {
        console.log(playlist.name + " " + playlist.id);

        let tracks = await getPlaylistTracks(playlist.id, playlist.name);
        // console.log(tracks);

        const tracksJSON = { tracks };
        let data = JSON.stringify(tracksJSON);
        writeFileSync(playlist.name + '.json', data); // creates new file
    }
}

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId, playlistName) {

    const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 100,
        fields: 'items'
    })

    // console.log('The playlist contains these tracks', data.body);
    // console.log('The playlist contains these tracks: ', data.body.items[0].track);
    // console.log("'" + playlistName + "'" + ' contains these tracks:');
    let tracks = [];
    let analysis = [];

    for (let track_obj of data.body.items) {
        const track = track_obj.track
        tracks.push(track);
        console.log(track.name + " : " + track.artists[0].name);
        analysis = getTrackFeatures(track.id);
    }

    console.log("---------------+++++++++++++++++++++++++")
    return tracks;
}

async function getTrackFeatures(track_id) {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${track_id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`} // CHANGE THIS WHEN TOKEN CAN GET ACCESSED
    })
    var res = JSON.parse(await response.text());
    if (!res.error) {
        // get audio features (complex)
        
    }
}

getMyData();

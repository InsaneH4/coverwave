import("node-fetch").then((fetch) => {
  global.fetch = fetch.default;
});
import replicate from "node-replicate";
import SpotifyWebApi from "spotify-web-api-node";
import express from "express";

let access_token = "0";

const scopes = [
  "ugc-image-upload",
  "playlist-read-private",
  "playlist-read-collaborative",
];

let spotifyApi = new SpotifyWebApi({
    clientId: 'ee221dffbe9c403e94f8fac15b651f41',
    clientSecret: 'ace4279e5ad84eee95127a39b7b7c8d5',
    redirectUri: 'http://localhost:3000/select',
});

const app = express();

app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

async function getMe() {
  return (await spotifyApi.getMe()).body.id;
}

//GET MY PLAYLISTS
async function getMyPlaylists() {
  let userName = await getMe();
  const data = await spotifyApi.getUserPlaylists(userName);
  let playlists = [];
  for (let p of data.body.items) {
    playlists.push(p);
  }
  return playlists;
}

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: "items",
  });

  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track;
    tracks.push(track);
  }
  return tracks;
}

function analyzePlaylist(playlist) {
  let analysis = [0, 0, 0, 0, 0, 0];
  let prompt = "vibrant album cover ";
  for (let track of playlist) {
    //old version
    //=====================================================================
    // const response = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
    //     method: 'GET',
    //     headers: { Authorization: `Bearer ${access_token}` }
    // });
    // let res = JSON.parse(await response.text());
    // if (!res.error) {
    //     analysis[0] += res.danceability;
    //     analysis[1] += res.energy;
    //     analysis[2] += res.loudness;
    //     analysis[3] += res.mode;
    //     analysis[4] += res.tempo;
    //     analysis[5] += res.valence;
    // }

    // =====================================================================

    fetch(`https://api.spotify.com/v1/audio-features/${track.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.error) {
          //concat to prompt in if statements
          analysis[0] += res.danceability;
          analysis[1] += res.energy;
          analysis[2] += res.loudness;
          analysis[3] += res.mode;
          analysis[4] += res.tempo;
          analysis[5] += res.valence;
        }
        // console.log(res);
      });
  }
  // calculates average for each value
  analysis.forEach((element, index) => {
    analysis[index] = element / playlist.length;
  });
  if (analysis[0] >= 0.7) {
    // danceability
    prompt += " dancing ";
  } else if (analysis[0] >= 0.3 && analysis[0] < 0.7) {
    prompt += " mellow ";
  } else if (analysis[0] < 0.3) {
    prompt += " idle ";
  }
  if (analysis[1] > 0.5) {
    // energy
    prompt += " energetic ";
  } else if (analysis[1] >= 0.2 && analysis[1] < 0.5) {
    prompt += " calm ";
  } else if (analysis[1] < 0.2) {
    prompt += " leisurely ";
  }
  if (analysis[2] >= -15) {
    // loudness
    prompt += " aggressive ";
  } else if (analysis[2] >= -45 && analysis[2] < -15) {
    prompt += " proper ";
  } else if (analysis[2] < -45) {
    prompt += " soft ";
  }
  if (analysis[3] >= 0.5) {
    // mode (major or minor)
    prompt += " hopeful ";
  } else if (analysis[3] >= 0.2 && analysis[3] < 0.5) {
    prompt += " muted ";
  } else if (analysis[3] < 0.2) {
    prompt += " melancholic ";
  }
  if (analysis[4] >= 120) {
    // tempo
    prompt += " fast ";
  } else if (analysis[4] >= 60 && analysis[4] < 120) {
    prompt += " steady ";
  } else if (analysis[4] < 60) {
    prompt += " slow ";
  }
  if (analysis[5] >= 0.4) {
    // valence
    prompt += " joyful ";
  } else if (analysis[5] >= 0.1 && analysis[5] < 0.4) {
    prompt += " neutral ";
  } else if (analysis[5] < 0.1) {
    prompt += " sad ";
  }
  return prompt;
}

async function generateCover(prompt) {
  console.log("prompt: ", prompt);
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
    )
    .predict({
      prompt: prompt,
    });
  return prediction.output;
}

app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      console.log("HEEYY:", data.body);
      access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];
      //writeAccessToken(access_token);
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log("access_token:", access_token);
      console.log("refresh_token:", refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send("Success! You can now close the window.");

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        access_token = data.body["access_token"];

        console.log("The access token has been refreshed!");
        console.log("access_token:", access_token);
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
      let myPlaylists = getMyPlaylists();
      //INSANEEEEEE
      myPlaylists.then(console.log);
      let selectedPlist = myPlaylists.then((playlists) => {
        return getPlaylistTracks(playlists[11].id);
      });
      selectedPlist.then(console.log);
      let prompt = selectedPlist.then(analyzePlaylist);
      // prompt.then(console.log);
      let image = prompt.then(generateCover);
      image.then(console.log);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.get('/playlists', (req, res) => {
    return getMyPlaylists();
})

app.listen(8000, () =>
  console.log("HTTP Server up. [http://localhost:8000/login]")
);

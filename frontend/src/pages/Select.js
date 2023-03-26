import { useState, useEffect } from "react";
import { getDatabase, ref, get, child, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAnpMfGMByUyomWdtFPhKxfvw3imHe5bGo",

  authDomain: "coverwave-b3885.firebaseapp.com",

  databaseURL: "https://coverwave-b3885-default-rtdb.firebaseio.com",

  projectId: "coverwave-b3885",

  storageBucket: "coverwave-b3885.appspot.com",

  messagingSenderId: "585473472871",

  appId: "1:585473472871:web:050062774fe2ccc0ef97c2",

  measurementId: "G-65VSQS13KP",
};

initializeApp(firebaseConfig);

const db = getDatabase();
const coversRef = ref(db);
let imageUrl = "";
get(child(coversRef, "covers")).then((snapshot) => {
  if (snapshot.exists()) {
    imageUrl = snapshot.val();
  }
});
onValue(coversRef, (snapshot) => {
  imageUrl = snapshot.val();
});

export default function Select() {
  // const [list ,setList] = useState([]);
  const [playlist, setPlayList] = useState([{ name: "" }]);
  useEffect(() => {
    const getPlaylists = async () => {
      const response = await fetch(`http://localhost:8000/playlists`);
      const newData = await response.json();
      setPlayList(newData);
      console.log(newData);
      // fetch('http://localhost:8000/playlists',
      // {
      //     method: 'GET',
      //     headers: 'Content-Type': 'application/json'
      // })
      // .then(res => res.json())
      // .then(res => {
      //     if (!res.error) {
      //         console.log("hooray!!");
      //     }
      // } )
    };
    //getPlaylists();
  }, []);

  return (
    <form class="search-form">
      <div class="dropdown">
        {/* <label>Playlists: </label> */}
        <select class="dropdownBtn">
          <option class="dropdownContent">Select Your Playlist...</option>
          <option getPlaylists></option>

          {playlist.map((Plist) => (
            <option value={playlist.name}>{playlist.name}</option>
          ))}
        </select>
        <br /><br/>
        <img src={imageUrl} alt="playlist cover" width="250" height="250" />
      </div>
      <input type="button" onclick="window.location.href='';" value="Generate" />
    </form>
  );
}

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
const coverRef = ref(db, "cover/");
const playlistRef = ref(db, "playlist/");
let imageUrl = "";
let pName = "title not found";
get(child(coverRef)).then((snapshot) => {
  if (snapshot.exists()) {
    imageUrl = snapshot.val();
  }
});
get(child(playlistRef)).then((snapshot) => {
  if (snapshot.exists()) {
    pName = snapshot.val();
  }
});
onValue(coverRef, (snapshot) => {
  imageUrl = snapshot.val();
});
onValue(playlistRef, (snapshot) => {
  pName = snapshot.val();
});

export default function Select() {
  // const [list ,setList] = useState([]);
  return (
    <div>
      <h2>Cover art generated for your playlist</h2>
      <img src={imageUrl} alt="playlist cover" width="250" height="250" />
      <h1>{pName}</h1>
    </div>
  );
}

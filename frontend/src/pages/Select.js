import { useState, useEffect } from "react";

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
    getPlaylists();
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
        <h1>{}</h1>
      </div>
      <input type="button" onclick="window.location.href='';" value="Submit" />
    </form>
  );
}

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

  const getPrompt = async () => {
    const response = await fetch(`http://localhost:8000/prompt`);
    console.log(response);
    return response;
  };

  const getTest = async () => {
    const response = await fetch(`http://localhost:8000/test`);
    console.log(response);
    return response;
    };

  const imgPrompt = getPrompt();
  //console.log(prompt);

  const test = getTest().then((res) => res.json());

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
        <h1>{test.toString}</h1>
      </div>
      <input type="button" onclick="window.location.href='';" value="Submit" />
    </form>
  );
}

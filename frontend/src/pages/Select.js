import { useState, useEffect } from "react";

export default function Select() {
    // const [list ,setList] = useState([]);
    // useEffect(() => {})

    return (
        <form class="search-form">
            <div class="dropdown">
                {/* <label>Playlists: </label> */}
                <select class="dropdownBtn">
                    <option class="dropdownContent">Select Your Playlist...</option>
                </select>
            </div>
            <input type="button" onclick="window.location.href='';" value="Submit" />
        </form>
    )
}

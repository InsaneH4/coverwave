import Home from "./Home";


const LOGIN_LINK = "http://localhost:8000/login";
export default function Select() {
    window.open(LOGIN_LINK);
    return (
        <Home/>
    )
}

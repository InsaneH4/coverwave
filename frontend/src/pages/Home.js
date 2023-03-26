import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap"
import { ArrowRightCircle } from "react-bootstrap-icons"
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { children } from "react"
import headerImg from "../assets/2.svg";

//const LOGIN_LINK = "http://localhost:8000/login";
// const loginSpotify = () => {
//     fetch('http://localhost:8000/login', { 
//         method: 'GET',
//         headers: {'Content-Type': 'application/json'}
//     })
// }

export default function Home(event) {
    const [loopNum, setLoopNum] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const toRotate = ["coverwave"];
    const [text, setText] = useState('');
    const [delta, setDelta] = useState(300 - Math.random() * 100);
    const period = 2000;

    useEffect(() => {
        let ticker = setInterval(() => {
            tick();
        }, delta)

        return () => { clearInterval(ticker) };
    }, [text])

    const tick = () => {
        let i = loopNum % toRotate.length;
        let fullText = toRotate[i];
        let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1)

        setText(updatedText);

        if (isDeleting) {
            setDelta(prevDelta => prevDelta / 2)
        }

        if (!isDeleting && updatedText === fullText) {
            setIsDeleting(true);
            setDelta(period);
        } else if (isDeleting && updatedText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
            setDelta(500);
        }
    }

    return (
        
        <section className="banner">
            <Container>
                <Row className="align-item-center">
                    <Col xs={12} md={6} xl={7}>
                        <span className="tagline">Welcome to coverwave</span>
                        <h1>{'Hi, This is '}<span className="wrap">{text}</span></h1>
                        <p>Coverwave takes a look at your Spotify playlists and generates covers from them with AI</p>
                        <Link className="button" to="/login" >Log in with Spotify<ArrowRightCircle size={25} /></Link>

                    </Col>

                    {/* <Col xs={12} md={6} xl={5}>
                        <img src={headerImg} alt="img"></img>
                    </Col> */}
                </Row>
                {/* <div class="footer">
                    <div class="footer-content">
                        <p>ⓒ2023 coverwave by ...</p>
                    </div>
                </div> */}
            </Container>
        </section>
    )
}

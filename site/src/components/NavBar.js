import {useState, useEffect} from "react";
import { Navbar, Container, Nav } from "react-bootstrap";



export const NavBar = () => {
    const [activeLink, setActiveLink] = useState('home');
    const [scrolled, seScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if(window.scrollY > 50) {
                seScrolled(true);
            } else {
                seScrolled(false);
            }
        }

        window.addEventListener("scroll", onScroll);

        return () => window.removeEvenListnener("scroll", onScroll);
    }, [])

    const onUpdateActiveLink = (value) => {
      setActiveLink(value);
    }
    
    return (
        <Navbar bg="light" expand="lg" className={scrolled ? "scrolled": ""}>
      <Container>
        <Navbar.Brand href="#home">coverwave</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
            <span className = "navbar-toggler-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" className={activeLink ==='Home' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('home')}>Home</Nav.Link>
            <Nav.Link href="#link" className={activeLink ==='link' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('link')}>Link</Nav.Link>
          </Nav>
          <span className="navbar-text"> 
            <button className="login" onClick={() => console.log('connect')}><span>Log In</span></button>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    )
}

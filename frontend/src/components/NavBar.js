import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { children } from "react"

export default function NavBar() {
    return <nav className="nav">
        <Link to="/home" className="site-title">coverwave</Link>
        <ul>
            <CustomLink to="/select">Playlists</CustomLink>
        </ul>
    </nav>
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";


export default function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // On mount, check if userInfo exists
        const userInfo = localStorage.getItem("userInfo");
        setIsLoggedIn(!!userInfo);
    }, []);

    // Listen for changes made from other components (like Login)
    useEffect(() => {
        const handleStorageChange = () => {
            const userInfo = localStorage.getItem("userInfo");
            setIsLoggedIn(!!userInfo);
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userInfoChanged", handleStorageChange); // custom event
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userInfoChanged", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setIsLoggedIn(false);

        // Notify others (e.g., if Login/other tabs are open)
        window.dispatchEvent(new Event("userInfoChanged"));

        navigate("/login");
    };

    return (
        <header className="finplay-header">
            <div className="finplay-logo">FinPlay</div>
            <nav className="finplay-nav">
                {/* Always visible */}
                <Link to="/" className="nav-link nav-btn">Dashboard</Link>

                {/* Visible only when logged in */}
                {isLoggedIn && (
                    <>
                        <Link to="/cards-pro" className="nav-link nav-btn">Cards</Link>
                        <Link to="/splits" className="nav-link nav-btn">Splits</Link>
                        <Link to="/jars" className="nav-link nav-btn">Jars</Link>
                        <Link to="/dash" className="nav-link nav-btn">Transactions</Link>
                        <Link to="/upi" className="nav-link nav-btn">UPI Pay</Link>
                        <button onClick={handleLogout} className="nav-link nav-btn">Logout</button>
                    </>
                )}

                {/* Visible only when NOT logged in */}
                {!isLoggedIn && (
                    <Link to="/login" className="nav-link nav-btn">Login</Link>
                )}
            </nav>
        </header>
    );
}

import { useState ,useEffect} from "react";
import axios from "axios";
import "./login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    useEffect(() => {
        console.log('Login: checking window.VANTA/window.THREE');
        try {
            if (window.VANTA && window.VANTA.WAVES) {
                console.log('Login: VANTA found, initializing...');
                const v = window.VANTA.WAVES({
                    el: '#vanta-bg',
                    waveHeight: 20,
                    waveSpeed: 0.6,
                    shininess: 50,
                    waveColor: 0x0055aa,
                    backgroundColor: 0x071229,
                });
                console.log('Login: VANTA initialized');
                return () => { if (v && v.destroy) v.destroy(); };
            } else {
                console.log('Login: VANTA not present yet');
            }
        } catch (e) {
            console.warn('Vanta init failed in Login', e);
        }
    }, []);

    // Fallback loader: if VANTA or THREE aren't present, inject CDN scripts and init
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.VANTA && window.VANTA.WAVES && window.THREE) return; // already available

        const loadScript = (src) => new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
        });

        let vInstance = null;
        const initVanta = () => {
            try {
                if (window.VANTA && window.VANTA.WAVES && window.THREE) {
                    console.log('Login fallback: initializing VANTA after script load');
                    vInstance = window.VANTA.WAVES({ el: '#vanta-bg', waveHeight: 20, waveSpeed: 0.6, shininess: 50, waveColor: 0x0055aa, backgroundColor: 0x071229 });
                    console.log('Login fallback: VANTA initialized');
                } else {
                    console.log('Login fallback: VANTA or THREE still missing after load');
                }
            } catch (e) { console.warn('Vanta init after load failed', e); }
        };

        // Load Three first, then Vanta
        (async () => {
            try {
                console.log('Login fallback: starting script load');
                if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js');
                console.log('Login fallback: THREE loaded');
                if (!window.VANTA) await loadScript('https://cdn.jsdelivr.net/npm/vanta/dist/vanta.waves.min.js');
                console.log('Login fallback: VANTA script loaded');
                initVanta();
            } catch (e) {
                console.warn('Error loading Vanta/Three scripts:', e);
            }
        })();

        return () => { if (vInstance && vInstance.destroy) vInstance.destroy(); };
    }, []);
    const navigate = useNavigate();
    const API=import.meta.env.VITE_API_URL
    const backendURL =`${API}/api/auth`;
    const [activeForm, setActiveForm] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
 // change if your backend URL is different
    useEffect(() => {
        // Check localStorage on component load
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${backendURL}/login`, {
                email: formData.email,
                password: formData.password,
            });
            console.log("Login Success");
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUserInfo(data);
            window.dispatchEvent(new Event("userInfoChanged"));
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${backendURL}/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: "user", // default role
            });
            console.log("Registration Success:", data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            setActiveForm("login"); // switch to login after register
        } catch (err) {
            console.error("Full error:", err); // always print in console

            let message = "Unknown error";

            if (err.response && err.response.data) {
                // Error returned from backend
                message = JSON.stringify(err.response.data, null, 2);
            } else if (err.message) {
                // Network error or other
                message = err.message;
            }

            setError(message);
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <div id="vanta-bg" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}></div>

            {/* Auth Section */}
            <section className="auth">
                <div className="auth-container">
                    {error && <p className="error">{error}</p>}

                    {/* Login Form */}
                    <form
                        className={`form ${activeForm === "login" ? "active" : ""}`}
                        onSubmit={handleLogin}
                    >
                        <h2>Login</h2>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                title={showPassword ? "Hide Password" : "Show Password"}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <p>
                            Don't have an account?{" "}
                            <span onClick={() => setActiveForm("register")}>Register</span>
                        </p>
                    </form>

                    {/* Register Form */}
                    <form
                        className={`form ${activeForm === "register" ? "active" : ""}`}
                        onSubmit={handleRegister}
                    >
                        <h2>Register</h2>
                        <div className="input-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Username"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                title={showPassword ? "Hide Password" : "Show Password"}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>
                        <p>
                            Already have an account?{" "}
                            <span onClick={() => setActiveForm("login")}>Login</span>
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
}



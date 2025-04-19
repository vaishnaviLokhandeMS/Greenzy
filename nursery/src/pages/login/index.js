import { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useRouter } from 'next/router';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://backendnursury.leafylegacy.in/api/nursery/login', formData);
            localStorage.setItem('token', res.data.token);
            router.push('/home');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className={styles.background}>
            <div className={styles.loginBox}>
                <h2 className={styles.heading}>Welcome Back 🌱</h2>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className={styles.input}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className={styles.input}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className={styles.button}>Login</button>
                </form>

                {/* 👇 New section */}
                <p className={styles.switch}>
                    Don't have an account?
                    <span onClick={() => router.push('/signup')} className={styles.link}>
                        {' '}Register
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;

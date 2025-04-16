import { useState } from 'react';
import axios from 'axios';
import styles from './Signup.module.css';
import { useRouter } from 'next/router';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        phonenumber: '',
        nurseryname: '',
        nurseryaddress: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('nurseryaddress')) {
            const addressField = name.split('.')[1];
            setFormData({
                ...formData,
                nurseryaddress: {
                    ...formData.nurseryaddress,
                    [addressField]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/nursery/signup', formData);
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response?.data?.error || error.response?.data?.message || 'Signup failed');

        }
    };

    return (
        <div className={styles.background}>
            <div className={styles.signupBox}>
                <h2 className={styles.heading}>Create Account 🌿</h2>
                {message && <p className={styles.message}>{message}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} className={styles.input} required />
                        <input type="text" name="phonenumber" placeholder="Phone Number" onChange={handleChange} className={styles.input} required />
                    </div>

                    <div className={styles.row}>
                        <input type="text" name="nurseryname" placeholder="Nursery Name" onChange={handleChange} className={styles.input} required />
                        <input type="text" name="nurseryaddress.street" placeholder="Street Address" onChange={handleChange} className={styles.input} required />
                    </div>

                    <div className={styles.row}>
                        <input type="text" name="nurseryaddress.city" placeholder="City" onChange={handleChange} className={styles.input} required />
                        <input type="text" name="nurseryaddress.state" placeholder="State" onChange={handleChange} className={styles.input} required />
                    </div>

                    <div className={styles.row}>
                        <input type="text" name="nurseryaddress.pincode" placeholder="Pincode" onChange={handleChange} className={styles.input} required />
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} className={styles.input} required />
                    </div>

                    <div className={styles.singleRow}>
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} className={styles.input} required />
                    </div>

                    <button type="submit" className={styles.button}>Register</button>
                </form>

                <p className={styles.switch}>
                    Already have an account?
                    <span onClick={() => router.push('/login')} className={styles.link}>
                        {' '}Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;

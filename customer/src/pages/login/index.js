import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import styles from "./Login.module.css";

export default function Login() {
  const router = useRouter();
  const [contactnumber, setContactNumber] = useState("+91");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://backend.leafylegacy.in/api/users/login", {
        contactnumber,
        password,
      });

      if (res.data.success) {
        alert("Login Successful!");

        // ✅ Correctly store user data
        localStorage.setItem("contactnumber", contactnumber);
        localStorage.setItem("useremail", res.data.email || "guest@greenzy.in");
        localStorage.setItem("userid", res.data.userId);  // ✅ Fixed key name
        localStorage.setItem("fullname", res.data.fullname || "");

        router.push("/cart");
      } else {
        setError("Invalid credentials!");
      }
    } catch (err) {
      setError("Invalid credentials!");
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.formWrapper}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>🌿 Welcome to Greenzy</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            className={styles.input}
            value={contactnumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <motion.button
            className={styles.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Login
          </motion.button>
        </form>
        <p className={styles.link} onClick={() => router.push("/signup")}>
          Don't have an account? <span>Signup</span>
        </p>
      </motion.div>
    </div>
  );
}

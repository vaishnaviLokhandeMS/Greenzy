import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import styles from "./Signup.module.css";

export default function Signup() {
  const router = useRouter();
  const [user, setUser] = useState({
    contactnumber: "+91",
    fullname: "",
    dob: "",
    address: "",
    password: "",
  });

  const [error, setError] = useState(""); // ✅ State for error messages

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://backend.leafylegacy.in/api/users/register", user);
      if (res.status === 201) {
        alert("Signup Successful!");
        router.push("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup Failed! Try again."); // ✅ Display exact error
    }
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <motion.div className={styles.formWrapper} whileHover={{ scale: 1.05 }}>
        <h2 className={styles.title}>Create Your Account</h2>

        {error && <p className={styles.error}>{error}</p>} {/* ✅ Display backend errors */}

        <form className={styles.form} onSubmit={handleSubmit}>
          <input type="text" name="contactnumber" placeholder="Mobile Number" className={styles.input} value={user.contactnumber} onChange={handleChange} />
          <input type="text" name="fullname" placeholder="Full Name" className={styles.input} value={user.fullname} onChange={handleChange} />
          <input type="date" name="dob" className={styles.input} value={user.dob} onChange={handleChange} />
          <input type="text" name="address" placeholder="Address" className={styles.input} value={user.address} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className={styles.input} value={user.password} onChange={handleChange} />
          <motion.button className={styles.button} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="submit">
            Signup
          </motion.button>
        </form>
        <p className={styles.link} onClick={() => router.push("/login")}>
          Already have an account? Login
        </p>
      </motion.div>
    </motion.div>
  );
}

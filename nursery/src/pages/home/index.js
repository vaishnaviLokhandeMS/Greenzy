import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    productname: '',
    categoryname: '',
    subcategoryname: '',
    description: '',
    watering: '',
    sunlight: '',
    height: '',
    potmaterial: '',
    fertilizer: '',
    maintenance: '',
    price: '',
    stock: '',
    email: '',
    password: '',
    images: []
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://backendnursury.leafylegacy.in/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const selected = categories.find(cat => cat.categoryname === e.target.value);
    setFormData({ ...formData, categoryname: e.target.value, subcategoryname: '' });
    setSubcategories(selected?.subcategories || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, images: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      if (key === 'images') {
        Array.from(formData.images).forEach(file => data.append('images', file));
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post('http://backend.leafylegacy.in/api/products/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message || 'Product added successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding product');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>🌿 Greenzy</div>
        <nav className={styles.nav}>
          <a href="#">Sales</a>
          <a href="#">Update Product</a>
          <a href="#" className={styles.profileIcon} title="Profile">👤</a>
        </nav>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>Add New Product</h2>
        {message && <p className={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          <input className={styles.input} type="text" name="productname" placeholder="Product Name" onChange={handleChange} required />

          <select className={styles.selectField} name="categoryname" onChange={handleCategoryChange} required>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.categoryname}>{cat.categoryname}</option>
            ))}
          </select>

          <select className={styles.selectField} name="subcategoryname" onChange={handleChange} required>
            <option value="">Select Subcategory</option>
            {subcategories.map((sub, idx) => (
              <option key={idx} value={sub.subcategoryname}>{sub.subcategoryname}</option>
            ))}
          </select>

          <input className={styles.input} type="number" name="price" placeholder="Standard Price" onChange={handleChange} required />
          <input className={styles.input} type="number" name="stock" placeholder="Available Quantity" onChange={handleChange} required />
          <input className={styles.input} type="text" name="description" placeholder="Description" onChange={handleChange} />
          <input className={styles.input} type="text" name="watering" placeholder="Watering" onChange={handleChange} />
          <input className={styles.input} type="text" name="sunlight" placeholder="Sunlight" onChange={handleChange} />
          <input className={styles.input} type="text" name="height" placeholder="Height" onChange={handleChange} />
          <input className={styles.input} type="text" name="potmaterial" placeholder="Pot Material" onChange={handleChange} />
          <input className={styles.input} type="text" name="fertilizer" placeholder="Fertilizer" onChange={handleChange} />
          <input className={styles.input} type="text" name="maintenance" placeholder="Maintenance" onChange={handleChange} />
          <input className={styles.input} type="email" name="email" placeholder="Your Registered Email" onChange={handleChange} required />
          <input className={styles.input} type="password" name="password" placeholder="Your Password" onChange={handleChange} required />

          <input className={styles.fileInput} type="file" name="images" multiple onChange={handleFileChange} />
          <button className={styles.button} type="submit">Add Product</button>
        </form>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Greenzy 🌱 | Helping Nurseries Grow</p>
      </footer>
    </div>
  );
};

export default Home;

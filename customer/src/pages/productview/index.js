import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./ProductView.module.css";
import {
  FaUser,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";
import { BiRupee } from "react-icons/bi";

export default function ProductView() {
  const router = useRouter();
  const { category, subcategory } = router.query;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (category && subcategory) {
        fetch(`http://localhost:5000/api/products/by-category?category=${category}&subcategory=${subcategory}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
        })
        .catch((err) => console.error("❌ Error fetching products:", err));
    }
  }, [category, subcategory]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>🌿 Greenzy</div>
        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for plants, seeds and planters ..." />
            <FaSearch className={styles.searchIcon} />
          </div>
          <BiRupee className={styles.icon} />
          <FaUser className={styles.icon} />
          <div className={styles.cartIcon}>
            <FaShoppingCart className={styles.icon} />
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <div className={styles.grid}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className={styles.card}>
              {product.filenames?.length > 0 && (
                <img
                  src={`http://localhost:5000/uploads/${product.filenames[0]}`}
                  alt={product.productname}
                  className={styles.productImage}
                />
              )}
              <h3 className={styles.productName}>{product.productname}</h3>
              <p className={styles.price}>₹ {product.sellers[0]?.price}</p>
              <button className={styles.viewButton} onClick={() => router.push(`/productdescription?productid=${product._id}`)}>
                View Product
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No products found</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./ProductDescription.module.css";
import {
  FaUser,
  FaShoppingCart,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaSearch,
} from "react-icons/fa";
import { BiRupee } from "react-icons/bi";

export default function ProductDescription() {
  const router = useRouter();
  const { productid } = router.query;
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Fetch product & categories
  useEffect(() => {
    if (productid) {
      fetch(`http://localhost:5000/api/products/by-id/${productid}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error("❌ Product Error:", err));
    }

    fetch("http://localhost:8000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("❌ Category Error:", err));
  }, [productid]);

  // Image carousel logic
  useEffect(() => {
    if (product?.filenames?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % product.filenames.length
        );
      }, 3000); // 3 sec interval

      return () => clearInterval(interval); // cleanup
    }
  }, [product]);

  const handleAddToCart = () => {
    const contactnumber = localStorage.getItem("contactnumber"); // Update with the logged-in user's contact number
    fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactnumber, productid, quantity: 1 }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsAddedToCart(true); // Update state to "View Cart" after adding to cart
      })
      .catch((err) => console.error("❌ Add to Cart Error:", err));
  };

  const handleViewCart = () => {
    router.push("/cart");
  };

  if (!product) return <p className={styles.loading}>Loading product...</p>;

  return (
    <div className={styles.container}>
      {/* ✅ Header */}
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>🌿 Greenzy</div>
          <div className={styles.nav}>
            {categories.map((cat, idx) => (
              <div key={idx} className={styles.dropdown}>
                <span className={styles.categoryName}>{cat.categoryname}</span>
                <div className={styles.dropdownContent}>
                  {cat.subcategories.map((sub, i) => (
                    <p key={i} className={styles.subitem}>{sub.subcategoryname}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for plants, seeds and planters ..." />
            <FaSearch className={styles.searchIcon} />
          </div>
          <BiRupee className={styles.icon} />
          <FaUser className={styles.icon} />
          <div className={styles.cartIcon} onClick={() => router.push("/cart")}>
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      {/* 🪴 Product Section */}
      <div className={styles.productSection}>
        <div className={styles.imageBox}>
          {product.filenames?.length > 0 && (
            <img
              src={`http://localhost:5000/uploads/${product.filenames[currentImageIndex]}`}
              alt={`Product ${currentImageIndex + 1}`}
              className={styles.productImage}
            />
          )}
        </div>

        <div className={styles.detailsBox}>
          <h1 className={styles.title}>{product.productname}</h1>

          <div className={styles.detailRow}>
            <span className={styles.label}>Category:</span>
            <span className={styles.value}>{product.categoryid}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Subcategory:</span>
            <span className={styles.value}>{product.subcategoryid}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Price:</span>
            <span className={styles.value}>₹ {product.sellers[0]?.price}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Available Quantity:</span>
            <span className={styles.value}>{product.sellers[0]?.stock}</span>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Description:</span>
            <span className={styles.value}>{product.description}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Watering:</span>
            <span className={styles.value}>{product.specifications?.watering}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Sunlight:</span>
            <span className={styles.value}>{product.specifications?.sunlight}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Height:</span>
            <span className={styles.value}>{product.specifications?.height}</span>
          </div>

          {/* Toggle Add to Cart / View Cart button */}
          <button
            className={styles.cartButton}
            onClick={isAddedToCart ? handleViewCart : handleAddToCart}
          >
            {isAddedToCart ? "View Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Greenzy. All Rights Reserved.</p>
        <div className={styles.socialIcons}>
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </footer>
    </div>
  );
}

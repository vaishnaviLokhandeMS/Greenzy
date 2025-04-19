import { useState, useEffect } from "react";
import styles from "./Home.module.css";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaSearch,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import { useRouter } from "next/router";

export default function Home() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryImages, setCategoryImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // ✅ Fetch Hero Images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/getHeroImages");
        const data = await res.json();
        if (data.images) setImages(data.images);
      } catch (error) {
        console.error("❌ Error fetching images:", error);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images]);

  // ✅ Fetch Circular Category Images
  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        const res = await fetch("/api/getCircularCategoriesImages");
        const data = await res.json();
        setCategoryImages(data.images || []);
      } catch (error) {
        console.error("❌ Error fetching circular category images:", error);
      }
    };
    fetchCategoryImages();
  }, []);

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://backendnursury.leafylegacy.in/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getFileName = (imagePath) => {
    return imagePath.split("/").pop().replace(/\.[^/.]+$/, "");
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    router.push(
      `/productview?category=${encodeURIComponent(
        categoryName
      )}&subcategory=${encodeURIComponent(subcategoryName)}`
    );
  };

  return (
    <div className={styles.container}>
      {/* 🔷 Header */}
      <header className={styles.header}>
        {/* Logo + Categories */}
        <div className={styles.leftSection}>
          <div className={styles.logo}>🌿 LeafyLegacy.in</div>
          <nav className={styles.nav}>
            {categories.map((category) => (
              <div key={category._id} className={styles.dropdown}>
                <button className={styles.dropbtn}>
                  {category.categoryname}
                </button>
                <div className={styles.dropdownContent}>
                  {category.subcategories?.map((sub, idx) => (
                    <a
                      key={idx}
                      onClick={() =>
                        handleSubcategoryClick(
                          category.categoryname,
                          sub.subcategoryname
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {sub.subcategoryname}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Search + Icons */}
        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search for plants, seeds and planters ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className={styles.searchIcon} />
          </div>
          <BiRupee className={styles.icon} />
          <FaUser className={styles.icon} />
          <div className={styles.cartIcon}>
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      {/* 🔷 Hero Section */}
      <div className={styles.heroSection}>
        {images.length > 0 && (
          <img
            src={images[currentIndex]}
            alt="Hero Banner"
            className={styles.heroImage}
          />
        )}
        <div className={styles.overlay}></div>
        <div className={styles.heroText}>
          <h2>Welcome to Greenzy</h2>
          <p>Discover nature's beauty with us!</p>
        </div>
      </div>

      {/* 🔷 Circular Category Preview Section */}
      <div className={styles.circularContainer}>
        {categoryImages.length > 0 ? (
          categoryImages.map((image, index) => (
            <div key={index} className={styles.circularItem}>
              <img
                src={image}
                alt={`Category ${index}`}
                className={styles.circularImage}
              />
              <p className={styles.imageName}>{getFileName(image)}</p>
            </div>
          ))
        ) : (
          <p>Loading Categories...</p>
        )}
      </div>

      {/* 🔷 Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Greenzy. All Rights Reserved.</p>
        <div className={styles.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
        </div>
      </footer>
    </div>
  );
}

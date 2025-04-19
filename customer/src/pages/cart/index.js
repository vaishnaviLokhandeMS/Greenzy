import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import styles from "./Cart.module.css";
import {
  FaUser,
  FaShoppingCart,
  FaSearch,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalWithDiscount, setTotalWithDiscount] = useState(0);
  const router = useRouter();

  const userContact =
    typeof window !== "undefined"
      ? localStorage.getItem("contactnumber")
      : null;

  useEffect(() => {
    if (!userContact) {
      router.push("/login");
      return;
    }

    fetch(`https://backend.leafylegacy.in/api/cart/view/${userContact}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.cart.filter(item => item.quantity > 0);
        setCartItems(filtered);
        calculateTotals(filtered);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, [userContact]);

  const calculateTotals = (items) => {
    let total = 0;
    let discounted = 0;

    items.forEach((item) => {
      const price = item.productid.sellers?.[0]?.price || 0;
      const discount = item.productid.discount || 0;
      const discountedPrice = price - (price * discount) / 100;

      total += price * item.quantity;
      discounted += discountedPrice * item.quantity;
    });

    setTotal(total);
    setTotalWithDiscount(discounted);
  };

  const updateQuantity = async (productId, type) => {
    const cartItem = cartItems.find((item) => item._id === productId);
    if (!cartItem) return;

    let newQuantity =
      type === "increase"
        ? cartItem.quantity + 1
        : cartItem.quantity - 1;

    if (newQuantity <= 0) {
      await fetch("https://backend.leafylegacy.in/api/cart/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactnumber: userContact,
          productid: productId,
        }),
      });
      const updated = cartItems.filter((item) => item._id !== productId);
      setCartItems(updated);
      calculateTotals(updated);
      return;
    }

    await fetch("https://backend.leafylegacy.in/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactnumber: userContact,
        productid: productId,
        quantity: newQuantity,
      }),
    });

    const updated = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    calculateTotals(updated);
  };

  const handleBuyNow = (productId, quantity) => {
    if (!userContact) {
      router.push("/login");
      return;
    }

    router.push({
      pathname: "/buyNow",
      query: { productId, quantity },
    });
  };

  const handleCheckout = () => {
    if (!userContact) {
      router.push("/login");
    } else {
      router.push("/buyNow?checkout=true");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>🌿 Greenzy</div>
        </div>
        <div className={styles.centerSection}>
          <span className={styles.cartTitle}>🛒 My Cart</span>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for plants..." />
            <FaSearch className={styles.searchIcon} />
          </div>
          <FaUser className={styles.icon} />
          <div className={styles.cartIcon} onClick={() => router.push("/cart")}>
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className={styles.content}>
        <div className={styles.left}>
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            cartItems.map((item) => {
              const price = item.productid.sellers?.[0]?.price || 0;
              const discount = item.productid.discount || 0;
              const discountedPrice = price - (price * discount) / 100;
              const productName = item.productid.productname || "Unknown";
              const imagePath = item.productid.filenames?.length
                ? `https://backend.leafylegacy.in/uploads/${item.productid.filenames[0].replace("\\", "/")}`
                : "/default-image.jpg";

              return (
                <div className={styles.item} key={item._id}>
                  <img src={imagePath} alt={productName} className={styles.productImage} />
                  <div className={styles.details}>
                    <h3>{productName}</h3>
                    <p>₹ {price} <span className={styles.discount}>({discount}% OFF)</span></p>
                    <p>₹ {discountedPrice.toFixed(2)}</p>
                    <div className={styles.controls}>
                      {item.quantity > 1 ? (
                        <button onClick={() => updateQuantity(item._id, "decrease")}>-</button>
                      ) : (
                        <button onClick={() => updateQuantity(item._id, "decrease")}><FaTrash /></button>
                      )}
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, "increase")}>+</button>
                    </div>
                    <button onClick={() => handleBuyNow(item._id, item.quantity)} className={styles.buyNow}>Buy Now</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.summary}>
          <h3>Cart Summary</h3>
          <p>Total Items: {cartItems.length}</p>
          <p>Estimated Total: ₹ {total.toFixed(2)}</p>
          <p>With Discount: ₹ {totalWithDiscount.toFixed(2)}</p>
          <button className={styles.checkout} onClick={handleCheckout}>
            Proceed to Checkout
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

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import styles from "./Cart.module.css";
import { BiRupee } from "react-icons/bi";
import { FaUser, FaShoppingCart, FaSearch, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalWithDiscount, setTotalWithDiscount] = useState(0);

  const userContact = typeof window !== "undefined" ? localStorage.getItem("contactnumber") : null;

  const router = useRouter();

  useEffect(() => {
    if (userContact) {
      fetch(`http://localhost:5000/api/cart/view/${userContact}`)
        .then((res) => res.json())
        .then((data) => {
          setCartItems(data.cart);
          setTotal(data.total);
          setTotalWithDiscount(data.totalWithDiscount);
        })
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, [userContact]);

  const updateQuantity = async (productId, type) => {
    const cartItem = cartItems.find((item) => item._id === productId);
    if (!cartItem) return;  // If cartItem doesn't exist, don't proceed

    const stock = cartItem.productid.sellers[0].stock;
    
    // Calculate the new quantity based on the increase/decrease button click
    const newQuantity = type === "increase" 
      ? Math.min(cartItem.quantity + 1, stock) 
      : Math.max(cartItem.quantity - 1, 0);
  
    // Update quantity in the UI first
    const updatedCartItems = cartItems.map(item => 
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems);  // Update the UI with the new quantity
    
    // Update the total amounts in the UI
    const newTotal = calculateTotal(updatedCartItems);
    const newTotalWithDiscount = calculateTotalWithDiscount(updatedCartItems);
    setTotal(newTotal);
    setTotalWithDiscount(newTotalWithDiscount);

    // Send updated quantity to backend
    const response = await fetch("http://localhost:5000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactnumber: userContact,
        productid: productId,
        quantity: newQuantity
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating cart:", errorData);
    }
  };

  const calculateTotal = (updatedCartItems) => {
    let total = 0;
    updatedCartItems.forEach((item) => {
      const price = item.productid.sellers && item.productid.sellers.length > 0 ? item.productid.sellers[0].price : 0;
      total += price * item.quantity;
    });
    return total;
  };

  const calculateTotalWithDiscount = (updatedCartItems) => {
    let totalWithDiscount = 0;
    updatedCartItems.forEach((item) => {
      const price = item.productid.sellers && item.productid.sellers.length > 0 ? item.productid.sellers[0].price : 0;
      const discount = item.productid.discount || 0;
      const discountedPrice = price - (price * discount) / 100;
      totalWithDiscount += discountedPrice * item.quantity;
    });
    return totalWithDiscount;
  };

  const handleBuyNow = async (productId, quantity) => {
    // We redirect to /buyNow route, passing productId and quantity in the query
    router.push({
      pathname: "/buyNow",
      query: { productId, quantity },
    });
  };

  return (
    <div className={styles.container}>
      {/* ✅ Header */}
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>🌿 Greenzy</div>
        </div>
        <div className={styles.centerSection}>
          <span className={styles.cartTitle}>🛒 My Cart</span>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for plants, seeds and planters ..." />
            <FaSearch className={styles.searchIcon} />
          </div>
          <FaUser className={styles.icon} />
          <div className={styles.cartIcon} onClick={() => router.push("/cart")}>
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      {/* 🛒 Cart Page Content */}
      <div className={styles.content}>
        <div className={styles.left}>
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            cartItems.map((item) => {
              const price = item.productid.sellers && item.productid.sellers.length > 0 
                ? item.productid.sellers[0].price 
                : 0;
              const discount = item.productid.discount || 0;
              const discountedPrice = price - (price * discount) / 100;
              const productName = item.productid.productname || "Unknown Product";
              const imagePath = item.productid.filenames?.length > 0 
                ? `http://localhost:5000/uploads/${item.productid.filenames[0].replace("\\", "/")}` 
                : "http://localhost:5000/uploads/default_image.jpg"; // Default image if no filename

              return (
                <div className={styles.item} key={item._id}>
                  <img
                    src={imagePath}
                    alt={productName}
                    className={styles.productImage}
                  />
                  <div className={styles.details}>
                    <h3>{productName}</h3>
                    <p>₹ {price} <span className={styles.discount}>({discount}% OFF)</span></p>
                    <p>₹ {discountedPrice.toFixed(2)} (Discounted Price)</p>
                    <div className={styles.controls}>
                      <button 
                        onClick={() => updateQuantity(item._id, "decrease")} 
                        disabled={item.quantity <= 0}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, "increase")} 
                        disabled={item.quantity >= item.productid.sellers[0].stock}
                      >
                        +
                      </button>
                      <button className={styles.trash} onClick={() => updateQuantity(item._id, "remove")}>
                        <FaTrash />
                      </button>
                    </div>
                    <button onClick={() => handleBuyNow(item._id, item.quantity)} className={styles.buyNow}>
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.summary}>
          <h3>Cart Summary</h3>
          <p>Total Items: {cartItems.length}</p>
          <p>Estimated Total: ₹ {total}</p>
          <p>Estimated Total (with discount): ₹ {totalWithDiscount}</p>
          <button className={styles.checkout}onClick={() => router.push("/buyNow?checkout=true")}>Proceed to Checkout</button>
        </div>
      </div>

      {/* ✅ Footer */}
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

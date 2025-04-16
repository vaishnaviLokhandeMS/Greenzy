// pages/buynow/index.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import styles from "./BuyNow.module.css";

export default function BuyNowPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [singleItem, setSingleItem] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalWithDiscount, setTotalWithDiscount] = useState(0);

  // We'll store the shipping/billing data in a single state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
    email: "",
  });

  // Retrieve details from localStorage if available
  const userContact =
    typeof window !== "undefined" ? localStorage.getItem("contactnumber") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userid") : null;
  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("useremail") : null;

  // Extract query parameters: productId, quantity, checkout
  const { productId, quantity, checkout } = router.query;

  useEffect(() => {
    if (!userContact) return;

    if (checkout === "true") {
      // Load all cart items if user wants to buy entire cart
      fetch(`http://localhost:5000/api/cart/view/${userContact}`)
        .then((res) => res.json())
        .then((data) => {
          setCartItems(data.cart);
          setTotal(data.total);
          setTotalWithDiscount(data.totalWithDiscount);
        })
        .catch((err) => console.error("Error fetching cart:", err));
    } else if (productId && quantity) {
      // For a single item Buy Now
      fetch(`http://localhost:5000/api/cart/view/${userContact}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.cart.find((cartItem) => cartItem._id === productId);
          if (item) {
            setSingleItem({
              ...item,
              quantity: Number(quantity),
            });
            const price = item.productid.sellers[0].price;
            const discount = item.productid.discount || 0;
            const discountedPrice = price - (price * discount) / 100;
            setTotal(price * Number(quantity));
            setTotalWithDiscount(discountedPrice * Number(quantity));
          }
        })
        .catch((err) => console.error("Error fetching single item:", err));
    }
  }, [userContact, productId, quantity, checkout]);

  // Helper function to update form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to place the order
  const placeOrder = async () => {
    try {
      // Build the list of items to order
      let itemsToOrder = [];
      let finalAmount = 0;
      let finalAmountDiscounted = 0;

      if (singleItem) {
        const price = singleItem.productid.sellers[0].price;
        const discount = singleItem.productid.discount || 0;
        const discountedPrice = price - (price * discount) / 100;

        itemsToOrder.push({
          productid: singleItem.productid._id,
          productnumber: singleItem.productid.productnumber || "N/A",
          productname: singleItem.productid.productname || "N/A",
          categoryid: singleItem.productid.categoryid || null,
          subcategoryid: singleItem.productid.subcategoryid || null,
          quantity: singleItem.quantity,
          price: price,
          discount: discount,
          finalprice: discountedPrice,
          sellerid: singleItem.productid.sellers[0]._id,
          isAvailable: true,
        });

        finalAmount = price * singleItem.quantity;
        finalAmountDiscounted = discountedPrice * singleItem.quantity;
      } else {
        cartItems.forEach((item) => {
          const price = item.productid.sellers[0].price;
          const discount = item.productid.discount || 0;
          const discountedPrice = price - (price * discount) / 100;

          itemsToOrder.push({
            productid: item.productid._id,
            productnumber: item.productid.productnumber || "N/A",
            productname: item.productid.productname || "N/A",
            categoryid: item.productid.categoryid || null,
            subcategoryid: item.productid.subcategoryid || null,
            quantity: item.quantity,
            price: price,
            discount: discount,
            finalprice: discountedPrice,
            sellerid: item.productid.sellers[0]._id,
            isAvailable: true,
          });

          finalAmount += price * item.quantity;
          finalAmountDiscounted += discountedPrice * item.quantity;
        });
      }

      // Example shipping cost
      const shippingCost = 50;

      // Create order data
      const orderData = {
        userid: userId,
        items: itemsToOrder,
        totalamount: finalAmount,
        shippingamount: shippingCost,
        totalpayable: finalAmountDiscounted + shippingCost,
        paymentmethod: "UPI", // or 'Card', 'Wallet', etc.
        paymentstatus: "pending",
        orderstatus: "pending",
        shippingaddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        userContact: userContact,
        userEmail: formData.email || userEmail,
      };

      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating order:", errorData);
        alert("Error placing order!");
      } else {
        const successData = await response.json();
        console.log("Order created:", successData);
        alert("Your order has been placed successfully!");
        // Optionally, redirect
        router.push("/orderSuccess");
      }
    } catch (err) {
      console.error("Error in placeOrder:", err);
      alert("An error occurred while placing your order.");
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
          <span className={styles.pageTitle}>Buy Now</span>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search for plants, seeds and planters ..."
            />
            <FaSearch className={styles.searchIcon} />
          </div>
          <FaUser className={styles.icon} />
          <div
            className={styles.cartIcon}
            onClick={() => router.push("/cart")}
          >
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      {/* ====== Two-Column Layout ====== */}
      <div className={styles.checkoutContainer}>
        {/* Left Column: Billing/Shipping Form */}
        <div className={styles.formSection}>
          <h2>Billing Details</h2>
          <div className={styles.formGroup}>
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Company Name (optional)</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Street Address *</label>
            <input
              type="text"
              name="street"
              placeholder="House number and street name"
              value={formData.street}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="apartment"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={formData.apartment}
              onChange={handleInputChange}
              style={{ marginTop: "8px" }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Town / City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Country / Region *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Postcode / ZIP *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summarySection}>
          <h2>Your order</h2>

          {/* Single Item Checkout */}
          {singleItem && (
            <div className={styles.itemSummary}>
              <p>
                <strong>Product:</strong> {singleItem.productid.productname} {" x "}
                {singleItem.quantity}
              </p>
              <p>
                <strong>Subtotal:</strong> ₹{total.toFixed(2)}
              </p>
              <p>
                <strong>Discounted:</strong> ₹{totalWithDiscount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Cart Items Checkout */}
          {!singleItem && cartItems.length > 0 && (
            <div className={styles.itemSummary}>
              {cartItems.map((item) => {
                const price = item.productid.sellers[0].price;
                const discount = item.productid.discount || 0;
                const discountedPrice = price - (price * discount) / 100;
                return (
                  <div key={item._id} className={styles.cartItem}>
                    <p>
                      <strong>{item.productid.productname}</strong> × {item.quantity}
                    </p>
                    <p>Subtotal: ₹{(price * item.quantity).toFixed(2)}</p>
                    <p>
                      Discounted Price: ₹
                      {(discountedPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
              <hr className={styles.divider} />
              <p><strong>Estimated Total:</strong> ₹{total}</p>
              <p><strong>Estimated Total (with discount):</strong> ₹{totalWithDiscount}</p>
            </div>
          )}

          {/* Payment Options (example) */}
          <div className={styles.paymentSection}>
            <h3>Payment</h3>
            <p>Cash on delivery</p>
            <p>Pay with cash upon delivery.</p>
          </div>

          <button onClick={placeOrder} className={styles.placeOrderButton}>
            Place Order
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Greenzy. All Rights Reserved.</p>
        <div className={styles.socialIcons}>
          <a href="#">
            <FaFacebook />
          </a>
          <a href="#">
            <FaInstagram />
          </a>
          <a href="#">
            <FaTwitter />
          </a>
        </div>
      </footer>
    </div>
  );
}

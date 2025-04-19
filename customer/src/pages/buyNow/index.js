import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import styles from "./BuyNow.module.css";

export default function BuyNowPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [singleItem, setSingleItem] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalWithDiscount, setTotalWithDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [gstFee, setGstFee] = useState({ gstPercentage: 0, platformFee: 0 });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const audioRef = useRef();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
  });

  const userContact = typeof window !== "undefined" ? localStorage.getItem("contactnumber") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("useremail") : null;
  const { productId, quantity, checkout } = router.query;

  const fetchGstFee = async () => {
    const res = await fetch("https://backend.leafylegacy.in/api/fees");
    const data = await res.json();
    setGstFee(data);
  };

  const fetchDeliveryCharge = async (pickup, delivery, weight = 0.5, price = 300) => {
    try {
      const res = await fetch(
        `https://backend.leafylegacy.in/api/shiprocket/rate?pickup=${pickup}&delivery=${delivery}&weight=${weight}&price=${price}`
      );
      const data = await res.json();
      if (data.deliveryCharge) setDeliveryCharge(data.deliveryCharge);
    } catch (err) {
      console.error("Delivery charge error:", err);
    }
  };

  useEffect(() => {
    if (!userContact) return;
    fetchGstFee();

    if (checkout === "true") {
      fetch(`https://backend.leafylegacy.in/api/cart/view/${userContact}`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.cart.filter((item) => item.quantity > 0);
          setCartItems(filtered);

          let total = 0;
          let discounted = 0;
          filtered.forEach((item) => {
            const price = item.productid.sellers?.[0]?.price || 0;
            const discount = item.productid.discount || 0;
            const discountedPrice = price - (price * discount) / 100;
            total += price * item.quantity;
            discounted += discountedPrice * item.quantity;
          });
          setTotal(total);
          setTotalWithDiscount(discounted);
        });
    } else if (productId && quantity) {
      fetch(`https://backend.leafylegacy.in/api/cart/view/${userContact}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.cart.find((cartItem) => cartItem._id === productId);
          if (item) {
            setSingleItem({ ...item, quantity: Number(quantity) });
            const price = item.productid.sellers[0].price;
            const discount = item.productid.discount || 0;
            const discountedPrice = price - (price * discount) / 100;
            setTotal(price * quantity);
            setTotalWithDiscount(discountedPrice * quantity);
          }
        });
    }
  }, [userContact, productId, quantity, checkout]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pincode" && /^\d{6}$/.test(value)) {
      try {
        const res = await fetch(`https://backend.leafylegacy.in/api/pincode/details/${value}`);
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          city: data.area,
          state: data.state,
        }));

        const price = singleItem
          ? singleItem.productid.sellers[0].price
          : cartItems[0]?.productid?.sellers?.[0]?.price || 300;

        fetchDeliveryCharge("414607", value, 0.5, price);
      } catch (err) {
        console.error("Pincode autofill error:", err);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }
    if (!formData.email.includes("@")) {
      errors.email = "Email must include '@'";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmAndPlaceOrder = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const placeOrder = async () => {
    let itemsToOrder = [];
    let finalAmount = 0;
    let finalAmountDiscounted = 0;

    const items = singleItem ? [singleItem] : cartItems;

    items.forEach((item) => {
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
        price,
        discount,
        finalprice: discountedPrice,
        sellerid: item.productid.sellers[0]._id,
        isAvailable: true,
      });

      finalAmount += price * item.quantity;
      finalAmountDiscounted += discountedPrice * item.quantity;
    });

    const transactionId = "TXN" + Date.now();
    const timestamp = new Date().toISOString();

    const orderData = {
      userid: userId,
      items: itemsToOrder,
      totalamount: finalAmount,
      shippingamount: deliveryCharge,
      platformFee: gstFee.platformFee,
      gstAmount: gstFee.gstPercentage,
      totalpayable:
        finalAmountDiscounted + deliveryCharge + gstFee.platformFee + gstFee.gstPercentage,
      paymentmethod: "COD",
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
      orderTrackingNumber: transactionId,
      createdat: timestamp,
    };

    const res = await fetch("https://backend.leafylegacy.in/api/orders/buynow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      setMessage("Order placed successfully!");
      audioRef.current?.play();
    } else {
      setMessage("Order failed. Try again.");
    }

    setShowPopup(true);
    setShowConfirmation(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>🌿 Greenzy</div>
        <div className={styles.pageTitle}>Buy Now</div>
        <div className={styles.rightSection}>
          <FaSearch className={styles.icon} />
          <FaUser className={styles.icon} />
          <div onClick={() => router.push("/cart")}>
            <FaShoppingCart className={styles.icon} />
            <span className={styles.cartBadge}>1</span>
          </div>
        </div>
      </header>

      <div className={styles.checkoutContainer}>
        <div className={styles.formSection}>
          <h2>Contact & Delivery</h2>

          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Pincode", name: "pincode" },
            { label: "City", name: "city", readOnly: true },
            { label: "Apartment", name: "apartment" },
            { label: "Street", name: "street" },
            { label: "State", name: "state", readOnly: true },
            { label: "Phone", name: "phone", error: formErrors.phone },
            { label: "Email", name: "email", error: formErrors.email },
          ].map(({ label, name, readOnly, error }) => (
            <div key={name} style={{ marginBottom: "18px" }}>
              <label style={{ color: "#58a6ff", display: "block", marginBottom: "5px" }}>{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                placeholder={`Enter ${label}`}
                readOnly={readOnly}
              />
              {error && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{error}</span>}
            </div>
          ))}
        </div>

        <div className={styles.summarySection}>
          <h2>Summary</h2>
          <p>Subtotal: ₹{total.toFixed(2)}</p>
          <p>Discounted: ₹{totalWithDiscount.toFixed(2)}</p>
          <p>GST: ₹{gstFee.gstPercentage}</p>
          <p>Platform Fee: ₹{gstFee.platformFee}</p>
          <p>Delivery: ₹{deliveryCharge}</p>
          <hr />
          <h3>
            Total: ₹
            {(totalWithDiscount + gstFee.platformFee + gstFee.gstPercentage + deliveryCharge).toFixed(2)}
          </h3>

          <button onClick={confirmAndPlaceOrder} className={styles.placeOrderButton}>
            Place Order (Cash on Delivery)
          </button>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.successModal}>
          <h3>Confirm Your Order</h3>
          <p><strong>Item:</strong> {singleItem ? singleItem.productid.productname : `${cartItems.length} items`}</p>
          <p><strong>Deliver To:</strong></p>
          <p>{formData.street}, {formData.city}, {formData.state} - {formData.pincode}</p>
          <button className={styles.placeOrderButton} onClick={placeOrder}>Confirm & Order</button>
          <button className={styles.closeButton} onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      )}

      {/* ✅ Success/Failure Modal */}
      {showPopup && (
        <div className={styles.successModal}>
          {message.toLowerCase().includes("success") ? (
            <FaCheckCircle className={styles.successIcon} />
          ) : (
            <FaTimesCircle className={styles.errorIcon} />
          )}
          <h3>{message.toLowerCase().includes("success") ? "Success!" : "Failed!"}</h3>
          <p>{message}</p>
          <button className={styles.closeButton} onClick={() => setShowPopup(false)}>
            Close
          </button>
        </div>
      )}
      
    </div>
  );
}

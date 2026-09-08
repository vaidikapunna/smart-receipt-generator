import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const STORE = {
  name: "THANMAYI KRISHNA COLLECTIONS",
  shortName: "TKC COLLECTIONS",
  tagline: "FASHION • ELEGANCE • EVERYDAY STYLE",
};

const API_BASE_URL = "https://thanmayi-krishna-backend.onrender.com";

function App() {
  // ====================================================
  // RECEIPT
  // ====================================================

  const [receiptNumber, setReceiptNumber] =
    useState("Loading...");

  const [isLoadingReceipt, setIsLoadingReceipt] =
    useState(true);

  const [isProcessing, setIsProcessing] =
    useState(false);

  // ====================================================
  // CUSTOMER
  // ====================================================

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // ====================================================
  // PRODUCTS
  // ====================================================

  const [products, setProducts] = useState([
    {
      id: Date.now(),
      name: "",
      price: "",
      quantity: 1,
    },
  ]);

  // ====================================================
  // DISCOUNT
  // ====================================================

  const [discount, setDiscount] = useState(0);

  // ====================================================
  // GET NEXT RECEIPT NUMBER
  // ====================================================

  const fetchNextReceiptNumber = async () => {
    try {
      setIsLoadingReceipt(true);

      const response = await fetch(
        `${API_BASE_URL}/api/next-receipt-number`
      );

      if (!response.ok) {
        throw new Error(
          "Could not connect to the backend."
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to get receipt number."
        );
      }

      setReceiptNumber(data.receiptNumber);

    } catch (error) {
      console.error(
        "Receipt number error:",
        error
      );

      setReceiptNumber("Unavailable");

      alert(
        "Could not connect to the billing database.\n\nPlease make sure the backend is running."
      );

    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // Get receipt number when the app opens.

  useEffect(() => {
    fetchNextReceiptNumber();
  }, []);

  // ====================================================
  // CUSTOMER HANDLER
  // ====================================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ====================================================
  // PRODUCT HANDLER
  // ====================================================

  const handleProductChange = (
    id,
    field,
    value
  ) => {
    setProducts((previous) =>
      previous.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: value,
            }
          : product
      )
    );
  };

  // ====================================================
  // ADD PRODUCT
  // ====================================================

  const addProduct = () => {
    setProducts((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        name: "",
        price: "",
        quantity: 1,
      },
    ]);
  };

  // ====================================================
  // REMOVE PRODUCT
  // ====================================================

  const removeProduct = (id) => {
    if (products.length === 1) {
      return;
    }

    setProducts((previous) =>
      previous.filter(
        (product) => product.id !== id
      )
    );
  };

  // ====================================================
  // CALCULATIONS
  // ====================================================

  const totalItems = products.reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0),
    0
  );

  const subtotal = products.reduce(
    (total, product) =>
      total +
      Number(product.price || 0) *
        Number(product.quantity || 0),
    0
  );

  const safeDiscount = Math.min(
    Math.max(Number(discount || 0), 0),
    100
  );

  const discountAmount =
    (subtotal * safeDiscount) / 100;

  const finalTotal =
    subtotal - discountAmount;

  // ====================================================
  // VALIDATION
  // ====================================================

  const validateBill = () => {
    if (!customer.name.trim()) {
      alert(
        "Please enter the customer name."
      );
      return false;
    }

    if (!customer.phone.trim()) {
      alert(
        "Please enter the Phone / WhatsApp number."
      );
      return false;
    }

    const phoneNumber =
      customer.phone.replace(/\D/g, "");

    if (phoneNumber.length < 10) {
      alert(
        "Please enter a valid phone number."
      );
      return false;
    }

    const invalidProduct =
      products.some(
        (product) =>
          !product.name.trim() ||
          Number(product.price) <= 0 ||
          Number(product.quantity) <= 0 ||
          !Number.isInteger(
            Number(product.quantity)
          )
      );

    if (invalidProduct) {
      alert(
        "Please enter a valid product name, price and whole-number quantity for every product."
      );
      return false;
    }

    return true;
  };

  // ====================================================
  // CREATE PDF
  // ====================================================

  const createReceiptPDF = (
    receiptNo = receiptNumber
  ) => {
    if (!validateBill()) {
      return null;
    }

    if (
      !receiptNo ||
      receiptNo === "Loading..." ||
      receiptNo === "Unavailable"
    ) {
      alert("Receipt number is not available yet.");
      return null;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // ==================================================
    // COLORS — based on the reference receipt
    // ==================================================

    const navy = [32, 43, 60];
    const gold = [166, 132, 62];
    const cream = [252, 250, 246];
    const beige = [239, 231, 211];
    const beigeLight = [247, 243, 234];
    const text = [58, 58, 58];
    const muted = [105, 105, 105];
    const line = [218, 211, 196];

    // ==================================================
    // PAPER
    // ==================================================

    doc.setFillColor(cream[0], cream[1], cream[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Very light paper border
    doc.setDrawColor(210, 201, 183);
    doc.setLineWidth(0.35);
    doc.rect(7, 7, 196, 283);

    // ==================================================
    // TOP BRAND AREA
    // ==================================================

    // TKC monogram on the left
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont("times", "normal");
    doc.setFontSize(40);
    doc.text("TKC", 12, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    doc.text("THANMAYI KRISHNA", 12, 30);
    doc.text("COLLECTIONS", 12, 33);

    // Main brand
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(25);
    doc.text("THANMAYI KRISHNA", 105, 19, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(13.8);
    doc.text("C O L L E C T I O N S", 105, 25, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(
      "FASHION  •  ELEGANCE  •  EVERYDAY STYLE",
      105,
      30,
      { align: "center" }
    );

    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.35);
    doc.line(78, 34, 132, 34);

    // Thank-you note on the right
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont("times", "italic");
    doc.setFontSize(13.8);
    doc.text("Thank you", 184, 17, { align: "right" });
    doc.text("for shopping", 184, 22, { align: "right" });
    doc.text("with us!", 184, 27, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12.5);
    

    // ==================================================
    // RECEIPT TITLE BAND
    // ==================================================

    doc.setFillColor(beige[0], beige[1], beige[2]);
    doc.roundedRect(10, 39, 190, 27, 2, 2, "F");

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(25);
    doc.text("PURCHASE RECEIPT", 105, 50, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(8.1);
    doc.text(
      "A LITTLE FASHION. A LOT OF HAPPINESS",
      105,
      56,
      { align: "center" }
    );

    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(10);
    

    // Receipt information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text("RECEIPT NO.", 169, 47);
    doc.text(receiptNo, 169, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    doc.setTextColor(muted[0], muted[1], muted[2]);

    const today = new Date().toLocaleDateString("en-IN");
    doc.text(`DATE: ${today}`, 169, 57);

    // ==================================================
    // CUSTOMER DETAILS
    // ==================================================

    const customerY = 70;

    doc.setFillColor(beigeLight[0], beigeLight[1], beigeLight[2]);
    doc.roundedRect(10, customerY, 190, 8, 1.5, 1.5, "F");

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.6);
    doc.text("CUSTOMER DETAILS", 14, customerY + 5.2);

    const customerBoxY = customerY + 8;

    doc.setDrawColor(line[0], line[1], line[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, customerBoxY, 190, 23, 1.5, 1.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.2);
    doc.setTextColor(text[0], text[1], text[2]);

    doc.text(`Name: ${customer.name}`, 15, customerBoxY + 6);
    doc.text(`Phone / WhatsApp: ${customer.phone}`, 15, customerBoxY + 12);

    if (customer.email.trim()) {
      doc.text(`Email: ${customer.email}`, 15, customerBoxY + 18);
    }

    // ==================================================
    // PURCHASE DETAILS HEADER
    // ==================================================

    const purchaseY = customerBoxY + 27;

    doc.setFillColor(beige[0], beige[1], beige[2]);
    doc.roundedRect(10, purchaseY, 190, 8, 1.5, 1.5, "F");

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.6);
    doc.text("PURCHASE DETAILS", 14, purchaseY + 5.2);

    // ==================================================
    // PURCHASE TABLE
    // ==================================================

    const tableY = purchaseY + 9;
    const tableHeight = Math.max(30, products.length * 11 + 9);

    doc.setDrawColor(line[0], line[1], line[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, tableY, 190, tableHeight, 1.5, 1.5);

    doc.setFillColor(beigeLight[0], beigeLight[1], beigeLight[2]);
    doc.rect(10.3, tableY + 0.3, 189.4, 8, "F");

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);

    doc.text("#", 14, tableY + 5.2);
    doc.text("ITEM", 23, tableY + 5.2);
    doc.text("QTY", 103, tableY + 5.2);
    doc.text("PRICE", 130, tableY + 5.2);
    doc.text("AMOUNT", 166, tableY + 5.2);

    let rowY = tableY + 15;

    products.forEach((product, index) => {
      const quantity = Number(product.quantity);
      const price = Number(product.price);
      const amount = quantity * price;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(text[0], text[1], text[2]);

      doc.text(String(index + 1), 14, rowY);
      doc.text(product.name, 23, rowY);
      doc.text(String(quantity), 105, rowY);
      doc.text(`Rs. ${price.toFixed(2)}`, 130, rowY);
      doc.text(`Rs. ${amount.toFixed(2)}`, 166, rowY);

      if (index < products.length - 1) {
        doc.setDrawColor(line[0], line[1], line[2]);
        doc.setLineWidth(0.2);
        doc.line(12, rowY + 5, 198, rowY + 5);
      }

      rowY += 11;
    });

    // ==================================================
    // SUMMARY — right-side compact card
    // ==================================================

    const summaryY = tableY + tableHeight + 7;
    const summaryX = 116;
    const summaryWidth = 84;

    doc.setFillColor(beigeLight[0], beigeLight[1], beigeLight[2]);
    doc.roundedRect(summaryX, summaryY, summaryWidth, 46, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(muted[0], muted[1], muted[2]);

    doc.text("Total Items", summaryX + 5, summaryY + 9);
    doc.text(String(totalItems), summaryX + summaryWidth - 5, summaryY + 9, {
      align: "right",
    });

    doc.text("Subtotal", summaryX + 5, summaryY + 18);
    doc.setTextColor(text[0], text[1], text[2]);
    doc.text(
      `Rs. ${subtotal.toFixed(2)}`,
      summaryX + summaryWidth - 5,
      summaryY + 18,
      { align: "right" }
    );

    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(`Discount (${safeDiscount}%)`, summaryX + 5, summaryY + 27);
    doc.setTextColor(text[0], text[1], text[2]);
    doc.text(
      `- Rs. ${discountAmount.toFixed(2)}`,
      summaryX + summaryWidth - 5,
      summaryY + 27,
      { align: "right" }
    );

    doc.setFillColor(beige[0], beige[1], beige[2]);
    doc.roundedRect(summaryX, summaryY + 31, summaryWidth, 12, 1.5, 1.5, "F");

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.8);
    doc.text("TOTAL", summaryX + 5, summaryY + 39);

    doc.setFontSize(18.8);
    doc.text(
      `Rs. ${finalTotal.toFixed(2)}`,
      summaryX + summaryWidth - 5,
      summaryY + 39,
      { align: "right" }
    );

    // ==================================================
    // FOOTER THANK YOU AREA
    // ==================================================

    const footerY = 250;

    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.35);
    doc.line(15, footerY, 195, footerY);

    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont("times", "italic");
    doc.setFontSize(17.5);
    doc.text("Thank you for shopping with us!", 105, footerY + 8, {
      align: "center",
    });

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(11.2);
    doc.text("THANMAYI KRISHNA COLLECTIONS", 105, footerY + 15, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(7.5);
    doc.text(
      "FASHION  •  ELEGANCE  •  EVERYDAY STYLE",
      105,
      footerY + 21,
      { align: "center" }
    );

    // ==================================================
    // BOTTOM SERVICE STRIP
    // ==================================================

    doc.setDrawColor(line[0], line[1], line[2]);
    doc.setLineWidth(0.25);
    doc.line(15, 279, 195, 279);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(navy[0], navy[1], navy[2]);

    doc.text("QUALITY", 38, 285, { align: "center" });
    doc.text("CAREFULLY PACKED", 78, 285, { align: "center" });
    doc.text("HAPPY CUSTOMERS", 125, 285, { align: "center" });
    doc.text("SHOP WITH US", 170, 285, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text("TKC COLLECTIONS  •  STAY STYLISH", 105, 291, {
      align: "center",
    });

    return doc;
  };

  // ====================================================
  // GENERATE RECEIPT
  // ====================================================

  const handleGenerateReceipt = async () => {
    if (!validateBill()) {
      return;
    }

    try {
      // Get the current number from the database.
      // This does NOT save a sale.

      const response = await fetch(
        `${API_BASE_URL}/api/next-receipt-number`
      );

      if (!response.ok) {
        throw new Error(
          "Backend connection failed."
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to get receipt number."
        );
      }

      const previewReceiptNumber =
        data.receiptNumber;

      setReceiptNumber(
        previewReceiptNumber
      );

      const doc = createReceiptPDF(
        previewReceiptNumber
      );

      if (!doc) {
        return;
      }

      doc.save(
        `${previewReceiptNumber}.pdf`
      );

    } catch (error) {
      console.error(
        "Generate receipt error:",
        error
      );

      alert(
        "Unable to generate the receipt.\n\nPlease make sure the backend is running."
      );
    }
  };

  // ====================================================
  // SEND / SHARE RECEIPT
  // ====================================================

  const handleWhatsApp = async () => {
    if (!validateBill()) {
      return;
    }

    if (isProcessing) {
      return;
    }

    const phoneNumber =
      customer.phone.replace(/\D/g, "");

    if (phoneNumber.length < 10) {
      alert(
        "Please enter a valid WhatsApp number."
      );
      return;
    }

    try {
      setIsProcessing(true);

      // ==================================================
      // SAVE SALE TO DATABASE
      // ==================================================

      const response = await fetch(
        `${API_BASE_URL}/api/sales`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer: {
              name:
                customer.name.trim(),

              phone:
                customer.phone.trim(),

              email:
                customer.email.trim(),
            },

            products:
              products.map(
                (product) => ({
                  name:
                    product.name.trim(),

                  price:
                    Number(product.price),

                  quantity:
                    Number(
                      product.quantity
                    ),
                })
              ),

            discount:
              safeDiscount,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save the sale."
        );
      }

      // ==================================================
      // OFFICIAL RECEIPT NUMBER
      // ==================================================

      const officialReceiptNumber =
        data.receiptNumber;

      setReceiptNumber(
        officialReceiptNumber
      );

      // ==================================================
      // CREATE OFFICIAL PDF
      // ==================================================

      const doc =
        createReceiptPDF(
          officialReceiptNumber
        );

      if (!doc) {
        return;
      }

      const pdfBlob =
        doc.output("blob");

      const pdfFile =
        new File(
          [pdfBlob],
          `${officialReceiptNumber}.pdf`,
          {
            type:
              "application/pdf",
          }
        );

      // ==================================================
      // MOBILE SHARE
      // ==================================================

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [pdfFile],
        })
      ) {
        try {
          await navigator.share({
            title:
              `${STORE.name} Receipt`,

            text:
              `Receipt ${officialReceiptNumber}`,

            files: [pdfFile],
          });

          alert(
            `Receipt ${officialReceiptNumber} is ready to share.`
          );

          // Get next receipt number
          // for the next sale.

          await fetchNextReceiptNumber();

          return;

        } catch (error) {

          if (
            error.name ===
            "AbortError"
          ) {
            // User cancelled sharing.
            // Sale is already saved.
            return;
          }

          throw error;
        }
      }

      // ==================================================
      // DESKTOP
      // ==================================================

      doc.save(
        `${officialReceiptNumber}.pdf`
      );

      const message =
        `Hello ${customer.name},\n\n` +
        `Thank you for shopping with ${STORE.name}.\n\n` +
        `Receipt No: ${officialReceiptNumber}\n` +
        `Total Amount: Rs. ${Number(
          data.totalAmount
        ).toFixed(2)}\n\n` +
        `Your receipt PDF has been generated and downloaded.`;

      const whatsappURL =
        `https://wa.me/${phoneNumber}` +
        `?text=` +
        encodeURIComponent(message);

      window.open(
        whatsappURL,
        "_blank"
      );

      alert(
        `Sale saved successfully.\n\nReceipt: ${officialReceiptNumber}\n\nThe PDF has been downloaded and WhatsApp has been opened.`
      );

      // Prepare next receipt number.

      await fetchNextReceiptNumber();

    } catch (error) {

      console.error(
        "Sale / WhatsApp error:",
        error
      );

      alert(
        error.message ||
          "Unable to save the sale."
      );

    } finally {
      setIsProcessing(false);
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="app-shell">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="store-header">

        <div className="brand-mark">
          TK
        </div>

        <div className="brand">

          <p className="eyebrow">
            BOUTIQUE & COLLECTIONS
          </p>

          <h1>
            {STORE.name}
          </h1>

          <p className="tagline">
            {STORE.tagline}
          </p>

        </div>

        <div className="sale-badge">
          <span>●</span>
          NEW SALE
        </div>

      </header>

      {/* ==================================================
          INTRO
      ================================================== */}

      <section className="welcome">

        <div>

          <p className="section-label">
            BILLING DESK
          </p>

          <h2>
            Create a new sale
          </h2>

          <p>
            Add customer details and
            purchased items to prepare
            the bill.
          </p>

        </div>

        <div className="receipt-number">

          <span>
            RECEIPT
          </span>

          <strong>
            {receiptNumber}
          </strong>

        </div>

      </section>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="billing-layout">

        <div className="left-column">

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <section className="card">

            <div className="card-heading">

              <div className="number-icon">
                01
              </div>

              <div>

                <h3>
                  Customer Details
                </h3>

                <p>
                  Information for this purchase
                </p>

              </div>

            </div>

            <div className="customer-grid">

              {/* NAME */}

              <div className="field">

                <label>
                  Customer Name

                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Enter customer name"
                />

              </div>

              {/* PHONE */}

              <div className="field">

                <label>
                  Phone / WhatsApp

                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="e.g. 919876543210"
                />

                <small>
                  Include country code for WhatsApp
                </small>

              </div>

              {/* EMAIL */}

              <div className="field full-field">

                <label>
                  Email

                  <span className="optional">
                    Optional
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="customer@example.com"
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          <section className="card">

            <div className="products-header">

              <div className="card-heading">

                <div className="number-icon">
                  02
                </div>

                <div>

                  <h3>
                    Purchased Items
                  </h3>

                  <p>
                    Add all products in this sale
                  </p>

                </div>

              </div>

              <button
                className="add-button"
                type="button"
                onClick={addProduct}
              >
                + Add Product
              </button>

            </div>

            <div className="product-list">

              {products.map(
                (product, index) => {

                  const itemTotal =
                    Number(
                      product.price || 0
                    ) *
                    Number(
                      product.quantity || 0
                    );

                  return (

                    <div
                      className="product-row"
                      key={product.id}
                    >

                      <div className="product-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="product-fields">

                        {/* PRODUCT */}

                        <div className="field product-name">

                          <label>
                            Product
                          </label>

                          <input
                            type="text"
                            value={
                              product.name
                            }
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Kurti"
                          />

                        </div>

                        {/* PRICE */}

                        <div className="field">

                          <label>
                            Price
                          </label>

                          <div className="price-input">

                            <span>
                              ₹
                            </span>

                            <input
                              type="number"
                              value={
                                product.price
                              }
                              onChange={(e) =>
                                handleProductChange(
                                  product.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />

                          </div>

                        </div>

                        {/* QUANTITY */}

                        <div className="field">

                          <label>
                            Qty
                          </label>

                          <input
                            type="number"
                            value={
                              product.quantity
                            }
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            min="1"
                            step="1"
                          />

                        </div>

                        {/* AMOUNT */}

                        <div className="item-total">

                          <label>
                            Amount
                          </label>

                          <strong>
                            ₹
                            {itemTotal.toFixed(
                              2
                            )}
                          </strong>

                        </div>

                        {/* REMOVE */}

                        <button
                          className="remove-button"
                          type="button"
                          onClick={() =>
                            removeProduct(
                              product.id
                            )
                          }
                          disabled={
                            products.length ===
                            1
                          }
                          title="Remove product"
                        >
                          ×
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

            <button
              className="add-mobile"
              type="button"
              onClick={addProduct}
            >
              + Add another product
            </button>

          </section>

        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <aside className="summary-card">

          <div className="summary-top">

            <p className="section-label">
              ORDER SUMMARY
            </p>

            <h3>
              Your Bill
            </h3>

            <p>
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in this purchase
            </p>

          </div>

          <div className="summary-products">

            {products.map(
              (product) => (

                <div
                  className="mini-product"
                  key={product.id}
                >

                  <div>

                    <strong>
                      {product.name ||
                        "New product"}
                    </strong>

                    <span>
                      {product.quantity ||
                        0}{" "}
                      × ₹
                      {Number(
                        product.price ||
                          0
                      ).toFixed(2)}
                    </span>

                  </div>

                  <strong>
                    ₹
                    {(
                      Number(
                        product.quantity ||
                          0
                      ) *
                      Number(
                        product.price ||
                          0
                      )
                    ).toFixed(2)}
                  </strong>

                </div>

              )
            )}

          </div>

          <div className="divider"></div>

          {/* SUBTOTAL */}

          <div className="summary-line">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {subtotal.toFixed(2)}
            </strong>

          </div>

          {/* DISCOUNT */}

          <div className="discount-section">

            <div>

              <label>
                Discount
              </label>

              <p>
                Apply to entire order
              </p>

            </div>

            <div className="discount-box">

              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    e.target.value
                  )
                }
                min="0"
                max="100"
                step="0.01"
              />

              <span>
                %
              </span>

            </div>

          </div>

          {/* DISCOUNT AMOUNT */}

          <div className="summary-line discount-line">

            <span>
              Discount Amount
            </span>

            <strong>
              - ₹
              {discountAmount.toFixed(
                2
              )}
            </strong>

          </div>

          <div className="divider"></div>

          {/* TOTAL */}

          <div className="grand-total">

            <div>

              <span>
                TOTAL AMOUNT
              </span>

              <small>
                Including discount
              </small>

            </div>

            <strong>
              ₹
              {finalTotal.toFixed(2)}
            </strong>

          </div>

          {/* GENERATE */}

          <button
            className="receipt-button"
            type="button"
            onClick={
              handleGenerateReceipt
            }
            disabled={
              isProcessing ||
              isLoadingReceipt
            }
          >
            {isLoadingReceipt
              ? "Loading Receipt Number..."
              : "Generate Receipt"}
          </button>

          {/* WHATSAPP */}

          <button
            className="whatsapp-button"
            type="button"
            onClick={
              handleWhatsApp
            }
            disabled={
              isProcessing ||
              isLoadingReceipt
            }
          >

            <span className="whatsapp-icon">
              ◉
            </span>

            {isProcessing
              ? "Processing..."
              : "Send Receipt to WhatsApp"}

          </button>

          <p className="secure-note">
            Customer information is used
            only for this transaction.
          </p>

        </aside>

      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer>

        <strong>
          {STORE.name}
        </strong>

        <span>
          •
        </span>

        <span>
          {STORE.tagline}
        </span>

      </footer>

    </div>
  );
}

export default App;
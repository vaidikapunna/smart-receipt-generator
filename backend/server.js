const express = require("express");
const cors = require("cors");

const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "THANMAYI KRISHNA COLLECTIONS backend is running!"
    });
});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/database-test", (req, res) => {

    try {

        const customers = db
            .prepare("SELECT * FROM customers")
            .all();

        res.json({
            success: true,
            message: "Database connection is working!",
            customers: customers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });

    }

});


// 
// ==========================================
// GET NEXT RECEIPT NUMBER
// ==========================================

app.get("/api/next-receipt-number", (req, res) => {
    try {
        const year = new Date().getFullYear();

        const latestReceipt = db.prepare(`
            SELECT receipt_number
            FROM sales
            WHERE receipt_number LIKE ?
            ORDER BY id DESC
            LIMIT 1
        `).get(`TKC-${year}-%`);

        let nextNumber = 1;

        if (latestReceipt) {
            const lastNumber = parseInt(
                latestReceipt.receipt_number.split("-")[2],
                10
            );

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const receiptNumber =
            `TKC-${year}-${String(nextNumber).padStart(4, "0")}`;

        res.json({
            success: true,
            receiptNumber
        });

    } catch (error) {
        console.error("RECEIPT NUMBER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to get receipt number."
        });
    }
});

// CREATE SALE
// ==========================================

app.post("/api/sales", (req, res) => {

    try {

        const {
            customer,
            products,
            discount
        } = req.body;


        // ------------------------------
        // Validate customer
        // ------------------------------

        if (!customer || !customer.name || !customer.phone) {

            return res.status(400).json({
                success: false,
                message: "Customer name and phone are required."
            });

        }


        // ------------------------------
        // Validate products
        // ------------------------------

        if (!Array.isArray(products) || products.length === 0) {

            return res.status(400).json({
                success: false,
                message: "At least one product is required."
            });

        }


        // ------------------------------
        // Calculate totals
        // ------------------------------

        let subtotal = 0;

        for (const product of products) {

            const price = Number(product.price);
            const quantity = Number(product.quantity);

            if (
                !product.name ||
                !Number.isFinite(price) ||
                price <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid product information."
                });

            }

            subtotal += price * quantity;

        }


        const discountPercent = Math.min(
            Math.max(Number(discount) || 0, 0),
            100
        );

        const discountAmount =
            subtotal * discountPercent / 100;

        const totalAmount =
            subtotal - discountAmount;


        // ------------------------------
        // Generate receipt number
        // ------------------------------

        const year = new Date().getFullYear();


        const latestReceipt = db.prepare(`
            SELECT receipt_number
            FROM sales
            WHERE receipt_number LIKE ?
            ORDER BY id DESC
            LIMIT 1
        `).get(`TKC-${year}-%`);


        let nextNumber = 1;


        if (latestReceipt) {

            const lastNumber = parseInt(
                latestReceipt.receipt_number.split("-")[2],
                10
            );

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }

        }


        const receiptNumber =
            `TKC-${year}-${String(nextNumber).padStart(4, "0")}`;


        // ==========================================
        // DATABASE TRANSACTION
        // ==========================================

        const createSale = db.transaction(() => {


            // ------------------------------
            // Create customer
            // ------------------------------

            const customerResult = db.prepare(`
                INSERT INTO customers
                (name, phone, email)
                VALUES (?, ?, ?)
            `).run(
                customer.name.trim(),
                customer.phone.trim(),
                customer.email?.trim() || null
            );


            const customerId =
                customerResult.lastInsertRowid;


            // ------------------------------
            // Create sale
            // ------------------------------

            const saleResult = db.prepare(`
                INSERT INTO sales
                (
                    receipt_number,
                    customer_id,
                    subtotal,
                    discount_percent,
                    discount_amount,
                    total_amount,
                    whatsapp_status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                receiptNumber,
                customerId,
                subtotal,
                discountPercent,
                discountAmount,
                totalAmount,
                "pending"
            );


            const saleId =
                saleResult.lastInsertRowid;


            // ------------------------------
            // Create sale items
            // ------------------------------

            const insertItem = db.prepare(`
                INSERT INTO sale_items
                (
                    sale_id,
                    product_name,
                    price,
                    quantity,
                    amount
                )
                VALUES (?, ?, ?, ?, ?)
            `);


            for (const product of products) {

                const price = Number(product.price);
                const quantity = Number(product.quantity);

                insertItem.run(
                    saleId,
                    product.name.trim(),
                    price,
                    quantity,
                    price * quantity
                );

            }


            return {
                saleId,
                customerId
            };

        });


        const result = createSale();


        // ------------------------------
        // Response
        // ------------------------------

        res.status(201).json({

            success: true,

            message: "Sale saved successfully.",

            saleId: result.saleId,

            customerId: result.customerId,

            receiptNumber,

            subtotal,

            discountPercent,

            discountAmount,

            totalAmount

        });


    } catch (error) {

        console.error("SALE ERROR:", error);

        res.status(500).json({

            success: false,

            message: "Unable to save sale."

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Backend running at http://localhost:${PORT}`
    );

});
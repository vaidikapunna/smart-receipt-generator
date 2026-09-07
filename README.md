# \# Smart Receipt Generator

# 

# A full-stack digital receipt generation system built for \*\*Thanmayi Krishna Collections\*\*, a retail fashion store.

# 

# The application allows store staff to enter customer and purchase details, calculate discounts and totals, generate professionally designed PDF receipts, and prepare receipts for WhatsApp sharing.

# 

# \## Project Overview

# 

# Smart Receipt Generator is designed to simplify the billing and receipt-generation process for a small retail business.

# 

# The system combines a React frontend, Node.js backend, SQLite database, and PDF receipt generation into a single application.

# 

# \### Current Workflow

# 

# Customer \& Product Details

# &#x20;       ↓

# React Frontend

# &#x20;       ↓

# Node.js / Express Backend

# &#x20;       ↓

# SQLite Database

# &#x20;       ↓

# Receipt Number + Sale Record

# &#x20;       ↓

# Professional PDF Receipt

# &#x20;       ↓

# WhatsApp Sharing

# 

# \## Features

# 

# \- Customer name and phone/WhatsApp number

# \- Optional customer email

# \- Product name, price, and quantity

# \- Automatic subtotal calculation

# \- Discount percentage and discount amount

# \- Automatic final total calculation

# \- Sequential receipt numbering

# \- SQLite-based sales database

# \- Customer and sales record storage

# \- Professional boutique-style PDF receipts

# \- Receipt preview before saving a sale

# \- WhatsApp sharing workflow

# \- REST API between frontend and backend

# \- Transaction-based sale storage

# 

# \## Tech Stack

# 

# \### Frontend

# 

# \- React

# \- Vite

# \- JavaScript

# \- CSS

# \- jsPDF

# 

# \### Backend

# 

# \- Node.js

# \- Express.js

# \- better-sqlite3

# \- SQLite

# 

# \### Planned Integration

# 

# \- Meta WhatsApp Business Cloud API

# 

# \## Project Structure

# 

# ```text

# smart-receipt-generator/

# │

# ├── backend/

# │   ├── database.js

# │   ├── server.js

# │   ├── package.json

# │   └── package-lock.json

# │

# ├── frontend/

# │   ├── src/

# │   │   ├── App.jsx

# │   │   ├── App.css

# │   │   ├── main.jsx

# │   │   └── assets/

# │   ├── public/

# │   ├── package.json

# │   └── package-lock.json

# │

# ├── .gitignore

# └── README.md


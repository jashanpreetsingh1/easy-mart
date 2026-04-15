# easy-mart
A full-stack single-page grocery store application with 1,300+ products, featuring real-time search, cart, checkout, and secure authentication using PHP, MySQL, and AJAX.

# 🛒 EasyMART — Online Grocery Store

EasyMART is a full-stack single-page grocery store web application built using PHP, MySQL, and JavaScript. The platform allows users to browse products, search in real-time, manage a shopping cart, and complete checkout — all without page reloads.

## 👨‍💻 My Role
Full-Stack Development — PHP, JavaScript, MySQL, UI

---

## 🚀 Features

### 🏬 Department Browsing
Browse products by department dynamically loaded from the database.

### 🔍 Live Product Search
Search by name, brand, department, or UPC using MySQL REGEXP.

### 📦 Product Details
Each product includes image, price, description, and related products.

### 🛒 Cart & Checkout
- Add/remove/update items  
- Real-time subtotal, tax (13%), and total  
- Smooth checkout flow  

### 🔐 Authentication System
- Secure login system  
- Passwords hashed and salted  
- Auto-filled user details during checkout  

### 📍 Store Location
Integrated Google Maps with store details and contact information.

---

## ⚙️ How It Works

JavaScript sends AJAX requests to PHP endpoints. PHP queries MySQL and returns JSON responses. The frontend dynamically updates content without reloading the page, creating a smooth single-page application experience.

---

## 🧠 Challenges & Solutions

### 🖼 Images Not Loading
Fixed by dynamically rewriting image paths using JavaScript during rendering.

### 🔍 Search Bar Auto-fill Issue
Resolved by disabling autocomplete and filtering invalid inputs.

### 🛒 Add to Cart Not Working
Fixed missing product ID by dynamically assigning data attributes from the database.

### 🔗 Related Products Images Broken
Resolved by updating PHP method to include image retrieval.


## 🛠 Tech Stack

- PHP (OOP, PDO)  
- MySQL  
- JavaScript  
- jQuery & AJAX  
- Sammy.js  
- Foundation CSS  


## 🌐 Live Demo
https://jashanpreetsingh.com/projects/easy_groceries/#/home/



## 📊 Project Info

- Type: Full-Stack Web Application  
- Year: 2026  
- Institution: Durham College  
- Database: 1,300+ products  


## 📈 What I Learned

- Building a full-stack application with real database integration  
- Structuring PHP using classes and methods  
- Implementing secure authentication systems  
- Creating single-page applications using AJAX and routing  
- Debugging real-world issues in frontend and backend integration  

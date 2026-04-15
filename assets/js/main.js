//main.js
// routing for EasyMART
let user = {};
let cart = {};
let products = {};
let size = 0;


//   — checks if an object is empty
const isObjEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

//   — counts total quantity across all items in cart
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            let qty = obj[key];
            let quantity = parseInt(qty);
            size = size + quantity;
        }
    }
    return size;
};

// updates cart badge in header
const displayCartValue = () => {
    size = Object.size(cart);
    $("#cartCount").text(size);
    console.log(`Cart items: ${size}`);
};


const setSidebar = (isVisible) => {
    $('body').toggleClass('no-sidebar', !isVisible);
}

const getHome = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-home").show();
    $(window).scrollTop(0);
}

const getSearch = (search) => {
    setSidebar(true);
    $(".hideAll").hide();
    $(".show-department").show();
    $(window).scrollTop(0);

    // Update the department title to show what was searched ( pattern)
    $("#deptCrumb").text("Home > Search");
    $("#deptTitle").html(`You searched for: <em>${search}</em>`);

    let departmentForm = new FormData();
    departmentForm.append('search', search);

    $.ajax({
        type: 'POST',
        url: './services/get_search.php',
        data: departmentForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {},

        success: function (data) {
            if (data.error.error_id != 0) {
                let error_id = data.error.error_id;
                let error_msg = data.error.error_message;
                alert("Something went wrong. ID: " + error_id + ". Message: " + error_msg);
            } else {
                let content = ``;
                if (data.products && data.products.length > 0) {
                    $.each(data.products, function(i, item) {
                        content += getCard(item);
                    });
                } else {
                    content = `<div class="cell"><p class="muted" style="padding:20px;">No products found for "<strong>${search}</strong>". Try a different search term.</p></div>`;
                }
                $(".show-department .products-grid").html(content);
            }
        }
    });
}

const getProduct = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-product").show();
    $(window).scrollTop(0);
}

//  drawCart — renders cart items into .cart-content
const drawCart = () => {
    let content = `<div class="grid-x grid-padding-x">
        <div class="cell large-12"><hr></div>
        <div class="cell large-1 hide-for-small-only">#</div>
        <div class="cell large-2 hide-for-small-only">Image</div>
        <div class="cell large-3 hide-for-small-only">Product</div>
        <div class="cell large-2 hide-for-small-only">Qty</div>
        <div class="cell large-2 hide-for-small-only">Price</div>
        <div class="cell large-1 hide-for-small-only">Total</div>
        <div class="cell large-1 hide-for-small-only"></div>
        <div class="cell large-12"><hr></div>`;

    let subtotal = 0.00;
    let tax = 0.00;

    $.each(products, function(i, item) {
        let taxable = "";
        let quantity = cart[item.eg_product_id];
        let price = Number(item.price).toFixed(2);
        let extended = Number(item.price * quantity).toFixed(2);
        subtotal += Number(extended);

        if (item.taxable == "1") {
            taxable = "H";
            tax += Number(extended) * 0.13;
        }

        let imgSrc = (item.image || '').replace('./images/', 'services/images/');

        content += `<div class="cell large-1">${i + 1}</div>
        <div class="cell large-2">
            <img src="${imgSrc}" alt="${item.product_name}" style="max-width:60px;max-height:60px;object-fit:contain;" onerror="this.style.display='none'">
        </div>
        <div class="cell large-3"><strong>${item.brand}</strong><br><span style="font-size:13px;">${item.product_name}</span></div>
        <div class="cell large-2" style="display:flex;align-items:center;gap:6px;">
            <button class="qty-btn do-minus-cart" data-id="${item.eg_product_id}">−</button>
            <span id="quantity_cart_${item.eg_product_id}" class="qty-value">${quantity}</span>
            <button class="qty-btn do-plus-cart" data-id="${item.eg_product_id}">+</button>
        </div>
        <div class="cell large-2">$${price}<br><small style="color:var(--muted);">Total: $${extended}</small></div>
        <div class="cell large-1">${taxable}</div>
        <div class="cell large-1">
            <button class="btnSmall do-delete-cart" data-id="${item.eg_product_id}" style="background:var(--orange);font-size:11px;padding:5px 8px;">✕ Remove</button>
        </div>
        <div class="cell large-12"><hr></div>`;
    });

    let subtotal2 = subtotal.toFixed(2);
    let tax2 = tax.toFixed(2);
    let total2 = (subtotal + tax).toFixed(2);

    content += `<div class="cell large-8">&nbsp;</div>
    <div class="cell large-2" style="font-weight:600;padding-top:8px;">Subtotal:</div>
    <div class="cell large-2" style="padding-top:8px;">$${subtotal2}</div>
    <div class="cell large-12"><hr></div>
    <div class="cell large-8">&nbsp;</div>
    <div class="cell large-2" style="font-weight:600;padding-top:8px;">Tax (13%):</div>
    <div class="cell large-2" style="padding-top:8px;">$${tax2}</div>
    <div class="cell large-12"><hr></div>
    <div class="cell large-8">&nbsp;</div>
    <div class="cell large-2" style="font-weight:900;font-size:18px;padding-top:8px;">Total:</div>
    <div class="cell large-2" style="font-weight:900;font-size:18px;color:var(--orange);padding-top:8px;">$${total2}</div>
    <div class="cell large-12"><hr></div>
    </div>`;

    $(".cart-content").html(content);
}


//  getCart — sends cart JSON to server, gets product details back
const getCart = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(window).scrollTop(0);

    const cartJSON = JSON.stringify(cart);
    console.log(cartJSON);

    let cartForm = new FormData();
    cartForm.append('cartJSON', cartJSON);

    $.ajax({
        type: 'POST',
        url: './services/get_cart.php',
        data: cartForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function() {},

        success: function(data) {
            if (data.error.error_id == 0) {
                products = data.products;
                drawCart();
            } else {
                alert("Error getting Cart Products");
            }
        }
    });

    $(".show-cart").show();
}

const getRegister = () => {
    setSidebar(false);
    $('#loginModal').foundation('close');
    $(".hideAll").hide();
    $(".show-register").show();
    $(window).scrollTop(0);
}

const getForgot = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-forgot").show();
    $(window).scrollTop(0);
}

const getReset = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-reset").show();
    $(window).scrollTop(0);
}

const getShipping = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-shipping").show();
    $(window).scrollTop(0);
}

const getPayment = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-payment").show();
    $(window).scrollTop(0);
}

const getReview = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-review").show();
    $(window).scrollTop(0);
}

const getComplete = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-complete").show();
    $(window).scrollTop(0);
}

const getLocation = () => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-location").show();
    $(window).scrollTop(0);
}


const validateSignUp = () => {
    let validate = true;
    if (validate) {
        createAccount();
    }
}

const createAccount = () => {
    let name_first = $("#billing_name_first").val();
    let name_last  = $("#billing_name_last").val();
    let email      = $("#email").val();
    let password   = $("#password").val();

    let createAccountForm = new FormData();
    createAccountForm.append('name_first', name_first);
    createAccountForm.append('name_last', name_last);
    createAccountForm.append('email', email);
    createAccountForm.append('password', password);

    $.ajax({
        type: 'POST',
        url: './services/create_account.php',
        data: createAccountForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
            $(`#signup`).attr("disabled", "disabled");
        },

        success: function (data) {
            if (data.error.error_id != 0) {
                let error_id  = data.error.error_id;
                let error_msg = data.error.error_message;
                alert("Something went wrong. ID: " + error_id + ". Message: " + error_msg);
            } else {
                location.href = "#/home/";
                $('#loginModal').foundation('open');
            }
            $(`#signup`).removeAttr("disabled");
        }
    });
}


// TASK 1: login —  exact pattern
const login = () => {
    let email    = $("#loginEmail").val();
    let password = $("#loginPassword").val();

    let loginForm = new FormData();
    loginForm.append('email', email);
    loginForm.append('password', password);

    $.ajax({
        type: 'POST',
        url: './services/login.php',
        data: loginForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
            $(`#login`).attr("disabled", "disabled");
        },

        success: function (data) {
            if (data.error.error_id == 500) {
                //  exact pattern
                $('#loginModal').foundation('close');
                user = data.user;
                console.log(user);
                $("#loginModal").foundation("close");
                // TASK 1: switch login to user name + TASK 2 logout dropdown
                $("#open_login").hide();
                const user_name = `${user.billing_name_first} ${user.billing_name_last}`;
                $("#user_name").show().html(
                    `👤 ${user_name} ▾<div class="userDrop"><span class="userDropItem go_home pointer">Profile</span><span class="userDropItem" id="logoutBtn" style="cursor:pointer;">Logout</span></div>`
                );
            } else {
                alert("Login failed. Please check your email and password.");
            }
            $(`#login`).removeAttr("disabled");
        }
    });
}


// TASK 2: logout —  exact pattern: user = {}
const logout = () => {
    user = {};
    console.log('logged out');
    $("#user_name").hide().html('');
    $("#open_login").show();
}


// TASK 3: getDepartments —  exact AJAX
// Injects <li class="pointer click-department" data-name="..."> into .location-dropdown
const getDepartments = () => {
    $.ajax({
        type: 'POST',
        url: './services/get_departments.php',
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
        },

        success: function (data) {
            if (data.error.error_id == 0) {
                let content = ``;
                $.each(data.departments, function(i, item) {
                    let department_name = item.name;
                    content += `<li class="pointer click-department" data-name="${department_name}">${department_name}</li>`;
                });
                $(".location-dropdown").html(content);
            } else {
                let error_id  = data.error.error_id;
                let error_msg = data.error.error_message;
                alert("Something went wrong. ID: " + error_id + ". Message: " + error_msg);
            }
        }
    });
}




// TASK 4: getCard — MY DESIGN using my wireCard/productCard CSS classes
// TASK 5: only the image (<span class="click-product">) is clickable to navigate to product
//         the add-btn is separate so add-to-cart still works
const getCard = (item) => {
    let price  = item.price;
    let price2 = Number(price).toFixed(2);

    return `<div class="wireCard productCard">
                <span class="click-product pointer" data-name="${item.product_name}" style="display:block;">
                    <div class="imgBox hasImg">
                        <img src="${item.image}" alt="${item.product_name}">
                    </div>
                </span>
                <div class="brand muted">${item.brand}</div>
                <div class="pName">${item.product_name}</div>
                <div class="pDesc muted">${item.product_description || ''}</div>
                <div class="price accent">$${price2}</div>
                <div class="muted" style="font-size:12px;margin-top:4px;">${item.eg_unit_id}</div>
                <div class="actionRow">
                    <button class="btnSmall add-btn" data-id="${item.eg_product_id}">Add to Cart</button>
                    <div class="qty-control" style="display:none;">
                        <button class="qty-btn qty-minus do-minus" data-id="${item.eg_product_id}">−</button>
                        <span id="quantity_${item.eg_product_id}" class="qty-value">1</span>
                        <button class="qty-btn qty-plus do-plus" data-id="${item.eg_product_id}">+</button>
                    </div>
                </div>
            </div>`;
}



// HOME PAGE: Load real products from DB into the "What's New" section
// Uses the same getDepartment AJAX pattern as 
// Loads from "Produce" department — change the department name to whichever you prefer
const getHomeFeatured = () => {
    // Load real products from "Produce" department (exists in DB) for home page
    let departmentForm = new FormData();
    departmentForm.append('department', 'Produce');

    $.ajax({
        type: 'POST',
        url: './services/get_department.php',
        data: departmentForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        success: function (data) {
            if (data.error.error_id == 0 && data.products && data.products.length > 0) {
                let content = ``;
                // Show first 4 real products using the same getCard() design
                $.each(data.products.slice(0, 4), function(i, item) {
                    content += `<div class="cell">${getCard(item)}</div>`;
                });
                $("#homeProductsGrid").html(content);
            } else {
                // No products found - hide the loading placeholder silently
                $("#homeProductsGrid").html('');
            }
        },
        error: function() {
            $("#homeProductsGrid").html('');
        }
    });
}


// TASK 3: getDepartment —  exact AJAX, fills .products-grid with getCard()
const getDepartment = (department) => {
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-department").show();
    $(window).scrollTop(0);

    $("#deptCrumb").text("Home > " + department);
    $("#deptTitle").text(department);

    let departmentForm = new FormData();
    departmentForm.append('department', department);

    $.ajax({
        type: 'POST',
        url: './services/get_department.php',
        data: departmentForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
        },

        success: function (data) {
            if (data.error.error_id != 0) {
                let error_id  = data.error.error_id;
                let error_msg = data.error.error_message;
                alert("Something went wrong. ID: " + error_id + ". Message: " + error_msg);
            } else {
                let content = ``;
                $.each(data.products, function(i, item) {
                    content += getCard(item);
                });
                $(".show-department .products-grid").html(content);
            }
        }
    });
}


// TASK 5: load product data into product page
const loadProductPage = (productName) => {
    let productForm = new FormData();
    productForm.append('product', productName);

    $.ajax({
        type: 'POST',
        url: './services/get_product.php',
        data: productForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        success: function (data) {
            if (data.error.error_id == 0 && data.products && data.products.length > 0) {
                let p = data.products[0];
                $("#prodCrumb").text("Home > " + p.department_name);
                $("#prodBrand").text(p.brand);
                $("#prodName").text(p.product_name);
                $("#prodPrice").text("$" + Number(p.price).toFixed(2));
                $("#prodUnit").text(p.eg_unit_id);
                $("#prodUPC").text(p.upc);
                $("#prodDesc").text(p.product_description || "No description available.");
                if (p.image) { $("#prodImage").attr("src", p.image).attr("alt", p.product_name); }

                // Set data-id on the product page Add to Cart button so cart works
                $(".prodActions .add-btn").attr("data-id", p.eg_product_id);
                // Add qty display next to the button if not already there
                if ($("#prodQtyRow").length === 0) {
                    $(".prodActions").append(`<div id="prodQtyRow" style="display:none;align-items:center;gap:8px;margin-top:8px;"><button class="qty-btn do-minus" data-id="${p.eg_product_id}">−</button><span id="quantity_${p.eg_product_id}" class="qty-value">1</span><button class="qty-btn do-plus" data-id="${p.eg_product_id}">+</button></div>`);
                } else {
                    $("#prodQtyRow .do-minus, #prodQtyRow .do-plus").attr("data-id", p.eg_product_id);
                    $("#prodQtyRow").find(".qty-value").attr("id", "quantity_" + p.eg_product_id);
                }

                if (data.related_products && data.related_products.length > 0) {
                    let related = ``;
                    $.each(data.related_products, function(i, item) { related += `<div class="cell">${getCard(item)}</div>`; });
                    $("#relatedGrid").html(related);
                }
            }
        }
    });
}


$(window).on("load", function () {

    $(document).foundation();

    // TASK 3: load departments on page load
    getDepartments();

    // Load real products into home page "What's New" section from DB
    getHomeFeatured();

    // TASK 3: click on a department name anywhere on page
    $(document).on('click', 'body .click-department', function() {
        const department = $(this).attr("data-name");
        location.href = `#/department/${department}/`;
    });

    // TASK 5: click on product image to go to product page
    $(document).on('click', 'body .click-product', function() {
        const productName = $(this).attr("data-name");
        location.href = `#/product/${encodeURIComponent(productName)}/`;
    });

    // Login modal open
    $(".open_login").click(function (e) {
        e.preventDefault();
        $("#loginModal").foundation("open");
    });

    // Login button inside modal
    $("#login").click(function () {
        login();
    });

    // TASK 2: logout
    $(document).on('click', '#logoutBtn', function (e) {
        e.preventDefault();
        logout();
    });

    // Signup
    $("#signup").click(function () {
        validateSignUp();
    });

    // Navigation —  .go_xxx with trailing slash
    $(".go_home").click(function (e) { e.preventDefault(); location.href = "#/home/"; });
    $(".go_department").click(function (e) {
        e.preventDefault();
        // Use data-dept attribute — must match exact DB department name
        const dept = $(this).data('dept') || 'Produce';
        location.href = `#/department/${dept}/`;
    });
    // .go_search / .searchGo click — use header input value (raw, no encodeURIComponent  )
    $(".go_search, .searchGo").click(function (e) {
        e.preventDefault();
        const search = $("#topSearch").val().trim();
        if (search.length >= 3) {
            location.href = `#/search/${search}`;
        }
    });
    $(".go_product").click(function (e) { e.preventDefault(); location.href = "#/product/"; });
    $(".go_cart").click(function(e) {
        e.preventDefault();
        if (!isObjEmpty(cart)) {
            location.href = "#/cart/";
        } else {
            alert("Your cart is empty. Add some products first!");
        }
    });
    $(".go_register").click(function (e) { e.preventDefault(); location.href = "#/register/"; });
    $(".go_forgot").click(function (e) { e.preventDefault(); location.href = "#/forgot/"; });
    $(".go_reset").click(function (e) { e.preventDefault(); location.href = "#/reset/"; });
    $(document).on('click', 'body .go_shipping', function() {
        location.href = "#/shipping/";
    });
    $(".go_payment").click(function (e) { e.preventDefault(); location.href = "#/payment/"; });
    $(".go_review").click(function (e) { e.preventDefault(); location.href = "#/review/"; });
    $(".go_complete").click(function (e) { e.preventDefault(); location.href = "#/complete/"; });
    $(".go_location").click(function (e) { e.preventDefault(); location.href = "#/location/"; });
    //  exact search pattern — keyup on header input
    $("#topSearch").keyup(function() {
        const search = $(this).val();
        location.href = `#/search/${search}`;
    });

    // Same for search page input box
    $("#searchInput").on("keyup", function () {
        const search = $(this).val().trim();
        if (search.length >= 3) {
            location.href = `#/search/${search}`;
        }
    });

    // Search page "Search" button click
    $(document).on("click", ".searchGoBtn", function () {
        const search = $("#searchInput").val().trim();
        if (search.length >= 3) {
            location.href = `#/search/${search}`;
        }
    });

    //  do-plus: increase qty shown on card
    $(document).on('click', 'body .do-plus', function() {
        const product_id = $(this).attr("data-id");
        const $qty = $("#quantity_" + product_id);
        $qty.text(parseInt($qty.text()) + 1);
    });

    //  do-minus: decrease qty shown on card (minimum 1)
    $(document).on('click', 'body .do-minus', function() {
        const product_id = $(this).attr("data-id");
        const $qty = $("#quantity_" + product_id);
        let q = parseInt($qty.text()) - 1;
        if (q < 1) q = 1;
        $qty.text(q);
    });

    //  do-delete-cart: remove item, go home if cart empty
    $(document).on('click', 'body .do-delete-cart', function() {
        const product_id = $(this).attr("data-id");
        delete cart[product_id];
        displayCartValue();
        if (!isObjEmpty(cart)) {
            getCart();
        } else {
            location.href = "#/home/";
        }
    });

    //  do-plus-cart: increase qty directly on cart page
    $(document).on('click', 'body .do-plus-cart', function() {
        const product_id = $(this).attr("data-id");
        let q = parseInt($("#quantity_cart_" + product_id).text()) + 1;
        $("#quantity_cart_" + product_id).text(q);
        cart[product_id] = q;
        drawCart();
    });

    //  do-minus-cart: decrease qty on cart page (min 1)
    $(document).on('click', 'body .do-minus-cart', function() {
        const product_id = $(this).attr("data-id");
        let q = parseInt($("#quantity_cart_" + product_id).text()) - 1;
        if (q < 1) q = 1;
        $("#quantity_cart_" + product_id).text(q);
        cart[product_id] = q;
        drawCart();
    });

    //  add-btn: save qty to cart{}, update badge, show qty controls
    $(document).on('click', 'body .add-btn', function() {
        const product_id = $(this).attr("data-id");
        if (!product_id) return;
        const quantity = $("#quantity_" + product_id).text() || "1";
        cart[product_id] = quantity;
        displayCartValue();
        // show qty control, hide add button
        $(this).hide();
        $(this).siblings(".qty-control").css("display", "flex");
        console.log("Cart:", cart);
    });


    // SAMMY ROUTING —  exact routes with trailing slash
    if ($.sammy) {
        var app = $.sammy(function () {

            this.get('#/home/', function () { getHome(); });

            this.get('#/department/:department/', function () {
                getDepartment(this.params['department']);
            });

            this.get('#/search/:search', function () {
                let search = this.params['search'];
                // skip if empty, too short, or looks  an email (has @)
                if (search.length >= 2 && !search.includes('@')) {
                    getSearch(search);
                } else if (search.includes('@') || search.length < 2) {
                    getHome();
                    app.setLocation('#/home/');
                }
            });

            // TASK 5: product page loads data via loadProductPage
            this.get('#/product/:productName/', function () {
                const name = decodeURIComponent(this.params['productName']);
                getProduct();
                loadProductPage(name);
            });

            this.get('#/cart/',     function () { getCart(); });
            this.get('#/register/', function () { getRegister(); });
            this.get('#/forgot/',   function () { getForgot(); });
            this.get('#/reset/',    function () { getReset(); });
            this.get('#/shipping/', function () { getShipping(); });
            this.get('#/payment/',  function () { getPayment(); });
            this.get('#/review/',   function () { getReview(); });
            this.get('#/complete/', function () { getComplete(); });
            this.get('#/location/', function () { getLocation(); });

        });

        if (!location.hash) {
            getHome();
            app.run('#/home/');
        } else {
            app.run();
        }
    } else {
        getHome();
    }

});
/* =========================================================
   CHECOFF CART
========================================================= */

const CART_KEY = "merchforge-cart";

let currentCartProducts = [];
let currentCartTotal = 0;


/* =========================================================
   GET CART
========================================================= */

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];

    } catch (error) {

        console.error(
            "Cart tidak dapat dibaca:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(price) || 0);

}


/* =========================================================
   UPDATE CART COUNT
========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById("cart-count");

    if (!cartCount) return;

    const cart = getCart();

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = total;

}


/* =========================================================
   LOAD CART
========================================================= */

async function loadCart() {

    const cartContainer =
        document.getElementById("cart-container");

    if (!cartContainer) return;


    const cart = getCart();


    /* =====================================================
       CART KOSONG
    ===================================================== */

    if (cart.length === 0) {

        currentCartProducts = [];
        currentCartTotal = 0;

        cartContainer.innerHTML = `
            <div class="loading">

                <h2>Keranjang Kosong</h2>

                <p>
                    Belum ada menu yang kamu pilih.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    LIHAT MENU →
                </a>

            </div>
        `;

        updateCartCount();

        return;

    }


    cartContainer.innerHTML = `
        <div class="loading">
            <p>Memuat keranjang...</p>
        </div>
    `;


    try {

        /* =================================================
           AMBIL ID PRODUK
        ================================================= */

        const productIds =
            cart.map(item => Number(item.id));


        /* =================================================
           AMBIL PRODUK DARI SUPABASE
        ================================================= */

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .in("id", productIds);


        if (error) {

            throw error;

        }


        currentCartProducts = data || [];


        /* =================================================
           RENDER CART
        ================================================= */

        renderCart();


    } catch (error) {

        console.error(
            "Gagal mengambil produk cart:",
            error
        );


        cartContainer.innerHTML = `
            <div class="loading">

                <h2>Gagal memuat keranjang</h2>

                <p>
                    ${error.message}
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadCart()"
                >
                    COBA LAGI →
                </button>

            </div>
        `;

    }


    updateCartCount();

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const cartContainer =
        document.getElementById("cart-container");

    if (!cartContainer) return;


    const cart = getCart();


    if (cart.length === 0) {

        currentCartProducts = [];
        currentCartTotal = 0;

        cartContainer.innerHTML = `
            <div class="loading">

                <h2>Keranjang Kosong</h2>

                <p>
                    Belum ada menu yang kamu pilih.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    LIHAT MENU →
                </a>

            </div>
        `;

        updateCartCount();

        return;

    }


    let total = 0;


    let html = `
        <div class="cart-list">
    `;


    cart.forEach(item => {

        const product =
            currentCartProducts.find(
                product =>
                    Number(product.id) ===
                    Number(item.id)
            );


        if (!product) return;


        const quantity =
            Number(item.quantity) || 1;


        const subtotal =
            Number(product.price) * quantity;


        total += subtotal;


        const stock =
            Number(product.stock) || 0;


        html += `
            <div class="cart-item">

                <div class="cart-item-image">

                    ${
                        product.image_url
                        ?
                        `
                        <img
                            src="${product.image_url}"
                            alt="${product.name}"
                        >
                        `
                        :
                        `
                        <div class="no-image">
                            <span>CHECOFF</span>
                        </div>
                        `
                    }

                </div>


                <div class="cart-item-info">

                    <p class="product-category">
                        ${product.category || "MENU"}
                    </p>

                    <h3>
                        ${product.name}
                    </h3>

                    <p class="cart-price">
                        ${formatPrice(product.price)}
                    </p>


                    <p class="cart-stock">

                        Stok:
                        <strong>
                            ${stock}
                        </strong>

                    </p>


                    <div class="cart-actions">

                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="changeQuantity(${product.id}, -1)"
                        >
                            −
                        </button>


                        <span class="quantity">
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="changeQuantity(${product.id}, 1)"
                            ${quantity >= stock ? "disabled" : ""}
                        >
                            +
                        </button>


                        <button
                            type="button"
                            class="remove-btn"
                            onclick="removeFromCart(${product.id})"
                        >
                            Hapus
                        </button>

                    </div>

                </div>


                <div class="cart-item-subtotal">

                    ${formatPrice(subtotal)}

                </div>

            </div>
        `;

    });


    html += `
        </div>


        <div class="cart-summary">

            <div class="cart-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    ${formatPrice(total)}
                </strong>

            </div>


            <button
                type="button"
                class="btn btn-primary"
                onclick="checkout()"
            >
                CHECKOUT →
            </button>

        </div>
    `;


    cartContainer.innerHTML = html;


    currentCartTotal = total;


    updateCartCount();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(productId, change) {

    const cart = getCart();


    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!item) return;


    const product =
        currentCartProducts.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!product) return;


    let newQuantity =
        Number(item.quantity) +
        Number(change);


    /* Minimum 1 */

    if (newQuantity < 1) {

        newQuantity = 1;

    }


    /* Tidak boleh melebihi stok */

    if (newQuantity > Number(product.stock)) {

        alert(
            `Stok ${product.name} hanya tersedia ${product.stock}.`
        );

        return;

    }


    item.quantity = newQuantity;


    saveCart(cart);


    renderCart();


    updateCartCount();

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

    let cart = getCart();


    cart = cart.filter(
        item =>
            Number(item.id) !==
            Number(productId)
    );


    saveCart(cart);


    loadCart();


    updateCartCount();

}


/* =========================================================
   CHECKOUT FORM
========================================================= */

function checkout() {

    const cart = getCart();


    if (cart.length === 0) {

        alert(
            "Keranjang masih kosong."
        );

        return;

    }


    const cartContainer =
        document.getElementById("cart-container");

    if (!cartContainer) return;


    cartContainer.innerHTML = `

        <div class="checkout-container">

            <div class="checkout-header">

                <p class="section-label">
                    CHECOFF CHECKOUT
                </p>

                <h2>
                    COMPLETE YOUR ORDER
                </h2>

                <p>
                    Isi data berikut untuk menyelesaikan pesanan.
                </p>

            </div>


            <form
                id="checkout-form"
                onsubmit="submitOrder(event)"
            >


                <div class="form-group">

                    <label for="customer-name">
                        Nama Lengkap
                    </label>

                    <input
                        type="text"
                        id="customer-name"
                        placeholder="Nama lengkap"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="customer-phone">
                        Nomor WhatsApp
                    </label>

                    <input
                        type="tel"
                        id="customer-phone"
                        placeholder="08xxxxxxxxxx"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="payment-method">
                        Metode Pembayaran
                    </label>

                    <select
                        id="payment-method"
                        required
                    >

                        <option value="">
                            Pilih pembayaran
                        </option>

                        <option value="COD">
                            COD
                        </option>

                        <option value="Transfer">
                            Transfer Bank
                        </option>

                        <option value="QRIS">
                            QRIS
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="order-notes">
                        Catatan
                    </label>

                    <textarea
                        id="order-notes"
                        rows="4"
                        placeholder="Catatan untuk pesanan (opsional)"
                    ></textarea>

                </div>


                <div
                    id="checkout-message"
                    class="checkout-message"
                ></div>


                <div class="checkout-total">

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ${formatPrice(currentCartTotal)}
                    </strong>

                </div>


                <button
                    type="submit"
                    class="btn btn-primary auth-button"
                >
                    PLACE ORDER →
                </button>


                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="loadCart()"
                >
                    ← KEMBALI KE CART
                </button>


            </form>

        </div>

    `;

}


/* =========================================================
   SUBMIT ORDER
========================================================= */

async function submitOrder(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "checkout-message"
        );


    const customerName =
        document.getElementById(
            "customer-name"
        ).value.trim();


    const phone =
        document.getElementById(
            "customer-phone"
        ).value.trim();


    const notes =
        document.getElementById(
            "order-notes"
        ).value.trim();


    const paymentMethod =
        document.getElementById(
            "payment-method"
        ).value;


    const cart = getCart();


    if (cart.length === 0) {

        message.textContent =
            "Keranjang masih kosong.";

        return;

    }


    /* =====================================================
       VALIDASI FORM
    ===================================================== */

    if (!customerName) {

        message.textContent =
            "Nama wajib diisi.";

        return;

    }


    if (!phone) {

        message.textContent =
            "Nomor WhatsApp wajib diisi.";

        return;

    }


    if (!paymentMethod) {

        message.textContent =
            "Pilih metode pembayaran.";

        return;

    }


    message.textContent =
        "Memproses pesanan dan mengecek stok...";


    try {

        /* =================================================
           KIRIM CART KE POSTGRES FUNCTION

           Database akan:
           1. Cek produk
           2. Cek stok
           3. Hitung total
           4. Buat order
           5. Buat order_items
           6. Kurangi stok
        ================================================= */

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "create_checoff_order",
            {
                p_customer_name:
                    customerName,

                p_phone:
                    phone,

                p_notes:
                    `${notes}${notes ? " | " : ""}Pembayaran: ${paymentMethod}`,

                p_items:
                    cart.map(item => ({
                        id: Number(item.id),
                        quantity: Number(item.quantity)
                    }))
            }
        );


        /* =================================================
           ERROR DARI DATABASE
        ================================================= */

        if (error) {

            throw error;

        }


        if (!data || data.length === 0) {

            throw new Error(
                "Pesanan tidak berhasil dibuat."
            );

        }


        const order =
            data[0];


        console.log(
            "ORDER BERHASIL:",
            order
        );


        /* =================================================
           HAPUS CART
        ================================================= */

        localStorage.removeItem(
            CART_KEY
        );


        currentCartProducts = [];
        currentCartTotal = 0;


        updateCartCount();


        /* =================================================
           TAMPILKAN SUKSES
        ================================================= */

        const cartContainer =
            document.getElementById(
                "cart-container"
            );


        cartContainer.innerHTML = `

            <div class="loading">

                <p class="section-label">
                    ORDER SUCCESS
                </p>


                <h2>
                    PESANAN BERHASIL! ☕
                </h2>


                <p>
                    Terima kasih, ${customerName}.
                </p>


                <p>
                    Nomor pesanan kamu:
                </p>


                <h3>
                    ${order.order_number}
                </h3>


                <p>
                    Total:
                    <strong>
                        ${formatPrice(order.total)}
                    </strong>
                </p>


                <p>
                    Status:
                    <strong>
                        PENDING
                    </strong>
                </p>


                <div style="margin-top: 30px;">

                    <a
                        href="products.html"
                        class="btn btn-primary"
                    >
                        KEMBALI KE MENU →
                    </a>

                    <a
                        href="index.html"
                        class="btn btn-secondary"
                    >
                        HOME
                    </a>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "CHECKOUT ERROR:",
            error
        );


        message.textContent =
            error.message ||
            "Pesanan gagal dibuat.";


        /*
           Penting:
           Cart TIDAK dihapus kalau order gagal.
           User masih bisa memperbaiki cart.
        */

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        loadCart();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadCart =
    loadCart;

window.renderCart =
    renderCart;

window.changeQuantity =
    changeQuantity;

window.removeFromCart =
    removeFromCart;

window.checkout =
    checkout;

window.submitOrder =
    submitOrder;

window.updateCartCount =
    updateCartCount;
const CART_KEY = "merchforge-cart";
const cartContainer = document.getElementById("cart-container");

let currentCartProducts = [];
let currentCartTotal = 0;

// ===============================
// FORMAT RUPIAH
// ===============================
function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(price) || 0);
}


// ===============================
// LOAD CART
// ===============================
async function loadCart() {

    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    console.log("CART:", cart);

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="loading">
                <h2>Cart kamu masih kosong 🛒</h2>
                <p>Yuk pilih menu terlebih dahulu.</p>

                <br>

                <a href="products.html" class="btn btn-primary">
                    LIHAT MENU →
                </a>
            </div>
        `;

        updateCartCount();
        return;
    }

    const ids = cart.map(item => Number(item.id));

    console.log("ID PRODUK DI CART:", ids);

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .in("id", ids);

    if (error) {

        console.error("Gagal mengambil data cart:", error);

        cartContainer.innerHTML = `
            <div class="loading">
                <h2>Gagal mengambil data menu</h2>
                <p>Silakan refresh halaman.</p>
            </div>
        `;

        return;
    }

    console.log("DATA PRODUK SUPABASE:", data);

    if (!data || data.length === 0) {

        cartContainer.innerHTML = `
            <div class="loading">
                <h2>Produk tidak ditemukan</h2>
                <p>Data produk di cart tidak tersedia.</p>
            </div>
        `;

        return;
    }

    currentCartProducts = data;

    let total = 0;

    let cartHTML = `
        <div class="cart-list">
    `;

    data.forEach(product => {

        const cartItem = cart.find(
            item => Number(item.id) === Number(product.id)
        );

        if (!cartItem) return;

        const quantity = Number(cartItem.quantity) || 1;

        const subtotal =
            Number(product.price) * quantity;

        total += subtotal;

        cartHTML += `
            <article class="cart-item">

                <div class="cart-item-image">

                    ${
                        product.image_url
                        ? `<img src="${product.image_url}" alt="${product.name}">`
                        : `<span>CHECOFF</span>`
                    }

                </div>


                <div class="cart-item-info">

                    <p class="product-category">
                        ${product.category}
                    </p>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${formatPrice(product.price)}
                    </p>

                </div>


                <div class="cart-quantity">

                    <button
                        type="button"
                        onclick="changeQuantity(${product.id}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        onclick="changeQuantity(${product.id}, 1)"
                    >
                        +
                    </button>

                </div>


                <div class="cart-subtotal">

                    <strong>
                        ${formatPrice(subtotal)}
                    </strong>

                </div>


                <button
                    type="button"
                    class="cart-remove"
                    onclick="removeFromCart(${product.id})"
                >
                    REMOVE
                </button>

            </article>
        `;
    });


    cartHTML += `
        </div>

        <div class="cart-summary">

            <div>

                <span>
                    Total Pesanan
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

    cartContainer.innerHTML = cartHTML;

    currentCartTotal = total;

    updateCartCount();
}


// ===============================
// CHANGE QUANTITY
// ===============================
function changeQuantity(productId, change) {

    let cart =
        JSON.parse(localStorage.getItem(CART_KEY)) || [];

    const item = cart.find(
        item => Number(item.id) === Number(productId)
    );

    if (!item) return;

    item.quantity =
        Number(item.quantity) + Number(change);

    if (item.quantity <= 0) {

        cart = cart.filter(
            item =>
                Number(item.id) !== Number(productId)
        );
    }

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    loadCart();
}


// ===============================
// REMOVE PRODUCT
// ===============================
function removeFromCart(productId) {

    let cart =
        JSON.parse(localStorage.getItem(CART_KEY)) || [];

    cart = cart.filter(
        item =>
            Number(item.id) !== Number(productId)
    );

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    loadCart();

    updateCartCount();
}


// ===============================
// CART COUNT
// ===============================
function updateCartCount() {

    const cartCount =
        document.getElementById("cart-count");

    if (!cartCount) return;

    const cart =
        JSON.parse(localStorage.getItem(CART_KEY)) || [];

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = total;

    console.log("TOTAL CART:", total);
}


// ===============================
// CHECKOUT FORM
// ===============================
function checkout() {

    const cart =
        JSON.parse(localStorage.getItem(CART_KEY)) || [];

    if (cart.length === 0) {

        alert("Cart masih kosong.");

        return;
    }

    const checkoutHTML = `

        <div class="checkout-box">

            <div class="checkout-header">

                <h2>
                    CHECKOUT
                </h2>

                <p>
                    Lengkapi data pesanan kamu
                </p>

            </div>


            <form
                id="checkout-form"
                onsubmit="submitOrder(event)"
            >

                <div class="form-group">

                    <label for="customer-name">
                        Nama
                    </label>

                    <input
                        type="text"
                        id="customer-name"
                        placeholder="Masukkan nama kamu"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="customer-phone">
                        No. WhatsApp
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

                        <option value="cash">
                            Cash
                        </option>

                        <option value="qris">
                            QRIS
                        </option>

                        <option value="transfer">
                            Transfer Bank
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="order-notes">
                        Catatan Pesanan
                    </label>

                    <textarea
                        id="order-notes"
                        rows="4"
                        placeholder="Contoh: less sugar, tanpa es, dll."
                    ></textarea>

                </div>


                <div class="checkout-total">

                    <span>
                        Total Pesanan
                    </span>

                    <strong>
                        ${formatPrice(currentCartTotal)}
                    </strong>

                </div>


                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    PESAN SEKARANG →
                </button>


                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="loadCart()"
                >
                    KEMBALI
                </button>

            </form>

        </div>

    `;

    cartContainer.innerHTML = checkoutHTML;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// SUBMIT ORDER
// ===============================
async function submitOrder(event) {

    event.preventDefault();

    const submitButton =
        event.target.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    submitButton.textContent =
        "MEMPROSES PESANAN...";


    try {

        const customerName =
            document
                .getElementById("customer-name")
                .value
                .trim();


        const phone =
            document
                .getElementById("customer-phone")
                .value
                .trim();


        const paymentMethod =
            document
                .getElementById("payment-method")
                .value;


        const notes =
            document
                .getElementById("order-notes")
                .value
                .trim();


        if (!customerName || !phone || !paymentMethod) {

            alert(
                "Nama, nomor WhatsApp, dan metode pembayaran wajib diisi."
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "PESAN SEKARANG →";

            return;
        }


        const cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            ) || [];


        if (cart.length === 0) {

            alert("Cart kamu kosong.");

            loadCart();

            return;
        }


        // ===============================
        // BUAT NOMOR PESANAN
        // ===============================

        const orderNumber =
            "CHE-" +
            Date.now().toString().slice(-8);


        // ===============================
        // SIMPAN ORDER
        // ===============================

        const {
            data: order,
            error: orderError
        } = await supabaseClient
            .from("orders")
            .insert([
                {
                    order_number: orderNumber,
                    customer_name: customerName,
                    phone: phone,
                    notes: notes,
                    total: currentCartTotal,
                    status: "pending"
                }
            ])
            .select()
            .single();


        if (orderError) {

            throw orderError;
        }


        console.log(
            "ORDER BERHASIL:",
            order
        );


        // ===============================
        // SIAPKAN ORDER ITEMS
        // ===============================

        const orderItems =
            currentCartProducts.map(product => {

                const cartItem =
                    cart.find(
                        item =>
                            Number(item.id) ===
                            Number(product.id)
                    );


                const quantity =
                    Number(cartItem?.quantity) || 1;


                const price =
                    Number(product.price) || 0;


                return {

                    order_id: order.id,

                    product_id: product.id,

                    product_name: product.name,

                    price: price,

                    quantity: quantity,

                    subtotal: price * quantity

                };

            });


        console.log(
            "ORDER ITEMS:",
            orderItems
        );


        // ===============================
        // SIMPAN ORDER ITEMS
        // ===============================

        const {
            error: itemsError
        } = await supabaseClient
            .from("order_items")
            .insert(orderItems);


        if (itemsError) {

            throw itemsError;
        }


        // ===============================
        // HAPUS CART
        // ===============================

        localStorage.removeItem(CART_KEY);


        updateCartCount();


        // ===============================
        // SUCCESS
        // ===============================

        cartContainer.innerHTML = `

            <div class="loading">

                <h2>
                    PESANAN BERHASIL! ☕
                </h2>

                <p>
                    Terima kasih, ${customerName}.
                </p>

                <br>

                <p>
                    Nomor pesanan kamu:
                </p>

                <h2>
                    ${orderNumber}
                </h2>

                <br>

                <p>
                    Total:
                    <strong>
                        ${formatPrice(currentCartTotal)}
                    </strong>
                </p>

                <br>

                <p>
                    Silakan lanjutkan pembayaran
                    sesuai metode yang dipilih.
                </p>

                <br>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    KEMBALI KE MENU →
                </a>

            </div>

        `;

    } catch (error) {

        console.error(
            "GAGAL MEMBUAT PESANAN:",
            error
        );


        alert(
            "Pesanan gagal disimpan. Cek Console untuk detail error."
        );


        submitButton.disabled = false;

        submitButton.textContent =
            "PESAN SEKARANG →";
    }
}


// ===============================
// INIT
// ===============================
document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCart();

        updateCartCount();

    }
);


// ===============================
// GLOBAL FUNCTION
// ===============================
window.changeQuantity = changeQuantity;

window.removeFromCart = removeFromCart;

window.updateCartCount = updateCartCount;

window.checkout = checkout;

window.submitOrder = submitOrder;
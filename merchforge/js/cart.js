/* =========================================================
   ARDANA BATIK - CART & CHECKOUT
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


    const cart =
        getCart();


    const total =
        cart.reduce(
            (sum, item) =>
                sum + Number(
                    item.quantity || 0
                ),
            0
        );


    cartCount.textContent =
        total;

}


/* =========================================================
   LOAD CART
========================================================= */

async function loadCart() {

    const cartContainer =
        document.getElementById(
            "cart-container"
        );


    if (!cartContainer) return;


    const cart =
        getCart();


    /* =====================================================
       CART KOSONG
    ===================================================== */

    if (cart.length === 0) {

        currentCartProducts = [];

        currentCartTotal = 0;


        cartContainer.innerHTML = `

            <div class="loading">

                <h2>
                    KERANJANG KOSONG
                </h2>

                <p>
                    Belum ada koleksi yang kamu pilih.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    EXPLORE COLLECTION →
                </a>

            </div>

        `;


        updateCartCount();

        return;

    }


    cartContainer.innerHTML = `

        <div class="loading">

            <p>
                Memuat keranjang...
            </p>

        </div>

    `;


    try {

        /* =================================================
           AMBIL ID PRODUK
        ================================================= */

        const productIds =
            cart
                .map(
                    item =>
                        Number(item.id)
                )
                .filter(
                    id =>
                        Number.isInteger(id) &&
                        id > 0
                );


        if (productIds.length === 0) {

            throw new Error(
                "Data keranjang tidak valid."
            );

        }


        /* =================================================
           AMBIL PRODUK DARI SUPABASE
        ================================================= */

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .in(
                "id",
                productIds
            );


        if (error) {

            throw error;

        }


        currentCartProducts =
            data || [];


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

                <h2>
                    GAGAL MEMUAT KERANJANG
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
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
        document.getElementById(
            "cart-container"
        );


    if (!cartContainer) return;


    let cart =
        getCart();


    if (cart.length === 0) {

        currentCartProducts = [];

        currentCartTotal = 0;


        cartContainer.innerHTML = `

            <div class="loading">

                <h2>
                    KERANJANG KOSONG
                </h2>

                <p>
                    Belum ada koleksi yang kamu pilih.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    EXPLORE COLLECTION →
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


    cart.forEach(
        item => {

            const product =
                currentCartProducts.find(
                    product =>
                        Number(product.id) ===
                        Number(item.id)
                );


            /*
               Produk sudah tidak tersedia
               di database.
            */

            if (!product) {

                return;

            }


            const stock =
                Number(product.stock) || 0;


            let quantity =
                Number(item.quantity) || 1;


            /*
               Quantity tidak boleh lebih
               dari stock.
            */

            if (stock <= 0) {

                quantity = 0;

            } else if (quantity > stock) {

                quantity = stock;

            } else if (quantity < 1) {

                quantity = 1;

            }


            item.quantity =
                quantity;


            /*
               Produk stock 0 tidak dihitung
               sebagai total.
            */

            const subtotal =
                Number(product.price) *
                quantity;


            total += subtotal;


            html += `

                <div class="cart-item">

                    <!-- IMAGE -->

                    <div class="cart-item-image">

                        ${
                            product.image_url

                            ?

                            `
                            <img
                                src="${escapeHTML(
                                    product.image_url
                                )}"
                                alt="${escapeHTML(
                                    product.name
                                )}"
                                loading="lazy"
                            >
                            `

                            :

                            `
                            <div class="no-image">

                                <span>
                                    ARDANA BATIK
                                </span>

                            </div>
                            `

                        }

                    </div>


                    <!-- INFO -->

                    <div class="cart-item-info">

                        <p class="product-category">

                            ${escapeHTML(
                                product.category ||
                                "BATIK COLLECTION"
                            )}

                        </p>


                        <h3>

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <p class="cart-price">

                            ${formatPrice(
                                product.price
                            )}

                        </p>


                        <p class="cart-stock">

                            Stock:

                            <strong>
                                ${stock}
                            </strong>

                        </p>


                        ${
                            stock > 0

                            ?

                            `

                            <div class="cart-actions">

                                <button
                                    type="button"
                                    class="quantity-btn"
                                    onclick="
                                        changeQuantity(
                                            ${product.id},
                                            -1
                                        )
                                    "
                                    aria-label="Kurangi jumlah"
                                >
                                    −
                                </button>


                                <span class="quantity">

                                    ${quantity}

                                </span>


                                <button
                                    type="button"
                                    class="quantity-btn"
                                    onclick="
                                        changeQuantity(
                                            ${product.id},
                                            1
                                        )
                                    "
                                    ${
                                        quantity >= stock
                                        ? "disabled"
                                        : ""
                                    }
                                    aria-label="Tambah jumlah"
                                >
                                    +
                                </button>


                                <button
                                    type="button"
                                    class="remove-btn"
                                    onclick="
                                        removeFromCart(
                                            ${product.id}
                                        )
                                    "
                                >
                                    Hapus
                                </button>

                            </div>

                            `

                            :

                            `

                            <p class="cart-stock">

                                <strong>
                                    SOLD OUT
                                </strong>

                            </p>

                            `

                        }

                    </div>


                    <!-- SUBTOTAL -->

                    <div class="cart-item-subtotal">

                        ${formatPrice(
                            subtotal
                        )}

                    </div>

                </div>

            `;

        }
    );


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


            ${
                total > 0

                ?

                `
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="checkout()"
                >
                    CHECKOUT →
                </button>
                `

                :

                ""
            }

        </div>

    `;


    cartContainer.innerHTML =
        html;


    currentCartTotal =
        total;


    saveCart(cart);


    updateCartCount();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const cart =
        getCart();


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


    const stock =
        Number(product.stock) || 0;


    if (stock <= 0) {

        alert(
            `${product.name} sedang habis.`
        );

        return;

    }


    let newQuantity =
        Number(item.quantity || 1) +
        Number(change);


    /* =====================================================
       MINIMUM 1
    ===================================================== */

    if (newQuantity < 1) {

        newQuantity = 1;

    }


    /* =====================================================
       MAKSIMUM STOCK
    ===================================================== */

    if (newQuantity > stock) {

        alert(
            `Stock ${product.name} hanya tersedia ${stock}.`
        );

        return;

    }


    item.quantity =
        newQuantity;


    saveCart(cart);


    renderCart();

    updateCartCount();

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

    let cart =
        getCart();


    cart =
        cart.filter(
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

async function checkout() {

    /* =====================================================
       CEK LOGIN
    ===================================================== */

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            throw error;

        }


        if (!data.user) {

            alert(
                "Silakan login terlebih dahulu."
            );


            window.location.href =
                "auth/login.html";


            return;

        }

    } catch (error) {

        console.error(
            "AUTH CHECK ERROR:",
            error
        );


        alert(
            "Silakan login terlebih dahulu."
        );


        window.location.href =
            "auth/login.html";


        return;

    }


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Keranjang masih kosong."
        );

        return;

    }


    const cartContainer =
        document.getElementById(
            "cart-container"
        );


    if (!cartContainer) return;


    /*
       Pastikan total sudah tersedia.
    */

    if (
        currentCartTotal <= 0
    ) {

        alert(
            "Tidak ada produk yang dapat dibeli."
        );

        return;

    }


    cartContainer.innerHTML = `

        <div class="checkout-container">

            <div class="checkout-header">

                <p class="section-label">

                    ARDANA BATIK CHECKOUT

                </p>


                <h2>

                    COMPLETE YOUR ORDER

                </h2>


                <p>

                    Lengkapi data berikut
                    untuk menyelesaikan pesanan.

                </p>

            </div>


            <form
                id="checkout-form"
                onsubmit="submitOrder(event)"
            >

                <!-- NAMA -->

                <div class="form-group">

                    <label for="customer-name">

                        Nama Lengkap

                    </label>


                    <input
                        type="text"
                        id="customer-name"
                        placeholder="Nama lengkap"
                        maxlength="100"
                        required
                    >

                </div>


                <!-- WHATSAPP -->

                <div class="form-group">

                    <label for="customer-phone">

                        Nomor WhatsApp

                    </label>


                    <input
                        type="tel"
                        id="customer-phone"
                        placeholder="08xxxxxxxxxx"
                        maxlength="20"
                        required
                    >

                </div>


                <!-- PAYMENT -->

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


                <!-- NOTES -->

                <div class="form-group">

                    <label for="order-notes">

                        Catatan

                    </label>


                    <textarea
                        id="order-notes"
                        rows="4"
                        maxlength="500"
                        placeholder="Catatan untuk pesanan (opsional)"
                    ></textarea>

                </div>


                <!-- MESSAGE -->

                <div
                    id="checkout-message"
                    class="checkout-message"
                ></div>


                <!-- TOTAL -->

                <div class="checkout-total">

                    <span>
                        TOTAL
                    </span>


                    <strong>

                        ${formatPrice(
                            currentCartTotal
                        )}

                    </strong>

                </div>


                <!-- SUBMIT -->

                <button
                    type="submit"
                    class="btn btn-primary auth-button"
                    id="place-order-button"
                >

                    PLACE ORDER →

                </button>


                <!-- BACK -->

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


    const submitButton =
        document.getElementById(
            "place-order-button"
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


    const cart =
        getCart();


    /* =====================================================
       VALIDASI ELEMENT
    ===================================================== */

    if (!message) {

        console.error(
            "Element #checkout-message tidak ditemukan."
        );

        return;

    }


    /* =====================================================
       VALIDASI CART
    ===================================================== */

    if (cart.length === 0) {

        message.textContent =
            "Keranjang masih kosong.";

        return;

    }


    /* =====================================================
       VALIDASI NAMA
    ===================================================== */

    if (!customerName) {

        message.textContent =
            "Nama wajib diisi.";

        return;

    }


    if (customerName.length < 2) {

        message.textContent =
            "Nama minimal 2 karakter.";

        return;

    }


    /* =====================================================
       VALIDASI PHONE
    ===================================================== */

    if (!phone) {

        message.textContent =
            "Nomor WhatsApp wajib diisi.";

        return;

    }


    /*
       Validasi nomor sederhana.
    */

    const phonePattern =
        /^[0-9+\-\s()]{8,20}$/;


    if (!phonePattern.test(phone)) {

        message.textContent =
            "Format nomor WhatsApp tidak valid.";

        return;

    }


    /* =====================================================
       VALIDASI PAYMENT
    ===================================================== */

    if (!paymentMethod) {

        message.textContent =
            "Pilih metode pembayaran.";

        return;

    }


    /* =====================================================
       CEK LOGIN
    ===================================================== */

    let user;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            throw error;

        }


        user =
            data.user;


        if (!user) {

            message.textContent =
                "Sesi login sudah berakhir. Silakan login kembali.";


            setTimeout(
                function () {

                    window.location.href =
                        "auth/login.html";

                },
                1000
            );


            return;

        }

    } catch (error) {

        console.error(
            "USER CHECK ERROR:",
            error
        );


        message.textContent =
            "Sesi login tidak valid.";

        return;

    }


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.textContent =
            "PROCESSING...";

    }


    message.textContent =
        "Memproses pesanan dan mengecek stock...";


    try {

        /* =================================================
           BUAT DATA ITEM
           
           FORMAT YANG SESUAI DENGAN RPC BARU:
           
           {
               product_id: 1,
               quantity: 2
           }
        ================================================= */

        const orderItems =
            cart
                .map(
                    item => ({

                        product_id:
                            Number(
                                item.id
                            ),

                        quantity:
                            Number(
                                item.quantity
                            )

                    })
                )
                .filter(
                    item =>
                        Number.isInteger(
                            item.product_id
                        ) &&
                        item.product_id > 0 &&
                        Number.isInteger(
                            item.quantity
                        ) &&
                        item.quantity > 0
                );


        if (
            orderItems.length === 0
        ) {

            throw new Error(
                "Produk di keranjang tidak valid."
            );

        }


        /* =================================================
           RPC CHECKOUT ARDANA BATIK
        ================================================= */

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "create_ardana_order",
                {

                    p_customer_name:
                        customerName,

                    p_phone:
                        phone,

                    p_notes:
                        `${notes}${notes ? " | " : ""}Pembayaran: ${paymentMethod}`,

                    p_items:
                        orderItems

                }
            );


        /* =================================================
           CEK ERROR RPC
        ================================================= */

        if (error) {

            throw error;

        }


        /*
           create_ardana_order()
           mengembalikan JSON object:

           {
               success: true,
               order_id: ...,
               order_number: ...,
               total: ...
           }
        */

        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                "Pesanan tidak berhasil dibuat."
            );

        }


        const order =
            data;


        console.log(
            "ORDER ARDANA BATIK BERHASIL:",
            order
        );


        /* =================================================
           HAPUS CART
        ================================================= */

        localStorage.removeItem(
            CART_KEY
        );


        currentCartProducts =
            [];


        currentCartTotal =
            0;


        updateCartCount();


        /* =================================================
           TAMPILKAN SUCCESS
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

                    PESANAN BERHASIL!

                </h2>


                <p>

                    Terima kasih,
                    ${escapeHTML(
                        customerName
                    )}.

                </p>


                <p>

                    Nomor pesanan kamu:

                </p>


                <h3>

                    ${escapeHTML(
                        order.order_number
                    )}

                </h3>


                <p>

                    Total:

                    <strong>

                        ${formatPrice(
                            order.total
                        )}

                    </strong>

                </p>


                <p>

                    Status:

                    <strong>

                        PENDING

                    </strong>

                </p>


                <div
                    style="
                        margin-top:30px;
                        display:flex;
                        gap:12px;
                        flex-wrap:wrap;
                    "
                >

                    <a
                        href="orders.html"
                        class="btn btn-primary"
                    >

                        LIHAT PESANAN →

                    </a>


                    <a
                        href="products.html"
                        class="btn btn-secondary"
                    >

                        KEMBALI KE COLLECTION

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


        /* =================================================
           ENABLE BUTTON LAGI
        ================================================= */

        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.textContent =
                "PLACE ORDER →";

        }

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

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
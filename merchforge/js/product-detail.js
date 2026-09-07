/* =========================================================
   PRODUCT DETAIL - CHECOFF
   ========================================================= */

const CART_KEY = "merchforge-cart";

const productDetail =
    document.getElementById("product-detail");


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(price) || 0);

}


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
   LOAD PRODUCT DETAIL
   ========================================================= */

async function loadProductDetail() {

    if (!productDetail) {

        console.error(
            "Element #product-detail tidak ditemukan."
        );

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    /* =====================================================
       ID PRODUK TIDAK ADA
    ===================================================== */

    if (!productId) {

        productDetail.innerHTML = `

            <div class="loading">

                <h2>
                    Menu tidak ditemukan
                </h2>

                <p>
                    Produk yang kamu cari tidak tersedia.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    KEMBALI KE MENU →
                </a>

            </div>

        `;

        return;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    productDetail.innerHTML = `

        <div class="loading">

            <p>
                Memuat detail menu...
            </p>

        </div>

    `;


    try {

        /* =================================================
           AMBIL PRODUK DARI SUPABASE
        ================================================= */

        const {
            data,
            error
        } = await supabaseClient

            .from("products")

            .select("*")

            .eq("id", productId)

            .single();


        if (error) {

            throw error;

        }


        /* =================================================
           PRODUK TIDAK DITEMUKAN
        ================================================= */

        if (!data) {

            throw new Error(
                "Produk tidak ditemukan."
            );

        }


        console.log(
            "DETAIL PRODUK:",
            data
        );


        /* =================================================
           PRICE
        ================================================= */

        const price =
            formatPrice(data.price);


        /* =================================================
           IMAGE
        ================================================= */

        const imageHTML =
            data.image_url

            ? `

                <img
                    src="${data.image_url}"
                    alt="${data.name}"
                    loading="lazy"
                >

            `

            : `

                <div class="no-image">

                    <span>
                        CHECOFF
                    </span>

                </div>

            `;


        /* =================================================
           STOCK
        ================================================= */

        const stock =
            Number(data.stock) || 0;


        let stockStatus = "";


        if (stock <= 0) {

            stockStatus = `

                <p class="detail-stock out-stock">

                    <strong>
                        STOK HABIS
                    </strong>

                </p>

            `;

        }

        else if (stock <= 5) {

            stockStatus = `

                <p class="detail-stock low-stock">

                    Tersisa
                    <strong>
                        ${stock}
                    </strong>
                    menu

                </p>

            `;

        }

        else {

            stockStatus = `

                <p class="detail-stock">

                    Tersedia
                    <strong>
                        ${stock}
                    </strong>
                    menu

                </p>

            `;

        }


        /* =================================================
           BUTTON
        ================================================= */

        let cartButton = "";


        if (stock > 0) {

            cartButton = `

                <button
                    type="button"
                    class="btn btn-primary add-cart-button"
                    onclick="addToCart(${Number(data.id)})"
                >

                    ADD TO CART →

                </button>

            `;

        }

        else {

            cartButton = `

                <button
                    type="button"
                    class="btn btn-primary"
                    disabled
                >

                    STOK HABIS

                </button>

            `;

        }


        /* =================================================
           DESCRIPTION
        ================================================= */

        const description =
            data.description ||
            "Menu spesial Checoff yang dibuat dengan bahan pilihan.";


        /* =================================================
           RENDER DETAIL
        ================================================= */

        productDetail.innerHTML = `

            <!-- =========================
                 PRODUCT IMAGE
            ========================== -->

            <div class="detail-image">

                ${imageHTML}

            </div>


            <!-- =========================
                 PRODUCT CONTENT
            ========================== -->

            <div class="detail-content">


                <p class="product-category">

                    ${data.category || "MENU"}

                </p>


                <h1>

                    ${data.name}

                </h1>


                <p class="detail-price">

                    ${price}

                </p>


                <div class="detail-divider"></div>


                <p class="detail-description">

                    ${description}

                </p>


                ${stockStatus}


                ${cartButton}


                <a
                    href="products.html"
                    class="detail-menu-link"
                >

                    ← Lihat Menu Lainnya

                </a>


            </div>

        `;

    }


    /* =====================================================
       ERROR
    ===================================================== */

    catch (error) {

        console.error(
            "Gagal mengambil detail produk:",
            error
        );


        productDetail.innerHTML = `

            <div class="loading">

                <h2>
                    Gagal memuat menu
                </h2>

                <p>
                    Terjadi masalah saat mengambil
                    data dari Supabase.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    KEMBALI KE MENU →
                </a>

            </div>

        `;

    }

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(productId) {

    productId =
        Number(productId);


    if (!productId) {

        console.error(
            "ID produk tidak valid:",
            productId
        );

        return;

    }


    let cart =
        getCart();


    /* =====================================================
       CEK PRODUK SUDAH ADA DI CART
    ===================================================== */

    const existingProduct =
        cart.find(
            item =>
                Number(item.id) ===
                productId
        );


    /* =====================================================
       JIKA SUDAH ADA
    ===================================================== */

    if (existingProduct) {

        existingProduct.quantity =
            Number(
                existingProduct.quantity
            ) + 1;

    }


    /* =====================================================
       JIKA BELUM ADA
    ===================================================== */

    else {

        cart.push({

            id: productId,

            quantity: 1

        });

    }


    /* =====================================================
       SAVE
    ===================================================== */

    saveCart(cart);


    /* =====================================================
       UPDATE CART COUNT
    ===================================================== */

    updateCartCount();


    /* =====================================================
       LOG
    ===================================================== */

    console.log(
        "CART SETELAH ADD:",
        cart
    );


    /* =====================================================
       SUCCESS
    ===================================================== */

    alert(
        "☕ Menu berhasil ditambahkan ke cart!"
    );

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    const cart =
        getCart();


    const total =
        cart.reduce(

            (sum, item) => {

                return (
                    sum +
                    Number(
                        item.quantity || 0
                    )
                );

            },

            0

        );


    cartCount.textContent =
        total;


    console.log(
        "JUMLAH CART:",
        total
    );

}


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProductDetail();

        updateCartCount();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.addToCart =
    addToCart;

window.updateCartCount =
    updateCartCount;
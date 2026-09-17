/* =========================
   PRODUCTS - ARDANA BATIK
========================= */

let allProducts = [];

let currentCategory = "all";

let currentSearch = "";


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const productList =
        document.getElementById("product-list");


    if (!productList) {

        console.error(
            "Element #product-list tidak ditemukan."
        );

        return;
    }


    productList.innerHTML = `
        <div class="loading">
            Loading collection...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        console.log(
            "Semua produk ARDANA BATIK dari Supabase:",
            data
        );


        allProducts = data || [];


        /* =========================
           CEK URL CATEGORY
        ========================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        currentCategory =
            params.get("category")
            || "all";


        renderProducts();


    } catch (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );


        productList.innerHTML = `
            <div class="loading">

                <h2>
                    Gagal memuat koleksi
                </h2>

                <p>
                    Silakan cek koneksi Supabase.
                </p>

            </div>
        `;

    }

}


/* =========================
   FILTER PRODUCTS
========================= */

function filterProducts(category) {

    console.log(
        "Kategori dipilih:",
        category
    );


    currentCategory =
        category || "all";


    renderProducts();

}


/* =========================
   SEARCH PRODUCTS
========================= */

function searchProducts(keyword) {

    currentSearch =
        keyword
            .trim()
            .toLowerCase();


    console.log(
        "Search collection:",
        currentSearch
    );


    renderProducts();

}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(price) || 0
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   VALIDATE IMAGE URL
========================= */

function isValidProductImage(imageUrl) {

    if (!imageUrl) {

        return false;

    }


    const url =
        String(imageUrl)
            .trim()
            .toLowerCase();


    /*
     * Jangan gunakan logo sebagai
     * gambar produk.
     */

    if (
        url.includes("logo_ardana")
        ||
        url.includes("logo-ardana")
        ||
        url.includes("ardana-logo")
        ||
        url.includes("checoff-logo")
        ||
        url.includes("checoff_logo")
    ) {

        return false;

    }


    return true;

}


/* =========================
   PRODUCT IMAGE
========================= */

function createProductImage(product) {

    const imageUrl =
        product.image_url;


    /*
     * Kalau image_url kosong atau
     * ternyata URL logo, gunakan
     * placeholder.
     */

    if (
        !isValidProductImage(
            imageUrl
        )
    ) {

        return `
            <div class="product-placeholder">

                <span>
                    ARDANA BATIK
                </span>

            </div>
        `;

    }


    return `
        <img
            src="${escapeHTML(imageUrl)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="
                this.style.display='none';
                this.parentElement.innerHTML=
                '<div class=&quot;product-placeholder&quot;><span>ARDANA BATIK</span></div>';
            "
        >
    `;

}


/* =========================
   STOCK STATUS
========================= */

function createStockStatus(stock) {

    const quantity =
        Number(stock) || 0;


    if (quantity <= 0) {

        return `
            <span class="stock-status out">
                Sold Out
            </span>
        `;

    }


    if (quantity <= 3) {

        return `
            <span class="stock-status low">
                Limited Stock
            </span>
        `;

    }


    return `
        <span class="stock-status available">
            Available
        </span>
    `;

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

    const productList =
        document.getElementById(
            "product-list"
        );


    if (!productList) {

        console.error(
            "Element #product-list tidak ditemukan."
        );

        return;

    }


    let products =
        [...allProducts];


    /* =========================
       FILTER CATEGORY
    ========================== */

    if (
        currentCategory !== "all"
        &&
        currentCategory
    ) {

        products =
            products.filter(
                product => {

                    if (
                        !product.category
                    ) {

                        return false;

                    }


                    return (
                        product.category
                            .trim()
                            .toLowerCase()
                        ===
                        currentCategory
                            .trim()
                            .toLowerCase()
                    );

                }
            );

    }


    /* =========================
       SEARCH
    ========================== */

    if (currentSearch) {

        products =
            products.filter(
                product => {

                    const name =
                        (
                            product.name
                            || ""
                        )
                            .toLowerCase();


                    const description =
                        (
                            product.description
                            || ""
                        )
                            .toLowerCase();


                    const category =
                        (
                            product.category
                            || ""
                        )
                            .toLowerCase();


                    return (

                        name.includes(
                            currentSearch
                        )

                        ||

                        description.includes(
                            currentSearch
                        )

                        ||

                        category.includes(
                            currentSearch
                        )

                    );

                }
            );

    }


    console.log(
        "Hasil filter/search ARDANA BATIK:",
        products
    );


    /* =========================
       EMPTY
    ========================== */

    if (
        products.length === 0
    ) {

        productList.innerHTML = `

            <div class="loading">

                <h2>
                    Collection tidak ditemukan
                </h2>

                <p>
                    Tidak ada koleksi batik
                    yang cocok dengan pencarian.
                </p>

            </div>

        `;


        return;

    }


    /* =========================
       CLEAR
    ========================== */

    productList.innerHTML = "";


    /* =========================
       LOOP PRODUCTS
    ========================== */

    products.forEach(
        product => {


            const price =
                formatPrice(
                    product.price
                );


            const stockStatus =
                createStockStatus(
                    product.stock
                );


            const imageHTML =
                createProductImage(
                    product
                );


            /* =========================
               CARD
            ========================== */

            const productCard =
                document.createElement(
                    "article"
                );


            productCard.className =
                "product-card";


            productCard.innerHTML = `

                <a
                    href="product-detail.html?id=${encodeURIComponent(product.id)}"
                >

                    <div
                        class="product-image"
                    >

                        ${imageHTML}

                    </div>


                    <div
                        class="product-info"
                    >

                        <div
                            class="product-category"
                        >

                            ${escapeHTML(
                                product.category
                            )}

                        </div>


                        <h3>

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <div
                            class="product-price"
                        >

                            ${price}

                        </div>


                        <div
                            class="product-card-bottom"
                        >

                            ${stockStatus}

                            <span
                                class="product-link"
                            >
                                View Product →
                            </span>

                        </div>

                    </div>

                </a>

            `;


            productList.appendChild(
                productCard
            );

        }
    );

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "🔥 ARDANA BATIK PRODUCTS.JS BERHASIL DIMUAT"
        );


        loadProducts();


        /* =========================
           SEARCH EVENT
        ========================== */

        const searchInput =
            document.getElementById(
                "product-search"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    searchProducts(
                        this.value
                    );

                }
            );

        }

    }
);


/* =========================
   GLOBAL FUNCTION
========================= */

window.filterProducts =
    filterProducts;


window.searchProducts =
    searchProducts;
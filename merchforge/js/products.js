/* =========================
   PRODUCTS - Checoff Coffee Shop
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
            Loading products...
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
            "Semua produk dari Supabase:",
            data
        );


        allProducts =
            data || [];


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
                    Gagal memuat produk
                </h2>

                <p>
                    Silakan cek koneksi
                    Supabase.
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
        "Search:",
        currentSearch
    );


    renderProducts();

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
        "Hasil filter/search:",
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
                    Menu tidak ditemukan
                </h2>

                <p>
                    Tidak ada menu yang
                    cocok dengan pencarian.
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


            /* =========================
               PRICE
            ========================== */

            const price =
                new Intl.NumberFormat(
                    "id-ID",
                    {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0
                    }
                ).format(
                    product.price
                );


            /* =========================
               IMAGE
            ========================== */

            const imageHTML =
                product.image_url

                    ? `
                        <img
                            src="${product.image_url}"
                            alt="${product.name}"
                        >
                    `

                    : `
                        <span>
                            CHECOFF
                        </span>
                    `;


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
                    href="product-detail.html?id=${product.id}"
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

                            ${product.category}

                        </div>


                        <h3>

                            ${product.name}

                        </h3>


                        <div
                            class="product-price"
                        >

                            ${price}

                        </div>


                        <div
                            class="product-link"
                        >

                            View Product →

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
            "🔥 PRODUCTS.JS BERHASIL DIMUAT"
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
/* =========================
   PRODUCTS - ValRepublikMerch
========================= */


let allProducts = [];


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


        const category =
            params.get("category")
            || "all";


        renderProducts(category);


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


    renderProducts(category);

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(category) {


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


    let products = [];


    /* =========================
       ALL PRODUCTS
    ========================== */

    if (
        category === "all"
        ||
        !category
    ) {

        products =
            allProducts;

    }


    /* =========================
       FILTER CATEGORY
    ========================== */

    else {


        products =
            allProducts.filter(
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
                        category
                            .trim()
                            .toLowerCase()
                    );

                }
            );

    }


    console.log(
        "Hasil filter:",
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
                    Produk tidak ditemukan
                </h2>

                <p>
                    Belum ada produk
                    pada kategori
                    <strong>
                        ${category}
                    </strong>.
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
                            ValRepublikMerch
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

    }
);


/* =========================
   GLOBAL FUNCTION
========================= */

window.filterProducts =
    filterProducts;
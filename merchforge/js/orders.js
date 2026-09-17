/* =========================================================
   ARDANA BATIK - MY ORDERS
========================================================= */


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatOrderPrice(price) {

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
   FORMAT DATE
========================================================= */

function formatOrderDate(date) {

    return new Date(date).toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient
        .auth
        .getUser();


    if (error) {

        throw error;

    }


    return data.user;

}


/* =========================================================
   LOGIN REQUIRED
========================================================= */

async function requireLogin() {

    try {

        const user =
            await getCurrentUser();


        if (!user) {

            window.location.href =
                "auth/login.html";

            return null;

        }


        return user;


    } catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );


        window.location.href =
            "auth/login.html";


        return null;

    }

}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    const ordersContainer =
        document.getElementById(
            "orders-container"
        );


    if (!ordersContainer) {

        console.error(
            "Element #orders-container tidak ditemukan."
        );

        return;

    }


    ordersContainer.innerHTML = `
        <div class="loading">
            <p>Memuat pesanan...</p>
        </div>
    `;


    try {

        /* =================================================
           CEK LOGIN
        ================================================= */

        const user =
            await requireLogin();


        if (!user) {

            return;

        }


        console.log(
            "USER LOGIN:",
            user.email
        );


        /* =================================================
           AMBIL ORDER MILIK USER
        ================================================= */

        const {
            data: orders,
            error: ordersError
        } = await supabaseClient
            .from("orders")
            .select(`
                id,
                order_number,
                customer_name,
                phone,
                notes,
                total,
                status,
                created_at,
                user_id
            `)
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (ordersError) {

            throw ordersError;

        }


        console.log(
            "ORDERS USER:",
            orders
        );


        /* =================================================
           TIDAK ADA PESANAN
        ================================================= */

        if (
            !orders ||
            orders.length === 0
        ) {

            ordersContainer.innerHTML = `

                <div class="loading">

                    <h2>
                        BELUM ADA PESANAN
                    </h2>

                    <p>
                        Kamu belum memiliki
                        pesanan di ARDANA BATIK.
                    </p>

                    <a
                        href="products.html"
                        class="btn btn-primary"
                    >
                        LIHAT COLLECTION →
                    </a>

                </div>

            `;

            return;

        }


        /* =================================================
           AMBIL ID ORDER
        ================================================= */

        const orderIds =
            orders.map(
                order =>
                    order.id
            );


        /* =================================================
           AMBIL ORDER ITEMS
        ================================================= */

        const {
            data: orderItems,
            error: itemsError
        } = await supabaseClient
            .from("order_items")
            .select(`
                id,
                order_id,
                product_id,
                product_name,
                price,
                quantity,
                subtotal
            `)
            .in(
                "order_id",
                orderIds
            );


        if (itemsError) {

            throw itemsError;

        }


        console.log(
            "ORDER ITEMS:",
            orderItems
        );


        /* =================================================
           RENDER ORDERS
        ================================================= */

        let html = "";


        orders.forEach(
            order => {

                const items =
                    (orderItems || [])
                        .filter(
                            item =>
                                Number(
                                    item.order_id
                                ) ===
                                Number(
                                    order.id
                                )
                        );


                html += `

                    <article
                        class="order-card"
                    >

                        <!-- ORDER HEADER -->

                        <div
                            class="order-card-header"
                        >

                            <div>

                                <p
                                    class="section-label"
                                >
                                    ORDER
                                </p>

                                <h2>
                                    ${escapeHTML(
                                        order.order_number
                                    )}
                                </h2>

                            </div>


                            <div
                                class="
                                    order-status
                                    ${getStatusClass(
                                        order.status
                                    )}
                                "
                            >

                                ${getStatusLabel(
                                    order.status
                                )}

                            </div>

                        </div>


                        <!-- DATE -->

                        <div
                            class="order-date"
                        >

                            ${formatOrderDate(
                                order.created_at
                            )}

                        </div>


                        <!-- ITEMS -->

                        <div
                            class="order-items"
                        >

                            ${renderOrderItems(
                                items
                            )}

                        </div>


                        <!-- FOOTER -->

                        <div
                            class="order-card-footer"
                        >

                            <div>

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    ${formatOrderPrice(
                                        order.total
                                    )}
                                </strong>

                            </div>


                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="
                                    showInvoice(
                                        ${Number(order.id)}
                                    )
                                "
                            >
                                LIHAT NOTA →
                            </button>

                        </div>

                    </article>

                `;

            }
        );


        ordersContainer.innerHTML =
            html;


    } catch (error) {

        console.error(
            "ORDERS ERROR:",
            error
        );


        ordersContainer.innerHTML = `

            <div class="loading">

                <h2>
                    GAGAL MEMUAT PESANAN
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadOrders()"
                >
                    COBA LAGI →
                </button>

            </div>

        `;

    }

}


/* =========================================================
   RENDER ORDER ITEMS
========================================================= */

function renderOrderItems(items) {

    if (
        !items ||
        items.length === 0
    ) {

        return `
            <p>
                Detail produk tidak tersedia.
            </p>
        `;

    }


    let html = "";


    items.forEach(
        item => {

            html += `

                <div
                    class="order-item"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                item.product_name
                            )}
                        </strong>

                        <span>
                            ${Number(
                                item.quantity
                            )}
                            ×
                            ${formatOrderPrice(
                                item.price
                            )}
                        </span>

                    </div>


                    <strong>
                        ${formatOrderPrice(
                            item.subtotal
                        )}
                    </strong>

                </div>

            `;

        }
    );


    return html;

}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status) {

    switch (status) {

        case "pending":

            return "PENDING";


        case "processing":

            return "PROCESSING";


        case "completed":

            return "✓ COMPLETED";


        case "cancelled":

            return "CANCELLED";


        default:

            return String(
                status || "UNKNOWN"
            ).toUpperCase();

    }

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    switch (status) {

        case "pending":

            return "status-pending";


        case "processing":

            return "status-processing";


        case "completed":

            return "status-completed";


        case "cancelled":

            return "status-cancelled";


        default:

            return "";

    }

}


/* =========================================================
   SHOW INVOICE
========================================================= */

async function showInvoice(orderId) {

    try {

        /* =================================================
           CEK LOGIN
        ================================================= */

        const user =
            await requireLogin();


        if (!user) {

            return;

        }


        /* =================================================
           VALIDASI ORDER ID
        ================================================= */

        const numericOrderId =
            Number(orderId);


        if (
            !Number.isInteger(
                numericOrderId
            ) ||
            numericOrderId <= 0
        ) {

            throw new Error(
                "ID pesanan tidak valid."
            );

        }


        /* =================================================
           AMBIL ORDER MILIK USER
           
           user_id dicek lagi agar user tidak
           dapat membuka invoice milik user lain.
        ================================================= */

        const {
            data: order,
            error: orderError
        } = await supabaseClient
            .from("orders")
            .select(`
                id,
                order_number,
                customer_name,
                phone,
                notes,
                total,
                status,
                created_at,
                user_id
            `)
            .eq(
                "id",
                numericOrderId
            )
            .eq(
                "user_id",
                user.id
            )
            .single();


        if (orderError) {

            throw orderError;

        }


        if (!order) {

            throw new Error(
                "Pesanan tidak ditemukan."
            );

        }


        /* =================================================
           AMBIL ORDER ITEMS
        ================================================= */

        const {
            data: items,
            error: itemsError
        } = await supabaseClient
            .from("order_items")
            .select(`
                product_name,
                price,
                quantity,
                subtotal
            `)
            .eq(
                "order_id",
                order.id
            );


        if (itemsError) {

            throw itemsError;

        }


        /* =================================================
           BUAT ITEM NOTA
        ================================================= */

        let itemsHTML = "";


        (
            items || []
        ).forEach(
            item => {

                itemsHTML += `

                    <div
                        class="invoice-item"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    item.product_name
                                )}
                            </strong>

                            <p>
                                ${Number(
                                    item.quantity
                                )}
                                ×
                                ${formatOrderPrice(
                                    item.price
                                )}
                            </p>

                        </div>


                        <strong>
                            ${formatOrderPrice(
                                item.subtotal
                            )}
                        </strong>

                    </div>

                `;

            }
        );


        /* =================================================
           NOTA
        ================================================= */

        const invoiceHTML = `

            <div
                class="invoice-overlay"
                id="invoice-overlay"
            >

                <div
                    class="invoice-modal"
                >


                    <!-- HEADER -->

                    <div
                        class="invoice-header"
                    >

                        <div>

                            <p
                                class="section-label"
                            >
                                ARDANA BATIK
                            </p>

                            <h2>
                                NOTA PEMBELIAN
                            </h2>

                        </div>


                        <button
                            type="button"
                            class="invoice-close"
                            onclick="closeInvoice()"
                            aria-label="Tutup nota"
                        >
                            ×
                        </button>

                    </div>



                    <!-- INFO -->

                    <div
                        class="invoice-info"
                    >

                        <div>

                            <span>
                                Nomor Order
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.order_number
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Tanggal
                            </span>

                            <strong>
                                ${formatOrderDate(
                                    order.created_at
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Customer
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.customer_name
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                WhatsApp
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.phone
                                )}
                            </strong>

                        </div>

                    </div>



                    <!-- ITEMS -->

                    <div
                        class="invoice-items"
                    >

                        ${itemsHTML}

                    </div>



                    <!-- TOTAL -->

                    <div
                        class="invoice-total"
                    >

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            ${formatOrderPrice(
                                order.total
                            )}
                        </strong>

                    </div>



                    <!-- STATUS -->

                    <div
                        class="invoice-status"
                    >

                        <span>
                            STATUS PESANAN
                        </span>

                        <strong
                            class="${getStatusClass(
                                order.status
                            )}"
                        >

                            ${getStatusLabel(
                                order.status
                            )}

                        </strong>

                    </div>



                    <!-- NOTES -->

                    ${
                        order.notes

                        ?

                        `
                        <div
                            class="invoice-notes"
                        >

                            <span>
                                CATATAN
                            </span>

                            <p>
                                ${escapeHTML(
                                    order.notes
                                )}
                            </p>

                        </div>
                        `

                        :

                        ""
                    }



                    <!-- ACTIONS -->

                    <div
                        class="invoice-actions"
                    >

                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick="printInvoice()"
                        >
                            CETAK NOTA
                        </button>


                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="closeInvoice()"
                        >
                            TUTUP
                        </button>

                    </div>


                </div>

            </div>

        `;


        /* =================================================
           HINDARI DUPLICATE MODAL
        ================================================= */

        closeInvoice();


        document.body.insertAdjacentHTML(
            "beforeend",
            invoiceHTML
        );


    } catch (error) {

        console.error(
            "INVOICE ERROR:",
            error
        );


        alert(
            "Gagal membuka nota: " +
            error.message
        );

    }

}


/* =========================================================
   CLOSE INVOICE
========================================================= */

function closeInvoice() {

    const overlay =
        document.getElementById(
            "invoice-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}


/* =========================================================
   PRINT INVOICE
========================================================= */

function printInvoice() {

    window.print();

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

        loadOrders();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadOrders =
    loadOrders;

window.showInvoice =
    showInvoice;

window.closeInvoice =
    closeInvoice;

window.printInvoice =
    printInvoice;

window.getCurrentUser =
    getCurrentUser;
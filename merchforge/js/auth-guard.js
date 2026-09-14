/* =========================
   CHECOFF AUTH GUARD
   Melindungi halaman Checoff
========================= */

(async function () {

    try {

        /* =========================
           CEK USER LOGIN
        ========================= */

        const {
            data: {
                user
            },
            error
        } = await supabaseClient.auth.getUser();


        /* =========================
           JIKA ERROR
        ========================= */

        if (error) {

            console.error(
                "Gagal mengecek login:",
                error
            );

            window.location.href =
                "auth/login.html";

            return;

        }


        /* =========================
           JIKA BELUM LOGIN
        ========================= */

        if (!user) {

            console.log(
                "User belum login. Mengarahkan ke Login..."
            );

            window.location.href =
                "auth/login.html";

            return;

        }


        /* =========================
           USER SUDAH LOGIN
        ========================= */

        console.log(
            "User sudah login:",
            user.email
        );


        /* =========================
           TAMPILKAN HALAMAN
        ========================= */

        document.documentElement.classList.add(
            "auth-verified"
        );


    } catch (error) {

        console.error(
            "AUTH GUARD ERROR:",
            error
        );

        window.location.href =
            "auth/login.html";

    }

})();
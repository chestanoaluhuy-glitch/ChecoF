// =========================================
// ARDANA BATIK
// AUTH GUARD
// =========================================

(async function () {

    try {

        // Cek apakah user sedang login
        const {
            data: {
                user
            },
            error
        } = await supabaseClient.auth.getUser();


        // Jika terjadi error saat mengecek session
        if (error) {

            console.error(
                "Gagal mengecek login:",
                error
            );

            window.location.href =
                "auth/login.html";

            return;

        }


        // Jika tidak ada user yang login
        if (!user) {

            console.log(
                "User belum login."
            );

            window.location.href =
                "auth/login.html";

            return;

        }


        // User berhasil terdeteksi
        console.log(
            "User sudah login:",
            user.email
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
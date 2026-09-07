/* =========================================================
   CHECOFF AUTHENTICATION
   Login & Register
========================================================= */


/* =========================================================
   REGISTER
========================================================= */

const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("full-name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("register-message");


        /* Validasi */

        if (!fullName || !email || !password) {

            message.textContent =
                "Semua field wajib diisi.";

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "Password minimal 6 karakter.";

            return;
        }


        message.textContent =
            "Mendaftarkan akun...";


        try {

            /* =========================================
               CREATE USER DI SUPABASE AUTH
            ========================================= */

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });


            if (error) {
                throw error;
            }


            if (!data.user) {

                throw new Error(
                    "User gagal dibuat."
                );

            }


            console.log(
                "REGISTER USER:",
                data.user
            );


            /* =========================================
               SIMPAN PROFILE USER
            ========================================= */

            const {
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        role: "user"
                    }
                ]);


            if (profileError) {

                console.error(
                    "PROFILE ERROR:",
                    profileError
                );

            }


            /* =========================================
               BERHASIL
            ========================================= */

            message.textContent =
                "Registrasi berhasil! Silakan login.";


            registerForm.reset();


        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );


            message.textContent =
                "Registrasi gagal: " +
                error.message;

        }

    });

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("login-message");


        /* Validasi */

        if (!email || !password) {

            message.textContent =
                "Email dan password wajib diisi.";

            return;
        }


        message.textContent =
            "Memproses login...";


        try {

            /* =========================================
               LOGIN SUPABASE AUTH
            ========================================= */

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


            if (error) {
                throw error;
            }


            if (!data.user) {

                throw new Error(
                    "User tidak ditemukan."
                );

            }


            const user = data.user;


            console.log(
                "LOGIN USER:",
                user
            );


            /* =========================================
               AMBIL PROFILE USER
            ========================================= */

            const {
                data: profile,
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .select("role, full_name")
                .eq("id", user.id)
                .single();


            if (profileError) {

                throw profileError;

            }


            console.log(
                "USER PROFILE:",
                profile
            );


            console.log(
                "USER ROLE:",
                profile.role
            );


            /* =========================================
               CEK ROLE
            ========================================= */

            if (profile.role === "admin") {

                message.textContent =
                    "Login berhasil. Membuka Admin Dashboard...";


                setTimeout(function () {

                    window.location.href =
                        "../admin/index.html";

                }, 700);

            }


            else {

                message.textContent =
                    "Login berhasil. Selamat datang di Checoff!";


                setTimeout(function () {

                    window.location.href =
                        "../index.html";

                }, 700);

            }


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            message.textContent =
                "Login gagal: " +
                error.message;

        }

    });

}
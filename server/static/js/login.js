
import "/js/citrahold.js";

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};


document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {
        console.log("Online")
        if (!loggedIn) {

            const email = document.querySelector("#email");
            const password = document.querySelector("#password");
            const loginButton = document.querySelector("#loginButton");
            const registerButton = document.querySelector("#registerButton");

            const notices = {
                capsLock: document.querySelector(".capsLock"),
                invalidEmail: document.querySelector(".invalidEmail"),
                invalidPassword: document.querySelector(".invalidPassword"),
                invalidLogin: document.querySelector(".invalidLogin")
            };

            document.body.addEventListener("keyup", (e) => {
                // check if email or password is in focus
                if (document.activeElement === email || document.activeElement === password) {

                    notices.invalidLogin.style.display = "none";

                    if (document.activeElement === email) {
                        notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                    } else {
                        notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";
                    }

                    const caps = e.getModifierState && e.getModifierState('CapsLock');
                    notices.capsLock.style.display = (caps) ? "block" : "none";
                }
                // if is enter
                if (e.code === "Enter") {
                    (window.location.hash === "#register") ? registerButton.click() : loginButton.click();                    
                }
            });

            loginButton.addEventListener("click", () => {
                // Attempt to login
                window.location.hash = "#login";

                notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";

                if (validateEmail(email.value) && password.value.length > 0) {
                    citrahold.login(email.value, password.value).then((loggedIn) => {
                        window.location.href = "/"
                    }).catch((err) => {
                        notices.invalidLogin.style.display = "block";
                        notices.invalidLogin.innerHTML = err.error || "Server error";
                    });
                }

            });

            registerButton.addEventListener("click", () => {
                // Attempt to login
                window.location.hash = "#register";

                notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";

                if (validateEmail(email.value) && password.value.length > 0) {
                    citrahold.register(email.value, password.value).then((loggedIn) => {
                        window.location.href = "/";
                    }).catch((err) => {
                        notices.invalidLogin.style.display = "block";
                        notices.invalidLogin.innerHTML = err.error || "Server error";
                    });
                }

            });

        } else {
            document.querySelector(".loggedIn").style.display = "block";
            document.querySelector(".notLoggedIn").style.display = "none";

            const logoutButton = document.querySelector("#logoutButton");

            logoutButton.addEventListener("click", () => {
                // Attempt to login

                citrahold.logout().then(() => {
                    window.location.href = "/login.html";
                }).catch((err) => {
                    alert(err);
                });

            });

        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
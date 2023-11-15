// this is purely for your editor to hook up intellisense
import citrahold from "../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
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

            const verificationBox = document.querySelector("#verificationBox");
            const verifyButton = document.querySelector("#verifyButton");
            const verificationCode = document.querySelector("#verificationCode");

            const forgotPasswordLink = document.querySelector("#forgotPasswordLink");

            const notices = {
                capsLock: document.querySelector(".capsLock"),
                invalidEmail: document.querySelector(".invalidEmail"),
                invalidPassword: document.querySelector(".invalidPassword"),
                invalidLogin: document.querySelector(".invalidLogin")
            };

            let userID = "";
            verifyButton.addEventListener("click", (e) => {
                citrahold.verifyEmail(
                    userID,
                    verificationCode.value
                ).then((res) => {
                    console.log(res);
                    window.location.href = "/";
                }).catch((err) => {
                    console.error(err);
                })
            });

            document.body.addEventListener("keyup", (e) => {
                if (document.activeElement === email || document.activeElement === password) {

                    notices.invalidLogin.style.display = "none";

                    if (document.activeElement === email) {
                        notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                        forgotPasswordLink.href = "/forgotPassword.html?" + email.value;
                    } else {
                        notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";
                    }

                    const caps = e.getModifierState && e.getModifierState('CapsLock');
                    notices.capsLock.style.display = (caps) ? "block" : "none";
                }
                if (e.code === "Enter") {
                    (window.location.hash === "#register") ? registerButton.click() : loginButton.click();
                }
            });

            loginButton.addEventListener("click", () => {
                window.location.hash = "#login";

                notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";

                if (validateEmail(email.value) && password.value.length > 0) {
                    citrahold.login(email.value, password.value).then((loggedIn) => {
                        window.location.href = "/"
                    }).catch((err) => {
                        notices.invalidLogin.style.display = "block";
                        if (err.webStatus) {
                            // INTERNAL_SERVER_ERROR | VERIFY_EMAIL | INVALID_DETAILS | PASSWORD_RESET
                            switch (err.webStatus) {
                                case "PASSWORD_RESET":
                                    notices.invalidLogin.innerHTML = "Please check your email to continue.";
                                    break;
                                case "VERIFY_EMAIL":
                                    notices.invalidLogin.innerHTML = "Your account is not verified. Please check your email.";
                                    userID = err.userID;
                                    verificationBox.style.display = "block";
                                    break;
                                case "INVALID_DETAILS":
                                    notices.invalidLogin.innerHTML = "Invalid email or password";
                                    break;
                                case "INTERNAL_SERVER_ERROR":
                                    notices.invalidLogin.innerHTML = "The server has encountered an error. Please try again later.";
                                    break;
                            }
                        } 

                    });
                }

            });

            registerButton.addEventListener("click", () => {
                // Attempt to login
                window.location.hash = "#register";

                notices.invalidEmail.style.display = (validateEmail(email.value)) ? "none" : "block";
                notices.invalidPassword.style.display = (password.value.length > 0) ? "none" : "block";

                if (validateEmail(email.value) && password.value.length > 0) {
                    citrahold.register(email.value, password.value).then((response) => {
                        console.log(response);
                        if (response.userID) {
                            userID = response.userID;
                            verificationBox.style.display = "block";

                        } else {
                            window.location.href = "/";
                        }
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
// this is purely for your editor to hook up intellisense
import citrahold from "../../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {


    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {

        if (loggedIn) {

            const page = document.querySelector("#changePassword");
            const oldPasswordContainer = document.querySelector("#oldPasswordContainer");
            const changePasswordButton = document.querySelector("#changePasswordButton");

            const oldPassword = document.querySelector("#oldPassword");
            const newPassword = document.querySelector("#newPassword");

            const notSuccessfulYet = document.querySelector("#notSuccessfulYet");
            const successful = document.querySelector("#successful");

            const notices = {
                capsLock: document.querySelector(".capsLock"),
                invalidNewPassword: document.querySelector(".invalidNewPassword"),
                invalidPassword: document.querySelector(".invalidPassword"),
                invalidCredentials: document.querySelector(".invalidCredentials")
            };

            page.style.display = "block";

            var fromEmpty = false;
            if (window.location.href.split("?")[1] == "reset") {
                fromEmpty = true;
                oldPasswordContainer.style.display = "none";
            }

            function validatePasswords() {
                if (newPassword.value.length === 0) {
                    notices.invalidNewPassword.style.display = "block";
                    return false;
                } else {
                    notices.invalidNewPassword.style.display = "none";

                }

                if (!fromEmpty) {
                    if (oldPassword.value.length === 0) {
                        notices.invalidPassword.style.display = "block";
                        return false;
                    } else {
                        notices.invalidPassword.style.display = "none";
                    }
                }

                return true;

            }

            document.body.addEventListener("keyup", (e) => {
                // check if email or password is in focus
                if (document.activeElement === oldPassword || document.activeElement === newPassword) {

                    notices.invalidCredentials.style.display = "none";

                    const caps = e.getModifierState && e.getModifierState('CapsLock');
                    notices.capsLock.style.display = (caps) ? "block" : "none";
                }

                validatePasswords();

                if (e.code === "Enter") {
                    changePasswordButton.click();
                }
            });

            changePasswordButton.addEventListener("click", () => {

                notices.capsLock.style.display = "none";

                citrahold.changePassword(oldPassword.value, newPassword.value).then(() => {
                    successful.style.display = "block";
                    notSuccessfulYet.style.display = "none";
                }).catch((err) => {
                    // INVALID_CREDENTIALS | INVALID_OLD_PASSWORD | INCORRECT_PASSWORD
                    if (err.webStatus) {
                        switch (err.webStatus) {
                            case "INVALID_CREDENTIALS":
                                notices.invalidCredentials.style.display = "block";
                                break;
                            case "INVALID_OLD_PASSWORD":
                                notices.invalidPassword.style.display = "block";
                                break;
                            case "INCORRECT_PASSWORD":
                                notices.invalidCredentials.style.display = "block";
                                break;
                        }
                    }
                });

            });

        } else {
            window.location.href = "/login.html";
        }

    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });

});
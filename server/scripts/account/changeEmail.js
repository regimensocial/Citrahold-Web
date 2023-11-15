// this is purely for your editor to hook up intellisense
import citrahold from "../../../src/index.ts";
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
            window.location.href = "/login.html";
        } else {
            const page = document.querySelector("#changeEmail");
            page.style.display = "block";

            const changeEmailButton = document.querySelector("#changeEmailButton");

            const popUp = document.querySelector(".popupBox");
            const dimBg = document.querySelector("#dim");

            const cancelChangeButton = document.querySelector("#cancelChange");
            const confirmChangeButton = document.querySelector("#confirmChange");

            const password = document.querySelector("#password");
            const newEmail = document.querySelector("#email");

            const changedPage = document.querySelector("#changed");
            const notChangedPage = document.querySelector("#notChanged");

            const emailPlace = document.querySelector(".emailPlace");

            const notices = {
                invalidEmail: document.querySelector(".invalidEmail"),
                invalidPassword: document.querySelector(".invalidPassword"),
                invalidLogin: document.querySelector(".invalidLogin"),
                capsLock: document.querySelector(".capsLock"),
                other: document.querySelector(".other")
            }


            function displayPopUp(shouldDisplay) {
                if (shouldDisplay) {
                    emailPlace.innerHTML = email.value;
                    popUp.style.display = "block";
                    dimBg.style.display = "block";
                } else {
                    popUp.style.display = "none";
                    dimBg.style.display = "none";
                }
            }






            document.body.addEventListener("keyup", (e) => {

                notices.other.innerHTML = "";
                notices.other.style.display = "none";
                if (document.activeElement === password) {

                    notices.invalidLogin.style.display = "none";

                    if (password.value.length === 0) {
                        notices.invalidPassword.style.display = "block";
                    } else {
                        notices.invalidPassword.style.display = "none";
                    }

                    const caps = e.getModifierState && e.getModifierState('CapsLock');
                    notices.capsLock.style.display = (caps) ? "block" : "none";
                } else if (document.activeElement === newEmail) {
                    notices.invalidEmail.style.display = (validateEmail(newEmail.value)) ? "none" : "block";
                }
                
                if (e.code === "Enter") {
                    changeEmailButton.click();
                }
            });

            changeEmailButton.addEventListener("click", () => {

                if (password.value.length === 0) {
                    notices.invalidPassword.style.display = "block";
                } else if (!validateEmail(newEmail.value)) {
                    notices.invalidEmail.style.display = "block";
                } else {
                    notices.invalidPassword.style.display = "none";
                    notices.invalidEmail.style.display = "none";
                    displayPopUp(true);
                }
            });

            cancelChangeButton.addEventListener("click", () => {
                displayPopUp(false);
            });

            confirmChangeButton.addEventListener("click", () => {
                citrahold.changeEmail(
                    password.value,
                    newEmail.value
                ).then((res) => {
                    console.log(res);

                    changedPage.style.display = "block";
                    notChangedPage.style.display = "none";

                    citrahold.logout().then(() => {}).catch(() => {});

                }).catch((err) => {
                    console.error(err);

                    notices.other.innerHTML = err.error;
                    notices.other.style.display = "block";

                    displayPopUp(false);

                })

            });

        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
// this is purely for your editor to hook up intellisense
import citrahold from "../../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
import "/js/citrahold.js";


document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {
        console.log("Online")
        if (!loggedIn) {
            window.location.href = "/";
        } else {
            const page = document.querySelector("#deleteAccount");
            page.style.display = "block";

            const deleteLink = document.querySelector("#deleteLink");

            const popUp = document.querySelector(".popupBox");
            const dimBg = document.querySelector("#dim");

            const cancelDeleteButton = document.querySelector("#cancelDelete");
            const confirmDeleteButton = document.querySelector("#confirmDelete");

            const password = document.querySelector("#password");

            const notices = {
                invalidPassword: document.querySelector(".invalidPassword"),
                invalidLogin: document.querySelector(".invalidLogin"),
                capsLock: document.querySelector(".capsLock"),
                other: document.querySelector(".other")
            }

            function displayPopUp(shouldDisplay) {
                if (shouldDisplay) {
                    popUp.style.display = "block";
                    dimBg.style.display = "block";
                } else {
                    popUp.style.display = "none";
                    dimBg.style.display = "none";
                }
            }






            document.body.addEventListener("keyup", (e) => {
                // check if email or password is in focus

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
                }
                // if is enter
                if (e.code === "Enter") {
                    deleteLink.click();
                }
            });

            deleteLink.addEventListener("click", () => {

                if (password.value.length === 0) {
                    notices.invalidPassword.style.display = "block";
                } else {
                    notices.invalidPassword.style.display = "none";
                    displayPopUp(true);
                }
            });

            cancelDeleteButton.addEventListener("click", () => {
                displayPopUp(false);
            });


            confirmDeleteButton.addEventListener("click", () => {
                citrahold.deleteAccount(
                    password.value
                ).then((res) => {
                    displayPopUp(false);
                    window.location.href = "/";
                }).catch((err) => {

                    notices.other.innerHTML = err.error;
                    notices.other.style.display = "block";
                    displayPopUp(false);

                });
            });

        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
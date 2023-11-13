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
            const page = document.querySelector("#regenerateTokenPage");
            page.style.display = "block";

            const regenButton = document.querySelector("#regenerateToken");

            const popUp = document.querySelector(".popupBox");
            const dimBg = document.querySelector("#dim");

            const cancelRegenButton = document.querySelector("#cancelRegen");
            const confirmRegenButton = document.querySelector("#confirmRegen");

            const password = document.querySelector("#password");

            const regeneratedPage = document.querySelector("#regenerated");
            const notRegeneratedPage = document.querySelector("#notRegenerated");

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
                    regenButton.click();
                }
            });

            regenButton.addEventListener("click", () => {

                if (password.value.length === 0) {
                    notices.invalidPassword.style.display = "block";
                } else {
                    notices.invalidPassword.style.display = "none";
                    displayPopUp(true);
                }
            });

            cancelRegenButton.addEventListener("click", () => {
                displayPopUp(false);
            });

            confirmRegenButton.addEventListener("click", () => {
                citrahold.regenerateToken(password.value).then((res) => {
                    notRegeneratedPage.style.display = "none";
                    regeneratedPage.style.display = "block";
                }).catch((err) => {
                    console.error(err);
                });
            });

        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
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

            const page = document.querySelector("#forgotPassword");
            page.style.display = "block";

            const email = document.querySelector("#email");

            email.value = window.location.href.split("?")[1] || "";


            const sendButton = document.querySelector("#sendButton");

            const invalidEmailNotice = document.querySelector(".invalidEmail");
            const otherNotice = document.querySelector(".other");


            const sent = document.querySelector("#sent");
            const notSent = document.querySelector("#notSent");

            document.body.addEventListener("keyup", (e) => {
                
                invalidEmailNotice.style.display = (validateEmail(email.value)) ? "none" : "block";

                if (e.code === "Enter") {
                    sendButton.click();
                }
            });

            sendButton.addEventListener("click", (e) => {
                if (validateEmail(email.value)) {
                    console.log("Sending email");
                    citrahold.forgotPassword(email.value).then((res) => {
                        sent.style.display = "block";
                        notSent.style.display = "none";
                    }).catch((err) => {
                        otherNotice.innerHTML = err.error;
                        otherNotice.style.display = "block";
                    });
                }
            });

            if (email.value.length > 0) {
                sendButton.click();
            }

        } else {
            window.location.href = "/dashboard.html";
        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
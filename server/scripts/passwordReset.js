// this is purely for your editor to hook up intellisense
import citrahold from "../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {

    const shorthandToken = window.location.href.split("?")[1];
    if (!shorthandToken) {
        window.location.href = "/login.html";
    } else {
        citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {
            citrahold.loginWithShorthandToken(shorthandToken).then((res) => {
                window.location.href = "/account/changePassword.html?reset"
            }).catch((err) => {
                window.location.href = "/login.html";
            });
        }).catch((err) => {
            console.error(err);
            if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
        });
    }
});
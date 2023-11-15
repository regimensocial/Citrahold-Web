// this is purely for your editor to hook up intellisense
import citrahold from "../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((_loggedIn) => {
        document.querySelector("#status").innerHTML = "Online!";
    }).catch((err) => {
        document.querySelector("#status").innerHTML = "Server is offline.";
        console.error(err);
    });
});
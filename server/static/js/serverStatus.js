
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((_loggedIn) => {
        document.querySelector("#status").innerHTML = "Online!";
    }).catch((err) => {
        document.querySelector("#status").innerHTML = "Server is offline.";
    });
});
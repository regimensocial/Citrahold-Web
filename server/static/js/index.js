
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {
        console.log("Online")
        if (loggedIn) {
            window.location.href = "/dashboard.html";
        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
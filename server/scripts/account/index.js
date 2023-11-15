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
            const accountPage = document.querySelector("#account");
            accountPage.style.display = "block";

            const logoutButton = document.querySelector("#logout");


            const userEmail = document.querySelector("#userEmail");
            const userID = document.querySelector("#userID");
            const fileUsage = document.querySelector("#fileUsage");

            const userInfo = citrahold.getUserInfo();
            const maxUserDirSize = citrahold.getMaxUserDirSize();

            userEmail.innerHTML = userInfo.email;
            userID.innerHTML = userInfo.id;
            fileUsage.innerHTML = `${userInfo.directorySize}KB/${maxUserDirSize}KB (${((userInfo.directorySize/maxUserDirSize)*100).toFixed(2)}%)`;

            logoutButton.addEventListener("click", () => {
                citrahold.logout().then(() => {
                    window.location.href = "/";
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
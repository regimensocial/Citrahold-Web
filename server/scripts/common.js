// don't do the hack here, the server isn't programmed to deal with it
// import citrahold from "../../../src/index.ts";
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {

    let pages = {
        loggedIn: [
            ["Dashboard", "/dashboard"],
            ["Shorthand Token", "/shorthandToken"],
            ["Account", "/account/index", "/account/"]
        ],
        notLoggedIn: [
            ["Home", "/", "/index"],
            ["Log In", "/login"],
            ["Register", "/login#register"]
        ],
        both: [
            ["About", "/about"]
        ]
    }

    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {

        const windowPath = window.location.pathname.replaceAll(".html", "");
        console.log(windowPath)

        const navBar = document.querySelector("#navBar");
        const navBarList = document.querySelector("#navBar ul");
        const mobileButton = document.querySelector("#mobileButton");

        const logo = document.querySelector("#logo");

        logo.addEventListener("click", () => {
            window.location.href = loggedIn ? "/dashboard" : "/"; 
        })

        let links = loggedIn ? pages.loggedIn : pages.notLoggedIn;
        links = links.concat(pages.both);

        links.forEach(page => {
            let listItem = document.createElement("li");
            let anchor = document.createElement("a");
            anchor.href = page[1];
            anchor.innerHTML = page[0];

            listItem.appendChild(anchor);
            navBarList.appendChild(listItem)

            if (windowPath == page[1] || windowPath == (page[2] || "")) {
                listItem.style.fontWeight = "bolder";
            }

        });

        let listItem = document.createElement("li");
        let anchor = document.createElement("a");
        listItem.classList.add("mobileOnly");
        anchor.href = "#";
        anchor.innerHTML = "Hide";

        listItem.addEventListener("click", () => {
            navBar.classList.toggle("hidden")
        })

        mobileButton.addEventListener("click", () => {
            navBar.classList.toggle("hidden")
        })

        listItem.appendChild(anchor);
        navBarList.appendChild(listItem)

    })
});
// this is purely for your editor to hook up intellisense
import citrahold from "../../src/index.ts";
// it won't be included in the build
/*SPLIT*/
import "/js/citrahold.js";

document.addEventListener("DOMContentLoaded", () => {
    citrahold.setServerAddress(SERVER_ADDRESS).then((loggedIn) => {
        console.log("Online")
        if (!loggedIn) {
            window.location.href = "/";
        } else {
            const shorthandTokenPage = document.querySelector("#shorthandToken");
            shorthandTokenPage.style.display = "block";

            const shorthandTokenBox = document.querySelector("#shorthandTokenBox");
            const shorthandTokenPlace = document.querySelector("#shorthandTokenPlace");

            const generateShorthandToken = document.querySelector("#generateShorthandToken");
            const copyShorthandToken = document.querySelector("#copyShorthandToken");
            const discardShorthandToken = document.querySelector("#discardShorthandToken");
            const messageBox = document.querySelector("#message");
            let tokenInterval;
            let tokenExpiry;
            let shorthandToken;

            discardShorthandToken.addEventListener("click", () => {
                citrahold.getTokenFromShorthand(shorthandToken).then((_token) => {}).catch((_err) => {});
            });

            generateShorthandToken.addEventListener("click", () => {
                shorthandTokenBox.style.display = "block";
                shorthandTokenPlace.innerHTML = "Generating...";
                citrahold.getShorthandToken().then((shorthandTokenFromServer) => {
                    
                    shorthandToken = shorthandTokenFromServer;

                    tokenExpiry = new Date();
                    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 2);
                    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + 1);
                    clearInterval(tokenInterval);

                    messageBox.innerHTML = `Here is your shorthand token. You must use it within 2 minutes or it will expire. It can only be used once.`;
                    tokenInterval = setInterval(() => {

                        citrahold.doesShorthandTokenExist(shorthandToken).then((exists) => {
                            if (!exists) {
                                shorthandTokenPlace.value = "Expired";
                                shorthandTokenBox.style.display = "none";
                                clearInterval(tokenInterval);
                            } else {
                                const now = new Date();
                                const difference = Math.floor((tokenExpiry.getTime() - now.getTime()) / 1000);
                                if (difference <= 0) {
                                    shorthandTokenPlace.value = "Expired";
                                    shorthandTokenBox.style.display = "none";
                                    clearInterval(tokenInterval);
                                } else {
                                    console.log("count");
                                    let minutes = Math.floor(difference / 60);
                                    let seconds = difference % 60;
                                    messageBox.innerHTML = `Here is your shorthand token. You must use it within ${minutes ? (minutes + " minute") : ""} ${(minutes && seconds) ? "and " : ""} ${seconds ? (seconds + " seconds") : ""} or it will expire. It can only be used once.`;
                                }
                            }
                        });

                    }, 1000);

                    shorthandTokenPlace.value = shorthandToken;

                }).catch((err) => {
                    console.error(err);
                    shorthandTokenPlace.value = "Error";
                });
            });

            copyShorthandToken.addEventListener("click", () => {
                shorthandTokenPlace.select();
                shorthandTokenPlace.setSelectionRange(0, 99999);
                navigator.clipboard.writeText(shorthandTokenPlace.value);
            });

        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
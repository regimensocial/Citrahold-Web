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
            const dashboardPage = document.querySelector("#dashboard");
            dashboardPage.style.display = "block";

            const savesGames = document.querySelector("#savesGames");
            const extdataGames = document.querySelector("#extdataGames");
            const refreshButton = document.querySelector("#refreshButton");

            const cancelDeleteButton = document.querySelector("#cancelDelete");
            const confirmDeleteButton = document.querySelector("#confirmDelete");
            const deleteGameIDPlace = document.querySelector("#deleteGameID");

            cancelDeleteButton.addEventListener("click", () => {
                displayPopUp(false);
            });


            let activeGameID = "";
            let activeGameIDIsExtdata = false;
            confirmDeleteButton.addEventListener("click", () => {
                citrahold.deleteGame(
                    activeGameIDIsExtdata,
                    activeGameID
                ).then((res) => {
                    displayPopUp(false);
                    refresh();
                }).catch((err) => {
                    console.error(err);
                });
            });

            let saves = [];
            let extdata = [];


            const popUp = document.querySelector(".popupBox");
            const dimBg = document.querySelector("#dim");
            
            function displayPopUp(shouldDisplay) {
                if (shouldDisplay) {
                    popUp.style.display = "block";
                    dimBg.style.display = "block";
                } else {
                    popUp.style.display = "none";
                    dimBg.style.display = "none";
                }
            }

            function update(fileToUpdate, slot) {

                citrahold.getFiles((fileToUpdate === extdataGames)).then((files) => {
                    fileToUpdate.innerHTML = "";
                    slot = [];
                    console.log(files);
                    files.forEach(game => {
                        const tr = document.createElement("tr");

                        const td1 = document.createElement("td");

                        const inputText = document.createElement("input");
                        inputText.type = "text";
                        inputText.value = game[0];

                        slot.push(game[0]);

                        td1.appendChild(inputText);

                        const td2 = document.createElement("td");
                        td2.innerHTML = (new Date(game[1])).toLocaleString();

                        const td3 = document.createElement("td");
                        const updateButton = document.createElement("button");

                        inputText.addEventListener("input", (e) => {
                            handleGameIDChange(e, game[0], updateButton, slot);
                        });

                        updateButton.innerHTML = "Update";
                        updateButton.addEventListener("click", () => {
                            handleGameIDSubmit((fileToUpdate === extdataGames), game[0], inputText.value);
                        });
                        updateButton.disabled = true;
                        td3.appendChild(updateButton);

                        const deleteButton = document.createElement("button");
                        deleteButton.innerHTML = "Delete";
                        deleteButton.addEventListener("click", () => {
                            if (inputText.value.trim().length > 0) {
                                inputText.value = "";
                                updateButton.disabled = false;
                            } else {
                                inputText.value = game[0];
                                updateButton.disabled = true;
                            }
                        });

                        const downloadButton = document.createElement("button");
                        downloadButton.innerHTML = "Download";

                        downloadButton.addEventListener("click", () => {
                            citrahold.downloadSave(
                                (fileToUpdate === extdataGames),
                                game[0]
                            );
                        });

                        td3.appendChild(deleteButton);
                        td3.appendChild(downloadButton);

                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        tr.appendChild(td3);

                        fileToUpdate.appendChild(tr);
                        console.log(slot);
                    });
                }).catch((err) => {
                    console.error(err);
                });
            }

            function handleGameIDChange(e, currentGameID, button, slot) {
                if (e.target.value.trim() !== currentGameID.trim() && !(slot.includes(e.target.value.trim()))) {
                    button.disabled = false;
                } else {
                    button.disabled = true;
                }
            }

            function handleGameIDSubmit(isExtdata, prevGameID, newGameID) {

                if (newGameID.length == 0) {

                    deleteGameIDPlace.innerHTML = prevGameID;
                    displayPopUp(true);
                    activeGameID = prevGameID;
                    activeGameIDIsExtdata = isExtdata;

                } else {

                    citrahold.renameGame(
                        isExtdata,
                        prevGameID,
                        newGameID
                    ).then((res) => {
                        refresh();
                    }).catch((err) => {
                        console.error(err);
                    })
                }
            }

            function refresh() {
                update(savesGames, saves);
                update(extdataGames, extdata);
            }

            refreshButton.addEventListener("click", refresh);

            refresh();
        }
    }).catch((err) => {
        console.error(err);
        if (!citrahold.areWeOnline()) window.location.href = "/serverStatus.html";
    });
});
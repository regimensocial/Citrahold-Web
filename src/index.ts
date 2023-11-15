import axios from "axios";
import { downloadZip, makeZip } from "client-zip";

var serverAddress = "";

var production = false;

let online = false;
let loggedIn = false;

axios.defaults.withCredentials = true;

type userInfoType = {
    email: string,
    id: string,
    directorySize: number,
    
}

type serverResponse = {
    userID: string,
    user: userInfoType,
    token: string,
    shorthandToken: string,
    error: string,
    success: boolean | string, //?
    exists: boolean,
    saves: Array<string>,
    games: Array<string>,
    files: Array<string>,
    webStatus: string,
    note: string,
    maxUserDirSize: number
}

let userInfo: userInfoType;
let maxUserDirSize = 0;

const handleRequest = (action: string, data: object, res: Function, rej: Function, downloadingBinary: boolean = false) => axios.post(
    `${serverAddress}/${action}`,
    data,
    {
        withCredentials: true,
        responseType: downloadingBinary ? "blob" : "json",
        headers: { 'Content-Type': 'application/json' }
    }).then((r) => {
        if (!production) {
            console.log(r.data);
        }
        res(r.data)
    }).catch((r) => {
        rej(r);
    });

const getTokenFromShorthand = (shorthandToken: string): Promise<string> => {
    return new Promise((finalResolve, finalReject) => {
        (new Promise((resolve, reject) => {
            handleRequest("getToken", {
                shorthandToken
            }, resolve, reject);
        })).then((r: serverResponse) => {
            finalResolve(r.token);
        }).catch((r) => {
            finalReject(
                r.response.data
            );
        })
    });
}

const citrahold = {
    setServerAddress: (address: string) => {
        serverAddress = address;
        // this is some of my best work for sure
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("areyouawake", {}, resolve, reject);
            })).then((r: serverResponse) => {
                online = true;
                if (r.user) {
                    userInfo = r.user;
                    loggedIn = true;
                }
                maxUserDirSize = r.maxUserDirSize;

                finalResolve(loggedIn);

            }).catch((r) => {
                online = false;
                finalReject(r);
            });
        });
    },

    getMaxUserDirSize: () => {
        return maxUserDirSize;
    },

    getUserInfo: () => {
        return userInfo;
    },

    verifyEmail: (userID: string, code: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                // Server will let us login
                handleRequest("verifyEmail", {
                    userID,
                    code
                }, resolve, reject);
            })).then((r: serverResponse) => {
                if (r.token) {
                    (new Promise((resolve, reject) => {
                        handleRequest("setTokenCookie", {
                            token: r.token
                        }, resolve, reject);
                    }))
                } else {
                    finalReject(
                        r
                    );
                }
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            }).then((r) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            });
        })
    },

    register: (email: string, password: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("register", {
                    email,
                    password
                }, resolve, reject);
            })).then((r: serverResponse) => {
                (new Promise((resolve, reject) => {

                    if (r.token) {
                        // Server will let us login
                        handleRequest("setTokenCookie", {
                            token: r.token
                        }, resolve, reject);
                    } else if (r.userID) {
                        // Server wants us to verify our email
                        finalResolve({
                            userID: r.userID
                        })

                    }


                })).then((r) => {
                    finalResolve(true);
                }).catch((r) => {
                    finalReject(
                        r.response.data
                    );
                })
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },


    getTokenFromShorthand,

    loginWithShorthandToken: (shorthandToken: string) => {
        return new Promise((finalResolve, finalReject) => {
            getTokenFromShorthand(shorthandToken).then((token: string) => {
                (new Promise((resolve, reject) => {
                    handleRequest("setTokenCookie", {
                        token
                    }, resolve, reject);
                })).then((r) => {
                    finalResolve(true);

                }).catch((r) => {
                    finalReject(
                        r.response.data
                    );
                })
            }).catch((r) => {
                finalReject(
                    r.response
                );
            });
        });
    },

    getFiles: (extdata: boolean = false, game: string = "") => {
        var pageAddress = !extdata ? "getSaves" : "getExtdata";
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest(pageAddress, {
                    game,
                    forWeb: true
                }, resolve, reject);
            })).then((r: serverResponse) => {

                // sort r.games by lastUpload

                r.games.sort((a: any, b: any) => {
                    var dateA: Date = new Date(a[1]);
                    var dateB: Date = new Date(b[1]);

                    return dateB.getTime() - dateA.getTime();
                });

                finalResolve(r.games);

            }).catch((r) => {
                finalReject(r.response.data);
            })
        });
    },
    renameGame: (extdata: boolean = false, oldName: string, newName: string) => {
        var pageAddress = !extdata ? "renameSaves" : "renameExtdata";
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest(pageAddress, {
                    game: oldName,
                    newGame: newName
                }, resolve, reject);
            })).then((r: serverResponse) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(r.response.data);
            })
        });
    },
    deleteGame: (extdata: boolean = false, game: string) => {
        var pageAddress = !extdata ? "deleteSaves" : "deleteExtdata";
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest(pageAddress, {
                    game
                }, resolve, reject);
            })).then((r: serverResponse) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(r.response.data);
            })
        });
    },
    downloadSave: (extdata: boolean = false, game: string) => {
        var pageAddress = !extdata ? "downloadSaves/" : "downloadExtdata/";

        (new Promise((resolve, reject) => {
            handleRequest(pageAddress, {
                game
            }, resolve, reject);
        })).then(async (r: serverResponse) => {

            var downloadedFiles = [] as Array<{ name: string, input: any }>;
            var promises = [] as Array<Promise<any>>;

            r.files.forEach((file: string) => {
                const promise = new Promise((resolve, reject) => {
                    handleRequest(pageAddress, { game, file }, resolve, reject, true);
                }).then((response: any) => {
                    console.log(response);
                    downloadedFiles.push({
                        name: file,
                        input: response
                    });
                }).catch((error) => {
                    console.error(error.response.data);
                });

                promises.push(promise);
            });

            await Promise.all(promises);

            const blob = await downloadZip(downloadedFiles).blob();
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = game + ".zip";
            link.click()
            link.remove()


        }).catch((r) => {
            console.error(r);
        })

    },
    doesShorthandTokenExist: (shorthandToken: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("checkShorthandTokenExists", {
                    shorthandToken
                }, resolve, reject);
            })).then((r: serverResponse) => {
                finalResolve(r.exists);
            }).catch((r) => {
                finalReject(
                    false
                );
            })
        });
    },
    getShorthandToken: () => {

        return new Promise((finalResolve, finalReject) => {
            if (!loggedIn) {
                finalReject("Not logged in");
            } else {
                (new Promise((resolve, reject) => {
                    handleRequest("shorthandToken", {
                    }, resolve, reject);
                })).then((r: serverResponse) => {
                    finalResolve(r.shorthandToken);
                }).catch((r) => {
                    finalReject(
                        r.response.data
                    );
                })
            }
        });

    },
    login: (email: string, password: string) => {
        return new Promise((finalResolve, finalReject) => {


            (new Promise((resolve, reject) => {
                handleRequest("getToken", {
                    email,
                    password
                }, resolve, reject);
            })).then((r: serverResponse) => {
                loggedIn = true;

                (new Promise((resolve, reject) => {
                    handleRequest("setTokenCookie", {
                        token: r.token
                    }, resolve, reject);
                })).then((r) => {
                    finalResolve(true);
                }).catch((r) => {
                    finalReject(
                        r.response.data
                    );
                })

            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })

        });
    },
    logout: () => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("deleteTokenCookie", {
                }, resolve, reject);
            })).then((r) => {
                loggedIn = false;
                finalResolve(true);
            }).catch((r) => {
                finalReject(false);
            })
        });
    },
    changeEmail: (password: string, newEmail: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("changeEmail", {
                    password,
                    email: newEmail
                }, resolve, reject);
            })).then((r: serverResponse) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },
    regenerateToken: (password: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("getToken", {
                    password,
                    email: userInfo.email,
                    new: true
                }, resolve, reject);
            })).then((r: serverResponse) => {
                loggedIn = true;

                (new Promise((resolve, reject) => {
                    handleRequest("setTokenCookie", {
                        token: r.token
                    }, resolve, reject);
                })).then((r) => {
                    finalResolve(true);
                }).catch((r) => {
                    finalReject(
                        r.response.data
                    );
                })

            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },
    deleteAccount: (password: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("deleteAccount", {
                    password
                }, resolve, reject);
            })).then((r) => {
                loggedIn = false;
                finalResolve(true);
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },
    forgotPassword: (email: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("forgotPassword", {
                    email
                }, resolve, reject);
            })).then((r) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },
    changePassword: (oldPassword: string, newPassword: string) => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("changePassword", {
                    password: oldPassword,
                    newPassword
                }, resolve, reject);
            })).then((r: serverResponse) => {
                finalResolve(true);
            }).catch((r) => {
                finalReject(
                    r.response.data
                );
            })
        });
    },
    setToken: (newToken: string) => {
        return new Promise((finalResolve, finalReject) => {


            (new Promise((resolve, reject) => {
                handleRequest("setTokenCookie", {
                    token: newToken
                }, resolve, reject);
            })).then((r) => {
                loggedIn = true;
                finalResolve(true);
            }).catch((r) => {
                loggedIn = false;
                finalReject(false);
            })

        });
    },
    areWeOnline: () => {
        return online;
    },
    retryLogin: () => {
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("getUserID", {}, resolve, reject);
            })).then((r) => {
                loggedIn = true;
                finalResolve(true);
            }).catch((r) => {
                loggedIn = false;
                finalResolve(false);
            })
        });
    },
    loggedIn: () => {
        return loggedIn;
    },
    getServerAddress: () => {
        return serverAddress;
    },
    helloWorld: () => {
        return "Hello World";
    }
}

export default citrahold;
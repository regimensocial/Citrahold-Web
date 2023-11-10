import axios from "axios";

var serverAddress = "";

var production = false;

let online = false;
let loggedIn = false;

axios.defaults.withCredentials = true;

var token = "unknown";

type serverResponse = {
    token: string,
    shorthandToken: string,
    error: string,
    success: boolean | string, //?
    exists: boolean
}

var handleRequest = (action: string, data: object, res: Function, rej: Function) => axios.post(
    `${serverAddress}/${action}`,
    data,
    {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    }).then((r) => {
        if (!production) {
            console.log(r.data);
        }
        res(r.data)
    }).catch((r) => {
        rej(r);
    });

const citrahold = {
    setServerAddress: (address: string) => {
        serverAddress = address;
        // this is some of my best work for sure
        return new Promise((finalResolve, finalReject) => {
            (new Promise((resolve, reject) => {
                handleRequest("areyouawake", {}, resolve, reject);
            })).then((r) => {
                online = true;
                (new Promise((resolve, reject) => {
                    handleRequest("getUserID", {
                        test: "test"
                    }, resolve, reject);
                })).then((r) => {
                    loggedIn = true;
                }).catch((r) => {
                    loggedIn = false;
                    finalResolve(false);
                }).then(() => {
                    finalResolve(true);
                });

            }).catch((r) => {
                online = false;
                finalReject(false);
            });
        });
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
    getTokenFromShorthand: (shorthandToken: string) => {
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
    setToken: (newToken: string) => {
        token = newToken;
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
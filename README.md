# Citrahold-Web
Citrahold-Web is the front-end for [Citrahold Server](https://github.com/regimensocial/Citrahold-Server).

It's not written with any proper framework because I just wanted to make a (fairly) clean static website.

I say this, but I am considering remaking it in Svelte... But we'll see...

**If you are planning on just using Citrahold, you can ignore this repo. You just need [Citrahold-3DS](https://github.com/regimensocial/Citrahold-3DS) and [Citrahold-PC](https://github.com/regimensocial/citraholdUI/)!**

## Setup


1. `npm install --global serve` 
2. `git clone https://github.com/regimensocial/Citrahold-Web.git`
3. `cd Citrahold-Web`
4. `npm i`
5. `cd server`
6. `npm i`

7. edit `config.json` to change `serverAddress` to wherever you're hosting Citrahold-Server. The default will likely be fine, but it depends if you've changed anything.

It might just be easier to change it to be insecure, especially if this is just on your local network and you trust everyone on it.

By default, the insecure port is 3000, so to do this, edit config.json to the following

```
{
    "serverAddress": "http://localhost:3000"
}
```

8. `cd ..`
9. `npm run buildAll`
10. `cd server/dist`
11. `serve . -p 3001` 

Running it on port 3001 means you won't have to edit anything in Citrahold-Server, as I've already allowed `http://localhost:3001` as an origin. You can change the origins in Citrahold-Server by going to the `config.json` there and adding to or modifying `allowedOrigins`.

Everything in server/dist is static and ready for hosting. 

This is done in an unusual way because `citrahold.js` is written in TypeScript and requires compilation first.

Citrahold Web deserves some TLC at some point

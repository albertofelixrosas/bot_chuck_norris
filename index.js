/*
    DOCUMENTATION
    https://discord.js.org/#/
*/
const discord = require('discord.js');
const config = require('./config.json');
const request = require('request');
const translatte = require('translatte');

const client = new discord.Client();
const urlJokeRandom = 'http://api.icndb.com/jokes/random';
const prefix = '$';
let requestArray = [];

function doRequest(url) {
    return new Promise(function (resolve, reject) {
        const requestConfig = {
            method: 'get',
            url: url,
            headers: {
                'accept-charset': 'utf-8',
                'content-type': 'application/json',
            },
            json: true,
        };
        request(requestConfig, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function translateText(textToTranslate, originalLanguage = 'en', languageToTranslate = 'es') {
    return new Promise(function (resolve, reject) {
        translatte(textToTranslate, { from: originalLanguage, to: languageToTranslate }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });
    });
}

client.on('ready', () => {
    console.log(`¡${client.user.tag} esta listo!`);
});

async function sendMessage(message) {
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(" ");
    const command = args.shift().toLowerCase();

    if (command === 'joke') {
        try {
            requestArray.push(message);
            if (requestArray.length === 1) {
                const requestPromise = await doRequest(urlJokeRandom);
                const englishJoke = requestPromise.value.joke.replace(/&quot;/g, '"');
                const spanishJoke = await translateText(englishJoke);
                requestArray.shift();
                message.reply(spanishJoke.text);
                if (requestArray.length > 0) {
                    sendMessage(requestArray.shift());
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

client.on('message', (message) => {
    sendMessage(message);
});

client.login(config.myToken);
const dotenv = require("dotenv");
const { getConfig } = require("./src/config");
const { startMonitor } = require("./src/twitter");
const { Client, GatewayIntentBits } = require("discord.js");
const { default: MessagesClient } = require("./node_modules/messages-web")
const perf = require('execution-time')();
const fs = require('fs')
dotenv.config();

const discordBotClient = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});
const config = getConfig();

const credentials = MessagesClient.loadCredentialFile('credentials.json')
const client = new MessagesClient({ credentials })

client.on('authenticated', async (service) => {
    await service.preloadMessageChannel(process.env.TARGET_NUMBER);
    console.log('Done Preloading!');

    discordBotClient.login(process.env.BOT_TOKEN);
    let sentCodes = []
    discordBotClient.once("ready", async () => {
        // Define an asynchronous loop function
        const checkPost = async () => {
            let sentCodes = []
            while (true) {

                const codes = await startMonitor(discordBotClient, config);
                perf.start();
                console.log("Received codes:", codes);

                if (!sentCodes.includes(codes)) {
                    await service.sendMessage(codes.toString());
                    const results = perf.stop();
                    console.log(results.time);  // in milliseconds    
                    sentCodes.push(codes);
                }

            }
        };

        // Start the asynchronous loop
        checkPost();
    });
});



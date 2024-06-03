const { Client } = require('discord.js-selfbot-v13');
const self_client = new Client();
const { sendEmbed, sendImageEmbed } = require("./webhook.js");
const { solveOCR } = require("./ocr");
const dotenv = require("dotenv");

dotenv.config();

const checkPost = async (channel, config, callback, service) => {
    console.log(`Monitoring Discord Channels... 🔎`);
    self_client.on("messageCreate", async (message) => {
        const sourceChannelEntry = config.discord.channels.find(entry => entry === message.channelId);

        if (sourceChannelEntry) {
            const codePattern = /text(?:ing)?\s+([\w!@#$%^&*()]+)\s+to\s+888(?:-)?222/i;
            let code;
            let content;
            if (message.content !== '') {
                content = `${message.content}`;
                // Check for attachments
                if (message.attachments.size > 0) {
                    // Include attachment URLs in the content
                    content += `\n${message.attachments.map(attachment => attachment.url).join('\n')}`;
                    const OCR_Text = await solveOCR(channel, message.attachments[0]);
                    const match = OCR_Text.match(codePattern)
                    code = match ? match[1] : null;
                    console.log("Code", code);
                }
                const match = content.match(codePattern);
                code = match ? match[1] : null;
                console.log("Code", code);
            }
            channel.send(content);
            callback(code, service);
        }
    });
};

const startMonitor = async () => {
    console.log("Starting discord monitor... ⚡");
    await self_client.login(process.env.DISCORD_TOKEN);
    // const channel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_DEST);
};

module.exports = { startMonitor, checkPost };

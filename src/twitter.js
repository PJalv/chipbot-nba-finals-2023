const { client } = require("./client.js");
const { sendEmbed, sendImageEmbed } = require("./webhook.js");
const { solveOCR } = require("./ocr");
const dotenv = require("dotenv");

dotenv.config();

const checkTweets = async (account, channel, config) => {
  console.log(`Monitoring @${account}... 🔎`);
  let tweetData;
  try {
    tweetData = await client.tweets.statusesUserTimeline({
      screen_name: account,
      count: 1,
      include_rts: false,
      exclude_replies: true,
      tweet_mode: 'extended' // Enable extended mode to get full tweet data
    });


    if (config.latestTweets[account] !== tweetData[0].id) {
      config.latestTweets[account] = tweetData[0].id;
      const tweet = tweetData[0];
      const codePattern = /text(?:ing)?\s+([\w!@#$%^&*()]+)\s+to\s+888(?:-)?222/i;
      let code;
      if (tweet.full_text) {
        const match = tweet.full_text.match(codePattern);
        code = match ? match[1] : null;

        console.log("Code:", code);
        await sendEmbed(channel, tweet);
      } else if (tweet.truncated && tweet.extended_tweet && tweet.extended_tweet.full_text) {
        const match = tweet.extended_tweet.full_text.match(codePattern);
        code = match ? match[1] : null;

        console.log("Code:", code);
        await sendEmbed(channel, tweet.extended_tweet);
      }

      if (tweet.extended_entities && tweet.extended_entities.media) {
        console.log("Image detected...");
        const OCR_Text = await solveOCR(process.env.DISCORD_CHANNEL_DEST, IMAGEURLHERE);
        const match = OCR_Text.match(codePattern)
        code = match ? match[1] : null;
        console.log("Code", code);
        await sendImageEmbed(channel, tweet);
      }
    }
  } catch (error) {
    console.log(error);
  }

  return code;
};

const startMonitor = async (discordClient, config) => {
  console.log("Starting twitter monitor... ⚡");
  const channel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_DEST);

  // Cache latest tweets initially
  for (const account of config.accounts) {
    try {
      const tweetData = await client.tweets.statusesUserTimeline({
        screen_name: account,
        count: 1,
        include_rts: false,
        exclude_replies: true,
      });
      config.twitter.latestTweets[account] = tweetData[0].id;
    } catch (error) {
      console.log(error);
    }
  }

  // Start monitoring
  const codePromise = new Promise((resolve) => {
    // Start monitoring
    let counter = 0;
    config.twitter.accounts.forEach((account) => {
      const refreshId = setInterval(async () => {
        console.log(`checking [${counter}]`)
        const code = await checkTweets(account, channel, config);
        counter++
        if (code) {
          console.log("Received code:", code);
          clearInterval(refreshId)
          resolve(code); // Resolve the promise with the code value
        }
      }, config.twitter.interval);

    });
  });

  // Wait for the promise to be resolved and access the code value
  const code = await codePromise;
  console.log("Received code in startMonitor:", code);

  return code

};

module.exports = { startMonitor };

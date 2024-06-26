const { MessageEmbed } = require("discord.js");

// Embed functions are here
const sendEmbed = async (channel, tweetData) => {
  const newTweetEmbed = new MessageEmbed()
    .setColor("#03bafc")
    .setTitle("Tweet URL")
    .setURL(
      `https://twitter.com/${tweetData.user.screen_name}/status/${tweetData.id_str}`
    )
    .setAuthor(
      `${tweetData.user.screen_name} - ${tweetData.user.followers_count} followers`
    )
    .setThumbnail(`${tweetData.user.profile_image_url}`)
    .addFields(
      { name: "**Content**", value: `${tweetData.text}` },
      {
        name: "**Details**",
        value: `Location: ${tweetData.user.location} \nDescription: ${tweetData.user.description}`,
      }
    )
    .setTimestamp()

  await channel.send(newTweetEmbed);
};

const sendImageEmbed = async (channel, tweetData) => {
  const newTweetEmbed = new MessageEmbed()
    .setColor("#03bafc")
    .setImage(tweetData.extended_entities.media[0].media_url)
    .setTimestamp()

  await channel.send(newTweetEmbed);
};

const sendOCREmbed = async (channel, OCR) => {
  const newTweetEmbed = new MessageEmbed()
    .setColor("#03bafc")
    .addField("**OCR**", OCR)
    .setTimestamp()

  console.log("OCR solved! Sent to discord.");
  await channel.send(newTweetEmbed);
};

module.exports = { sendEmbed, sendImageEmbed, sendOCREmbed };

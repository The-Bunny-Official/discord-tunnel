const discord = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const config = require("./config.json");

const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.DirectMessages,
    discord.GatewayIntentBits.MessageContent
  ],
  partials: [
      discord.Partials.DirectMessages, 
      discord.Partials.Message, 
  ]
});

const token = config.token;
const channel_id = config.channel;

async function sendMessage(content){
  const channel = await client.channels.fetch(channel_id);
  channel.send(content);
}

async function fetchMessages(){
  const channel = await client.channels.fetch(channel_id);
  const messages = await channel.messages.fetch();
  return messages;
}

async function sendTyping(){
  const channel = await client.channels.fetch(channel_id);
  await channel.sendTyping();
}

async function sendAttachment(file, filename){
  const channel = await client.channels.fetch(channel_id);
  const attachment = new AttachmentBuilder(file, { name: filename });
  await channel.send({files: [attachment]});
}

client.login(token);

module.exports.sendMessage = sendMessage;
module.exports.fetchMessages = fetchMessages;
module.exports.Client = client;
module.exports.sendTyping = sendTyping;
module.exports.sendAttachment = sendAttachment;
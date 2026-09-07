const { generateWAMessageFromContent, makeCacheableSignalKeyStore, encodeSignedDeviceIdentity, useMultiFileAuthState, fetchLatestversion, generateMessageID, prepareWAMessageMedia, PHONENUMBER_MCC, encodeWAMessage, makeWASocket, downloadMediaMessage, proto, jidDecode, delay } = require("@angstvorfrauen/baileys");
const moment = require("moment-timezone");
const NodeCache = require("node-cache");
const { Boom } = require("@hapi/boom");
const crypto = require("crypto");
const path = require("path");
const pino = require("pino");
const Jimp = require("jimp");
const os = require("os");
const fs = require("fs");
module.exports = async (nexusbot, m, chatUpdate) => {
  const message = m;
  m.id = m.key.id;
  m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
  m.chat = m.key.remoteJid;
  m.fromMe = m.key.fromMe;
  m.isGroup = m.chat.endsWith("@g.us");
  m.sender = nexusbot.decodeJid(m.fromMe && nexusbot.user.id || m.participant || m.key.participant || m.chat || "");
  if (m.isGroup) m.participant = nexusbot.decodeJid(m.key.participant) || "";
  function getTypeM(message) {
    const type = Object.keys(message);
    var restype =  (!["senderKeyDistributionMessage", "messageContextInfo"].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== "messageContextInfo" && type[1]) || type[type.length - 1] || Object.keys(message)[0];
    return restype;
  };
  m.mtype = getTypeM(m.message);
  m.msg = (m.mtype == "viewOnceMessage" ? m.message[m.mtype].message[getTypeM(m.message[m.mtype].message)] : m.message[m.mtype]);
  m.text = m.msg?.text  || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || "";
  const info = m;
  const from = message.key.remoteJid;
  var body = 
    (m.mtype === "interactiveResponseMessage") ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id:
    (m.mtype === "conversation") ? m.message.conversation :
    (m.mtype === "deviceSentMessage") ? m.message.extendedTextMessage.text :
    (m.mtype == "imageMessage") ? m.message.imageMessage.caption :
    (m.mtype == "videoMessage") ? m.message.videoMessage.caption : 
    (m.mtype == "extendedTextMessage") ? m.message.extendedTextMessage.text : 
    (m.mtype == "buttonsResponseMessage") ? m.message.buttonsResponseMessage.selectedButtonId : 
    (m.mtype == "listResponseMessage") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
    (m.mtype == "templateButtonReplyMessage") ? m.message.templateButtonReplyMessage.selectedId : 
    (m.mtype == "messageContextInfo") ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : "";
  const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
      i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : "";
    };
    return admins || [];
  };
  const sleep = async (ms) => { return new Promise(resolve => setTimeout(resolve, ms))};
  const budy = (typeof m.text === "string" ? m.text : "");
  const bardy = body || "";
  const prefixes = [".", "!"];
  const isCmd = prefixes.some(p => bardy.startsWith(p));
  const prefix = isCmd ? bardy.charAt(0) : "";
  const command = isCmd ? bardy.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
  const quoted = m.quoted ? m.quoted : m;
  const sender = info.key.fromMe ? (nexusbot.user.id.split(":")[0]+"@s.whatsapp.net" || nexusbot.user.id) : (info.key.participant || info.key.remoteJid)
  let groupMetadata = null;
  let participants = [];
  if (m.isGroup && from.endsWith("@g.us")) {
    try {
      groupMetadata = await nexusbot.groupMetadata(from);
      participants = groupMetadata?.participants || [];
    } catch (err) {
      participants = [];
    }
  } else {
    participants = [];
  };
  const botNumber = await nexusbot.decodeJid(nexusbot.user.id);
  const device = "" + (info.key.id.length > 21 ? "Android" : info.key.id.substring(0, 2) == "2A" ? "Ios": "Web ore Api ore Bot");
  const date = moment.tz("Europe/Berlin").format("DD/MM/YY");
  const time = moment.tz("Europe/Berlin").format("HH:mm:ss");
  const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
  const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
  const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
  const groupName = m.isGroup ? groupMetadata?.subject : "";
  const mime = (quoted.msg || quoted).mimetype || "";
  const args = bardy.trim().split(/ +/).slice(1);
  const isBot = info.key.fromMe ? true : false;
  const username = m.pushName || "No Name";
  const content = JSON.stringify(m.message);
  const isGroup = from.endsWith("@g.us");
  const sJid = "status@broadcast";
  const text = args.join(" ");
  const q = args.join(" ");
  const reply = (text) => {
    nexusbot.sendMessage(from, {
    text: text,
    mentions: [sender]
    }, { quoted: info }
    )
  }
  nexusbot.sendjson = (jidss, jsontxt = {}, outrasconfig = {}) => {
    const allmsg = generateWAMessageFromContent(jidss, jsontxt, outrasconfig);
    return nexusbot.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.id });
  };
  switch(command) {
    case "info": {
      if (!isBot) return;
      const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage || { "conversation": "no quoted" }
      await reply(JSON.stringify(quotedMsg, null, 4));
    }
    break;
  }
}
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  delete require.cache[file];
  require(file);
});
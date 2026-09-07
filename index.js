const { makeWASocket, useMultiFileAuthState, DisconnectReason, jidDecode } = require("@angstvorfrauen/baileys");
const gradient = require("gradient-string");
const Boom = require("@hapi/boom");
const readline = require("readline");
const figlet = require("figlet");
const path = require("path");
const pino = require("pino");
const os = require("os");
const fs = require("fs");
const interFace = { input: process.stdin, output: process.stdout };
const rl = readline.createInterface(interFace);
const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
let number = "0";
const pairingCode = !!number || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
figlet.text('Nexus\nClient', { font: 'Bloody' }, (err, data) => {
  const terminalWidth = process.stdout.columns || 80;
  const lines = data.split('\n');
  const centeredLines = lines.map(line => {
    const padding = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
    return ' '.repeat(padding) + line;
    }
  )
  console.log(gradient('blue', 'blue')(centeredLines.join('\n')));
  ['https://www.youtube.com/@nexusbota', 'https://instagram.com/@nexusbota', 'MadeBynexusbot\n'].forEach(text => {
    const padding = Math.max(0, Math.floor((terminalWidth - text.length) / 2));
    console.log(gradient('blue', 'blue')(' '.repeat(padding) + text));
    }
  );
async function botcon() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const WA_VERSI = [2, 3000, 1041846606];
    const nexusbot = makeWASocket({
        version: WA_VERSI,
        printQRInTerminal: false,
        auth: state,
        logger: pino({ level: "silent" })
    });
    if (!nexusbot.authState.creds.registered) {
        const numin = await question(gradient('blue', 'blue')("Number: "));
        const number = numin.replace(/[^0-9]/g, "");
        const codereq = await nexusbot.requestPairingCode(number, "AAAAAAAA");
        const code = codereq?.match(/.{1,4}/g)?.join("-") || codereq;
        console.log(gradient("blue", "blue")("=============================="));
        console.log(gradient("blue", "blue")("> Number: ") + gradient("magenta", "magenta")(number));
        console.log(gradient("blue", "blue")("> Code: ") + gradient("magenta", "magenta")(code));
        console.log(gradient("blue", "blue")("=============================="));
    }
    nexusbot.ev.on("messages.upsert", async chatUpdate => {
        let msg = chatUpdate.messages[0];
        if (!msg.message) return;
        msg = (Object.keys(msg.message)[0] === "ephemeralMessage") ? { ...msg, message: msg.message.ephemeralMessage.message } : msg;
        if (msg.key && msg.key.remoteJid === "status@broadcast") return;
        if (msg.key.id.startsWith("BAE5")) return;
        require("./cmd.js")(nexusbot, msg, chatUpdate);
    });
    nexusbot.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return ( decode.user && decode.server ? `${decode.user}@${decode.server}`: jid );
        } else {
        return jid;
        }
    };
    nexusbot.public = true;
    nexusbot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
        const reason = Boom.boomify(lastDisconnect?.error)?.output.statusCode;
        const reconnectReasons = [
        DisconnectReason.badSession,
        DisconnectReason.connectionClosed,
        DisconnectReason.connectionLost,
        DisconnectReason.connectionReplaced,
        DisconnectReason.loggedOut,
        DisconnectReason.restartRequired,
        DisconnectReason.timedOut
        ];
        if (reconnectReasons.includes(reason)) botcon();
    }
    });
    nexusbot.ev.on("creds.update", saveCreds);
    return nexusbot;
}
botcon()});
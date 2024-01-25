import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = '939804369:AAEw200332QILe8MdVtqrqVrsuJwT05hY3I';
export const bot = new TelegramBot(BOT_TOKEN);
console.log("bot", BOT_TOKEN);

export const history = [];
bot.on("message", async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, msg.text + ", and?");
        history.push({ when: new Date(), msg });
    } catch (e) {
        console.error(e);
    }
});

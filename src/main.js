import { Telegraf, session } from "telegraf";
import { code } from "telegraf/format";
import { message } from "telegraf/filters";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import dotenv from "dotenv";
dotenv.config();

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session());

bot.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Чекаю на ваше нове питання");
});

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Чекаю на ваше нове питання");
});

bot.on(message("voice"), async (ctx) => {
  ctx.session = ctx.session ?? INITIAL_SESSION;
  try {
    await ctx.reply(code("Чекаю відповідь від сервера..."));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запит: ${text}`));

    ctx.session.messages.push({ role: openai.roles.USER, content: text });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.error("Error while processing voice message", e);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session = ctx.session ?? INITIAL_SESSION;
  try {
    await ctx.reply(code("Чекаю відповідь від сервера..."));

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.error("Error while processing text message", e);
  }
});

try {
  await bot.launch();
} catch (error) {
  console.error('Error occurred while launching the bot', error);
}

process.once("SIGINT", () => bot.stop("SIGINT")); // потрібно для того щоб зупинити бота за подією 'SIGINT'
process.once("SIGTERM", () => bot.stop("SIGTERM")); // потрібно для того щоб зупинити бота за подією 'SIGTERM'


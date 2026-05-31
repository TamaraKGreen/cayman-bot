// 🌴 Cayman Islands Countdown Bot
// Requirements: Node.js 18+, discord.js v14
// Install: npm install discord.js

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TOKEN = process.env.TOKEN;         // From Discord Developer Portal
const CHANNEL_ID = const CHANNEL_ID = process.env.CHANNEL_ID;   // Right-click channel → Copy ID
const EVENT_DATE = new Date("2026-09-03T00:00:00");  // 🗓️ Change this!
const EVENT_NAME = "Grand Cayman Getaway 🌴";

// How often to post an update (in milliseconds). Default = every hour.
const UPDATE_INTERVAL_MS = 10 * 60 * 1000;
// ───────────────────────────────────────────────────────────────────────────

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function getCountdown() {
  const now = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) return null; // Event has passed

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, diff };
}

function getVibeMessage(days) {
  if (days > 60)  return { msg: "Mark your calendars and get excited! ☀️",          color: 0x1D9E75 };
  if (days > 30)  return { msg: "Start planning your beach outfits! 👙🩴",           color: 0x5DCAA5 };
  if (days > 14)  return { msg: "Two weeks away — almost time to pack! 🧳",          color: 0xEF9F27 };
  if (days > 7)   return { msg: "One week to go — can you feel the sea breeze? 🌊",  color: 0xEF9F27 };
  if (days > 3)   return { msg: "Almost there! Sunscreen packed? 🏖️",               color: 0xD85A30 };
  if (days > 1)   return { msg: "DAYS AWAY. Time to stress-test your swimsuit! 🤿", color: 0xD85A30 };
  if (days === 1) return { msg: "TOMORROW. Sleep is optional. 🎉",                  color: 0xE24B4A };
  return           { msg: "TODAY IS THE DAY. Let's GO! 🥂🌴⛵",                      color: 0xE24B4A };
}

function buildEmbed() {
  const countdown = getCountdown();

  if (!countdown) {
    return new EmbedBuilder()
      .setColor(0x1D9E75)
      .setTitle("🎉 We made it to the Caymans!")
      .setDescription("Hope everyone's enjoying those crystal-clear waters. 🌊")
      .setFooter({ text: "See you next time! 🌴" });
  }

  const { days, hours, minutes, seconds } = countdown;
  const { msg, color } = getVibeMessage(days);

  const countdownStr = [
    `> 🗓️  **${days}** days`,
    `> ⏰  **${hours}** hours`,
    `> ⏱️  **${minutes}** minutes`,
    `> ⚡  **${seconds}** seconds`,
  ].join("\n");

  const eventDateStr = EVENT_DATE.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`🌴 ${EVENT_NAME} Countdown`)
    .setDescription(`**${msg}**\n\n${countdownStr}`)
    .addFields(
      { name: "📍 Destination", value: "Grand Cayman, Cayman Islands",  inline: true },
      { name: "📅 Event date",  value: eventDateStr,                    inline: true },
    )
    .setFooter({ text: "Updated every hour • Pack sunscreen, not umbrellas ☀️" })
    .setTimestamp();
}

async function postCountdown() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel?.isTextBased()) return console.error("Channel not found or not text-based.");
    await channel.send({ embeds: [buildEmbed()] });
    console.log(`[${new Date().toISOString()}] Countdown posted!`);
  } catch (err) {
    console.error("Failed to post countdown:", err);
  }
}

// ─── SLASH COMMANDS ─────────────────────────────────────────────────────────
// Use /countdown anywhere in the server for an instant update

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "countdown") return;

  await interaction.reply({ embeds: [buildEmbed()], ephemeral: false });
});

// ─── BOOT ───────────────────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Register /countdown slash command
  await client.application.commands.create({
    name: "countdown",
    description: `Show the countdown to ${EVENT_NAME}`,
  });

  // Post immediately on startup, then on interval
  await postCountdown();
  setInterval(postCountdown, UPDATE_INTERVAL_MS);
});

client.login(TOKEN);

/**
 * ============================================================================
 * 🌱 زنوسلایف (ZenOsLife) - Calendar, Reminders & Smart Alarms Engine
 * ============================================================================
 */

const crypto = require('crypto');
const { db, saveDb, getUser } = require('../../shared/db');
const { callTgApi } = require('../../shared/telegram');

async function addReminder(userId, title, timeStr, dateStr = null) {
  db.reminders = db.reminders || [];
  const reminder = {
    id: crypto.randomUUID(),
    userId: String(userId),
    title,
    time: timeStr,
    date: dateStr || new Date().toISOString().slice(0, 10),
    completed: false,
    notified: false,
    createdAt: Date.now()
  };
  db.reminders.push(reminder);
  saveDb();
  return reminder;
}

function checkDueReminders(botToken) {
  if (!db.reminders || db.reminders.length === 0) return;

  const now = new Date();
  const tehranTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);

  const tehranDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran'
  }).format(now);

  for (const rem of db.reminders) {
    if (rem.completed || rem.notified) continue;

    if (rem.date === tehranDate && rem.time === tehranTime) {
      rem.notified = true;
      saveDb();

      callTgApi(botToken, 'sendMessage', {
        chat_id: rem.userId,
        text: `⏰ <b>یادآور اختصاصی زنوسلایف!</b>\n\n📌 <b>عنوان:</b> ${rem.title}\n🕒 <b>ساعت:</b> ${rem.time}\n📅 <b>تاریخ:</b> ${rem.date}`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ انجام شد', callback_data: `complete_rem_${rem.id}` }],
            [{ text: '⏳ ۱۰ دقیقه بعد یادآوری کن', callback_data: `snooze_rem_${rem.id}` }]
          ]
        }
      }).catch(() => {});
    }
  }
}

async function handleCompleteReminder(botToken, userId, remId) {
  const rem = (db.reminders || []).find(r => r.id === remId);
  if (rem) {
    rem.completed = true;
    saveDb();
    return callTgApi(botToken, 'sendMessage', {
      chat_id: userId,
      text: `✅ تسک «<b>${rem.title}</b>» با موفقیت انجام شد!`
    });
  }
}

async function handleSnoozeReminder(botToken, userId, remId) {
  const rem = (db.reminders || []).find(r => r.id === remId);
  if (rem) {
    const parts = rem.time.split(':');
    let m = parseInt(parts[1], 10) + 10;
    let h = parseInt(parts[0], 10);
    if (m >= 60) {
      m -= 60;
      h = (h + 1) % 24;
    }
    rem.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    rem.notified = false;
    saveDb();

    return callTgApi(botToken, 'sendMessage', {
      chat_id: userId,
      text: `⏳ یادآور برای ساعت <b>${rem.time}</b> تمدید شد.`
    });
  }
}

module.exports = {
  addReminder,
  checkDueReminders,
  handleCompleteReminder,
  handleSnoozeReminder
};

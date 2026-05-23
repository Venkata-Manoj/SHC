import cron from 'node-cron';
import axios from 'axios';
import Hackathon from '../models/Hackathon.js';

async function checkLinks() {
  const hackathons = await Hackathon.find({
    registrationLinkOverride: false,
    deletedAt: null,
  });

  for (const h of hackathons) {
    try {
      const res = await axios.head(h.registrationLink, { timeout: 10000 });
      if (h.isRegistrationLinkBroken && res.status < 400) {
        h.isRegistrationLinkBroken = false;
        await h.save();
      }
    } catch {
      if (!h.isRegistrationLinkBroken) {
        h.isRegistrationLinkBroken = true;
        await h.save();
      }
    }
  }
}

async function autoArchive() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await Hackathon.updateMany(
    { endDate: { $lt: sixMonthsAgo }, isArchived: false, deletedAt: null },
    { $set: { isArchived: true, archivedAt: new Date() } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Auto-archived ${result.modifiedCount} old hackathon(s)`);
  }
}

export function startLinkChecker() {
  cron.schedule('0 0 * * *', checkLinks);
  cron.schedule('0 1 * * *', autoArchive);
  console.log('Link checker & auto-archive scheduler started (daily)');
}

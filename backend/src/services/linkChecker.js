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

export function startLinkChecker() {
  cron.schedule('0 0 * * *', checkLinks);
  console.log('Link checker scheduled (daily at midnight)');
}

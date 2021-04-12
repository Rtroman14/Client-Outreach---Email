require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const MailShakeApi = require("./src/Mailshake");
const AirtableApi = require("./src/Airtable");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const { liveCampaigns, campaignsToRun, mapContact, campaignsDueToday } = require("./src/helpers");

(async () => {
    try {
        const prospects = await Airtable.hasProspects("appPfAkOluijuGY1T", "First Lines");

        console.log(prospects);
    } catch (error) {
        console.log(error);
    }
})();

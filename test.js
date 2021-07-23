require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const MailShakeApi = require("./src/Mailshake");
const AirtableApi = require("./src/Airtable");
const HighlevelApi = require("./src/Highlevel");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const { liveCampaigns, campaignsToRun, mapContact, campaignsDueToday } = require("./src/helpers");

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let campaigns = liveCampaigns(getCampaigns);
        campaigns = campaignsDueToday(campaigns);
        campaigns = campaignsToRun(campaigns);

        const campaign = campaigns[0];

        const Highlevel = new HighlevelApi(campaign["API Token"]);
        const contact = await Airtable.getContact(campaign["Base ID"], "recG2JDY1LRzBzMcf");

        // const highlevelContact = await Highlevel.makeHighlevelContact(contact);
    } catch (error) {
        console.log(error);
    }
})();

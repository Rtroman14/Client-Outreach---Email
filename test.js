require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const MailShakeApi = require("./src/Mailshake");
const AirtableApi = require("./src/Airtable");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const { liveCampaigns, campaignsToRun, mapContact, campaignsDueToday } = require("./src/helpers");

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let campaigns = liveCampaigns(getCampaigns);
        campaigns = campaignsDueToday(campaigns);
        campaigns = campaignsToRun(campaigns).map((campaign) => ({
            // client: campaign.Client,
            campaign: campaign.Campaign,
        }));

        console.log(campaigns);
    } catch (error) {
        console.log(error);
    }
})();

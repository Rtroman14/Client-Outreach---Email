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
        campaigns = campaignsToRun(campaigns);

        campaigns = campaigns.filter((campaign) => campaign.Client === "Sunshine Property Group");

        for (let campaign of campaigns) {
            let view = "First Lines";

            if ("Tag" in campaign) {
                view = `First Lines - ${campaign.Tag}`;
            }

            const contacts = await Airtable.getContacts(campaign["Base ID"], view);

            if (contacts) {
                const Mailshake = new MailShakeApi(campaign["API Token"]);

                // format contacts for mailshake
                const mailshakeContacts = mapContact(contacts);

                await Mailshake.addToCampaign(campaign["Campaign ID"], mailshakeContacts);

                await Airtable.updateCampaign(campaign.recordID, { "Last Updated": today });

                const updatedFields = {
                    "In Campaign": true,
                    Campaign: campaign.Campaign,
                };

                for (let contact of contacts) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 500);
                    });

                    await Airtable.updateContact(
                        campaign["Base ID"],
                        contact.recordID,
                        updatedFields
                    );
                }

                console.log(
                    `Client: ${campaign.Client} | Campaign: ${campaign.Campaign} - SUCCESS`
                );
            } else {
                // update campaign
                await Airtable.updateCampaign(campaign.recordID, {
                    "Campaign Status": "Need More Contacts",
                    "Last Updated": today,
                });

                console.log(
                    `Client: ${campaign.Client} | Campaign: ${campaign.Campaign} - Need More Contacts`
                );
            }
        }
    } catch (error) {
        console.log("CLIENTOUTREACH ---", error);
    }
})();

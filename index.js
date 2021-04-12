require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const MailShakeApi = require("./src/Mailshake");
const AirtableApi = require("./src/Airtable");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const { liveCampaigns, campaignsToRun, mapContact, campaignsDueToday } = require("./src/helpers");

exports.clientOutreachEmail = async (req, res) => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let campaigns = liveCampaigns(getCampaigns);
        campaigns = campaignsDueToday(campaigns);
        campaigns = campaignsToRun(campaigns);

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
            } else {
                // update campaign
                await Airtable.updateCampaign(campaign.recordID, {
                    "Campaign Status": "Need More Contacts",
                    "Last Updated": today,
                });
            }
        }

        res.status(200).send(campaigns);
    } catch (error) {
        res.status(500).send(error);

        console.log("CLIENTOUTREACH ---", error);
    }
};

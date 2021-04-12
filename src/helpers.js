const moment = require("moment");
const today = moment(new Date()).format("YYYY-MM-DD");

module.exports = {
    async minutesWait(minutes) {
        return await new Promise((resolve) => {
            setTimeout(resolve, 60000 * minutes);
        });
    },

    liveCampaigns(campaigns) {
        return campaigns.filter((campaign) => {
            if (
                "Campaign Status" in campaign &&
                "Base ID" in campaign &&
                "API Token" in campaign &&
                "Campaign ID" in campaign
            ) {
                if (campaign["Campaign Status"] === "Live") {
                    return campaign;
                }
            }
        });
    },

    campaignsDueToday(campaigns) {
        return campaigns.filter((campaign) => {
            if (!("Last Updated" in campaign)) {
                return campaign;
            }

            if ("Last Updated" in campaign && moment(campaign["Last Updated"]).isBefore(today)) {
                return campaign;
            }
        });
    },

    campaignsToRun(campaigns) {
        let activeCampaigns = [];

        // campaigns = this.liveCampaigns(campaigns);
        // campaigns = this.campaignsDueToday(campaign);

        let clients = campaigns.map((campaign) => campaign.Client);

        let individualClients = new Set(clients);

        individualClients.forEach((client) => {
            // new array of client's campaigns
            const clientCampaigns = campaigns.filter((campaign) => campaign.Client === client);

            // add campaign if only one
            if (clientCampaigns.length < 2) {
                activeCampaigns.push(clientCampaigns[0]);
            } else {
                // add Type === "Specific" campaigns
                clientCampaigns.forEach((campaign) => {
                    if ("Type" in campaign && campaign.Type === "Specific") {
                        activeCampaigns.push(campaign);
                    }
                });

                // campaigns without tag
                let alternateCampaigns = clientCampaigns.filter((campaign) => {
                    if (!("Tag" in campaign)) {
                        return campaign;
                    }
                });

                // campaigns with tag
                let alternateCampaignTags = clientCampaigns.filter((campaign) => {
                    if ("Tag" in campaign && !("Type" in campaign)) {
                        return campaign;
                    }
                });

                // !!IMPORTANT - need to check if "Last Update" is empty and add that campaign

                // add campaign with furthest date
                const [nextCampaign] = alternateCampaigns.sort(
                    (a, b) => new Date(a["Last Updated"]) - new Date(b["Last Updated"])
                );

                // add campaign with furthest date
                const [nextCampaignTag] = alternateCampaignTags.sort(
                    (a, b) => new Date(a["Last Updated"]) - new Date(b["Last Updated"])
                );

                nextCampaign && activeCampaigns.push(nextCampaign);
                nextCampaignTag && activeCampaigns.push(nextCampaignTag);
            }
        });

        return activeCampaigns;
    },

    mapContact(contacts) {
        return contacts.map((contact) => {
            return {
                emailAddress: contact.email_first || contact.Email,
                fullName: contact.first_name || contact["First Name"],
                fields: {
                    city: contact.city || contact.City || "",
                    company:
                        contact.company_name || contact["Company Name"] || contact.Company || "",
                    "First Line": contact["First Line"] || contact["FIRST LINE"] || "",
                    job: contact.job_title || contact.Job || "",
                    "First Name": contact.first_name || contact["First Name"],
                    "Last Name": contact.last_name || contact["Last Name"],
                    "LinkedIn Page": contact.url || contact["LinkedIn Page"] || "",
                    recordID: contact.recordID,
                },
            };
        });
    },
};
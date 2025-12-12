const axios = require("axios");

async function blockDeviceOnRouter(mac) {
    if (!mac) return;

    try {
        await axios.post(process.env.ROUTER_URL + "/disconnect", {
            mac: mac,
            token: process.env.ROUTER_TOKEN
        });

        console.log("Device blocked:", mac);
    } catch (err) {
        console.error("Router block error:", err.message);
    }
}

module.exports = { blockDeviceOnRouter };
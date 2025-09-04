import cron from "node-cron";
import { updateMultipleSheets } from "#services/sheetService.js";
import { saveTariffs } from "#services/tariffsService.js";

const SHEET_IDS = [
    "1Hhie7Uh_jeaBz41EkSTxe6XdT1iQQLg6WRp6L0r1Hw8"
];

cron.schedule("0 * * * *", async () => {
    console.log("Fetching WB tariffs...");
    await saveTariffs();
    await updateMultipleSheets(SHEET_IDS);
});

await saveTariffs();
await updateMultipleSheets(SHEET_IDS);

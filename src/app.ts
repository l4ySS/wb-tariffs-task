import cron from "node-cron";
import { updateMultipleSheets } from "#services/sheetService.js";
import { saveTariffs } from "#services/tariffsService.js";
import { migrate, seed } from "#postgres/knex.js";

await migrate.latest();
await seed.run()

cron.schedule("0 * * * *", async () => {
    console.log("Fetching WB tariffs...");
    await saveTariffs();
    await updateMultipleSheets();
});

// Для теста при старте
await saveTariffs();
await updateMultipleSheets();

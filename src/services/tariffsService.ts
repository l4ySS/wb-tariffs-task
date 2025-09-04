import knex from "#postgres/knex.js";
import axios from "axios";

const WB_API_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";
const WB_TOKEN = process.env.WB_JWT_TOKEN;

if (!WB_TOKEN) {
    console.error("WB_JWT_TOKEN is not set in environment variables");
    process.exit(1);
}

/**
 * Функция для получения данных с API WB
 */
export async function fetchWbTariffs() {
    try {
        const today = new Date().toISOString().split("T")[0];

        const { data } = await axios.get(WB_API_URL, {
            headers: { Authorization: `Bearer ${WB_TOKEN}` },
            params: { date: today }
        });

        return data.response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("Error fetching WB tariffs:", err.message);
            if (err.response) {
                console.error("Response:", err.response.data);
            }
        } else {
            console.error("Unknown error fetching WB tariffs:", err);
        }
    }
}

/**
 * Функция для сохранения данных в БД
 */
export async function saveTariffs() {
    const parseNumber = (value?: string): number | null => {
        if (!value) return null;
        const parsed = parseFloat(value.replace(",", "."));
        return isNaN(parsed) ? null : parsed;
    };

    try {
        const tariffsData = await fetchWbTariffs();
        if (!tariffsData) return;

        const today = new Date().toISOString().split("T")[0];

        const [periodRow] = await knex("wb_tariff_periods")
            .insert({
                dt_next_box: tariffsData.dtNextBox,
                dt_till_max: tariffsData.dtTillMax,
                date_collected: today,
                updated_at: knex.fn.now(),
            })
            .onConflict("date_collected")
            .merge()
            .returning("id");

        const periodId = typeof periodRow === "object" ? periodRow.id : periodRow;

        for (const w of tariffsData.warehouseList) {
            await knex("wb_tariff_warehouses")
                .insert({
                    period_id: periodId,
                    geo_name: w.geoName,
                    warehouse_name: w.warehouseName,
                    box_delivery_base: parseNumber(w.boxDeliveryBase),
                    box_delivery_coef_expr: parseNumber(w.boxDeliveryCoefExpr),
                    box_delivery_liter: parseNumber(w.boxDeliveryLiter),
                    box_delivery_marketplace_base: parseNumber(w.boxDeliveryMarketplaceBase),
                    box_delivery_marketplace_coef_expr: parseNumber(w.boxDeliveryMarketplaceCoefExpr),
                    box_delivery_marketplace_liter: parseNumber(w.boxDeliveryMarketplaceLiter),
                    box_storage_base: parseNumber(w.boxStorageBase),
                    box_storage_coef_expr: parseNumber(w.boxStorageCoefExpr),
                    box_storage_liter: parseNumber(w.boxStorageLiter),
                })
                .onConflict(["period_id", "warehouse_name"])
                .merge();
        }

        console.log(`WB tariffs for ${today} have been updated`);
    } catch (err) {
        console.error("Error saving tariffs:", err);
    }
}

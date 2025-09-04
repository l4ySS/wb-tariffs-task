import { google } from "googleapis";
import knex from "#postgres/knex.js";

const credentialsBASE64 = process.env.GOOGLE_CREDENTIALS_BASE64;
if (!credentialsBASE64) {
  throw new Error("GOOGLE_CREDENTIALS_BASE64 is not set in environment variables");
}

const credentials = JSON.parse(
    Buffer.from(credentialsBASE64, "base64").toString("utf-8")
  );

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Обновление данных в одном листе Google Sheets
 */
export async function updateSheet(spreadsheetId: string, sheetName: string = "stocks_coefs") {
    
    const tariffs = await knex("wb_tariff_warehouses")
    .join(
        "wb_tariff_periods",
        "wb_tariff_warehouses.period_id",
        "wb_tariff_periods.id"
    )
    .select(
        "wb_tariff_periods.dt_next_box",
        "wb_tariff_periods.dt_till_max",
        "geo_name",
        "warehouse_name",
        "box_delivery_base",
        "box_delivery_coef_expr",
        "box_delivery_liter",
        "box_delivery_marketplace_base",
        "box_delivery_marketplace_coef_expr",
        "box_delivery_marketplace_liter",
        "box_storage_base",
        "box_storage_coef_expr",
        "box_storage_liter",
    )
    .orderByRaw("COALESCE(box_delivery_coef_expr, box_delivery_marketplace_coef_expr, box_storage_coef_expr) ASC NULLS LAST");

    const values = [
        [
            "Geo",
            "Warehouse",
            "Box Base",
            "Box Coef Expr",
            "Box Liter",
            "Box Marketplace Base",
            "Box Marketplace Coef Expr",
            "Box Marketplace Liter",
            "Box Storage Base",
            "Box Storage Coef Expr",
            "Box Storage Liter",
            "Dt Next Box",
            "Dt Till Max",
        ],
        ...tariffs.map(t => [
            t.geo_name,
            t.warehouse_name,
            t.box_delivery_base ?? "",
            t.box_delivery_coef_expr ?? "",
            t.box_delivery_liter ?? "",
            t.box_delivery_marketplace_base ?? "",
            t.box_delivery_marketplace_coef_expr ?? "",
            t.box_delivery_marketplace_liter ?? "",
            t.box_storage_base ?? "",
            t.box_storage_coef_expr ?? "",
            t.box_storage_liter ?? "",
            t.dt_next_box,
            t.dt_till_max,
        ])
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values }
    });

    console.log(`Sheet ${sheetName} updated: ${tariffs.length} rows`);
}

/**
 * Обновление множества таблиц по идентификаторам
 */
export async function updateMultipleSheets() {
    const rows = await knex("spreadsheets").select('spreadsheet_id');
    const spreadsheetIds = rows.map(row => row.spreadsheet_id);
    
    for (const id of spreadsheetIds) {
        await updateSheet(id);
    }
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([{ spreadsheet_id: "1Hhie7Uh_jeaBz41EkSTxe6XdT1iQQLg6WRp6L0r1Hw8" }])
        .onConflict(["spreadsheet_id"])
        .ignore();
}
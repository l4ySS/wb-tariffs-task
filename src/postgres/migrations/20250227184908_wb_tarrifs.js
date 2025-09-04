/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("wb_tariff_periods", (table) => {
      table.increments("id").primary();
      table.date("dt_next_box").notNullable();
      table.date("dt_till_max").notNullable();
      table.date("date_collected").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.unique(["date_collected"]);
    });
  
    await knex.schema.createTable("wb_tariff_warehouses", (table) => {
      table.increments("id").primary();
      table
        .integer("period_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("wb_tariff_periods")
        .onDelete("CASCADE");
      table.string("geo_name").notNullable();
      table.string("warehouse_name").notNullable();
      table.decimal("box_delivery_base", 10, 2);
      table.decimal("box_delivery_coef_expr", 10, 2);
      table.decimal("box_delivery_liter", 10, 2);
      table.decimal("box_delivery_marketplace_base", 10, 2);
      table.decimal("box_delivery_marketplace_coef_expr", 10, 2);
      table.decimal("box_delivery_marketplace_liter", 10, 2);
      table.decimal("box_storage_base", 10, 2);
      table.decimal("box_storage_coef_expr", 10, 2);
      table.decimal("box_storage_liter", 10, 2);
      table.unique(["period_id", "warehouse_name"]);
    });
  }
  
  /**
   * @param {import("knex").Knex} knex
   * @returns {Promise<void>}
   */
  export async function down(knex) {
    await knex.schema.dropTableIfExists("wb_tariff_warehouses");
    await knex.schema.dropTableIfExists("wb_tariff_periods");
  }
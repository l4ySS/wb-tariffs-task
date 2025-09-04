import _knex from "knex";
import knexConfig from "#config/knex/knexfile.js";

const knex = _knex(knexConfig);
export default knex;

function logMigrationResults(action: string, result: [number, string[]]) {
    if (result[1].length === 0) {
        console.log(["latest", "up"].includes(action) ? "All migrations are up to date" : "All migrations have been rolled back");
        return;
    }
    console.log(`Batch ${result[0]} ${["latest", "up"].includes(action) ? "ran" : "rolled back"} the following migrations:`);
    for (const migration of result[1]) {
        console.log("- " + migration);
    }
}

function logMigrationList(list: [{ name: string }[], { file: string }[]]) {
    console.log(`Found ${list[0].length} Completed Migration file/files.`);
    for (const migration of list[0]) {
        console.log("- " + migration.name);
    }
    console.log(`Found ${list[1].length} Pending Migration file/files.`);
    for (const migration of list[1]) {
        console.log("- " + migration.file);
    }
}

export const migrate = {
    latest: async () => {
        logMigrationResults("latest", await knex.migrate.latest());
    },
    rollback: async () => {
        logMigrationResults("rollback", await knex.migrate.rollback());
    },
    down: async (name?: string) => {
        logMigrationResults("down", await knex.migrate.down({ name }));
    },
    up: async (name?: string) => {
        logMigrationResults("up", await knex.migrate.up({ name }));
    },
    list: async () => {
        logMigrationList(await knex.migrate.list());
    },
    make: async (name: string) => {
        if (!name) {
            console.error("Please provide a migration name");
            process.exit(1);
        }
        console.log(await knex.migrate.make(name, { extension: "js" }));
    },
};

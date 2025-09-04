import { migrate } from "#postgres/knex.js";
import { Command } from "commander";

const program = new Command();

program
    .command("migrate")
    .argument("[type]", "latest|rollback|status|down|up|list|make")
    .argument("[arg]", "version or name")
    .action(async (action, arg) => {
        if (!action) return;

        if (action === "latest") await migrate.latest();
        if (action === "rollback") await migrate.rollback();
        if (action === "down") await migrate.down(arg);
        if (action === "up") await migrate.up(arg);
        if (action === "list") await migrate.list();
        if (action === "make") await migrate.make(arg);

        process.exit(0);
    });

program.command("default", { isDefault: true }).action(() => {});

program.parse();

#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
    .name("dct-electron-app")
    .version("1.0.0")
    .argument("<project-path>", "Project folder name or '.' for current folder")
    .option("-i, --install", "Automatically run npm install")
    .option("-g, --git", "Initialize git repository")
    .action(async (projectPath, options) => {
        try {
            const targetPath = path.resolve(projectPath);

            if (fs.existsSync(targetPath)) {
                const files = await fs.readdir(targetPath);
                if (files.length > 0) {
                    console.log(chalk.red("Error: Folder already exists and is not empty!"));
                    process.exit(1);
                } else {
                    console.log(chalk.yellow("Using existing empty folder."));
                }
            } else {
                await fs.mkdir(targetPath, { recursive: true });
            }

            const templatePath = path.join(__dirname, "template"); // <-- FIXED
            await fs.copy(templatePath, targetPath);

            console.log(chalk.green("✅ Project created successfully!"));

            if (options.install) {
                console.log(chalk.blue("\nInstalling dependencies..."));
                execSync("npm install", { cwd: targetPath, stdio: "inherit",detached: false });
            }

            if (options.git) {
                console.log(chalk.blue("\nInitializing git repository..."));
                execSync("git init", { cwd: targetPath, stdio: "inherit",detached: false });
            }

            console.log("\nNext steps:");
            if (projectPath !== ".") console.log(chalk.cyan(`  cd ${projectPath}`));
            if (!options.install) console.log(chalk.cyan("  npm install"));
            console.log(chalk.cyan("  npm run dev"));

            console.log(chalk.green("\n🎉 Your app is ready!"));
        } catch (err) {
            console.error(chalk.red("Error creating project:"), err);
            process.exit(1);
        }
    });

program.parse();
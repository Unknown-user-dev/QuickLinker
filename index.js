/*
$$\      $$\                 $$\           $$\
$$$\    $$$ |                $$ |          $$ |
$$$$\  $$$$ | $$$$$$\   $$$$$$$ |$$\   $$\ $$ | $$$$$$\
$$\$$\$$ $$ |$$  __$$\ $$  __$$ |$$ |  $$ |$$ |$$  __$$\
$$ \$$$  $$ |$$ /  $$ |$$ /  $$ |$$ |  $$ |$$ |$$$$$$$$ |
$$ |\$  /$$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |$$   ____|
$$ | \_/ $$ |\$$$$$$  |\$$$$$$$ |\$$$$$$  |$$ |\$$$$$$$\
\__|     \__| \______/  \_______| \______/ \__| \_______|
 */

const Glob = require("glob"),
    fs = require("fs"),
    ChildProcess = require("child_process"),
    Readline = require("readline-sync"),
    Gradient = require("gradient-string"),
    JSPath = new Array(),
    Discord = new Array(),
    already = new Array(),
    local = process.env.LOCALAPPDATA

/*
 /$$      /$$
| $$$    /$$$
| $$$$  /$$$$  /$$$$$$  /$$$$$$$  /$$   /$$
| $$ $$/$$ $$ /$$__  $$| $$__  $$| $$  | $$
| $$  $$$| $$| $$$$$$$$| $$  \ $$| $$  | $$
| $$\  $ | $$| $$_____/| $$  | $$| $$  | $$
| $$ \/  | $$|  $$$$$$$| $$  | $$|  $$$$$$/
|__/     |__/ \_______/|__/  |__/ \______/
 */
const banner = Gradient("red", "yellow")(`
 ██████  ██    ██ ██  ██████ ██   ██ ██      ██ ███    ██ ██   ██ ███████ ██████  
██    ██ ██    ██ ██ ██      ██  ██  ██      ██ ████   ██ ██  ██  ██      ██   ██ 
██    ██ ██    ██ ██ ██      █████   ██      ██ ██ ██  ██ █████   █████   ██████  
██ ▄▄ ██ ██    ██ ██ ██      ██  ██  ██      ██ ██  ██ ██ ██  ██  ██      ██   ██ 
 ██████   ██████  ██  ██████ ██   ██ ███████ ██ ██   ████ ██   ██ ███████ ██   ██ 
    ▀▀
`);



fs.readdirSync(local).forEach(r => r.includes("cord") ? Discord.push(`${local.replace(/\\/g, "/")}/${r}`) : "")

if (!Discord[0]) return console.error("\x1b[31mThere Is No Discord Installed\x1b[0m")

function displayMenu() {
    console.log(banner);
    console.log("\nMenu:");
    console.log("1. Add Shortcut for URL");
    console.log("2. Add Shortcut for .exe File");
    console.log("3. Remove Shortcut");
    console.log("4. Exit");

    const choice = Readline.question("Enter your choice: ");

    switch (choice) {
        case '1':
            addShortcutForURL();
            break;
        case '2':
            addShortcutForExe();
            break;
        case '3':
            clearShortcut();
            break;
        case '4':
            console.log("Exiting...");
            process.exit(0);
            break;
        default:
            console.log("Invalid choice. Please try again.");
            displayMenu();
            break;
    }
}
/*
 /$$$$$$$$                              /$$     /$$
| $$_____/                             | $$    |__/
| $$    /$$   /$$ /$$$$$$$   /$$$$$$$ /$$$$$$   /$$  /$$$$$$  /$$$$$$$
| $$$$$| $$  | $$| $$__  $$ /$$_____/|_  $$_/  | $$ /$$__  $$| $$__  $$
| $$__/| $$  | $$| $$  \ $$| $$        | $$    | $$| $$  \ $$| $$  \ $$
| $$   | $$  | $$| $$  | $$| $$        | $$ /$$| $$| $$  | $$| $$  | $$
| $$   |  $$$$$$/| $$  | $$|  $$$$$$$  |  $$$$/| $$|  $$$$$$/| $$  | $$
|__/    \______/ |__/  |__/ \_______/   \___/  |__/ \______/ |__/  |__/
 */

function addShortcutForURL() {
    console.clear();
    console.log(banner);
    const url = Readline.question("Enter the URL you want to use (e.g., https://example.com): ");
    const shortcutKey = Readline.question("Enter the shortcut key (e.g., Alt+D): ");
    console.clear();
    console.log(banner);
    const electronCode = `const electron = require("electron");\nconst { execFile } = require('child_process');`;

    Discord.forEach(r => {
        Glob.sync(`${r}/app-*/modules/discord_desktop_core-*/discord_desktop_core/index.js`).forEach(f => JSPath.push(f))
        JSPath.forEach(f => {
            if (already.includes(f)) return;
            const fileContent = fs.readFileSync(f, "utf8");
            if (!fileContent.includes("const electron = require(\"electron\")") || !fileContent.includes("const { execFile } = require('child_process');")) {
                fs.writeFileSync(f, electronCode + fileContent);
            }
            if (!fileContent.includes(`electron.globalShortcut.register('${shortcutKey}'`)) {
                fs.appendFileSync(f, `\n${getCodeForURL(url, shortcutKey)}`);
            }
            if (!fileContent.includes("module.exports = require(\"./core.asar\")")) {
                fs.appendFileSync(f, `\nmodule.exports = require("./core.asar");`);
            }

            console.log(`\x1b[32mWebsite Is Injected In ${f.split("/")[5]}\x1b[0m (Key: ${shortcutKey})`);
            already.push(f);

            var res = Readline.question(`\x1b[33mShould I Kill Discord And ReOpen It To Use The Website ?\x1b[0m [y/n]: `);
            if (res == "y") killDiscord();
            else console.log(`\x1b[32mHave A Good Day !\x1b[0m`)
            console.clear();
            displayMenu();
        })
    });
    displayMenu();
}



function addShortcutForExe() {
    console.clear();
    console.log(banner);
    const exePath = Readline.question("Enter the path to the .exe file you want to open: ");
    const shortcutKey = Readline.question("Enter the shortcut key (e.g., Ctrl+Alt+O): ");
    console.clear();
    console.log(banner);

    Discord.forEach(r => {
        Glob.sync(`${r}/app-*/modules/discord_desktop_core-*/discord_desktop_core/index.js`).forEach(f => JSPath.push(f))
        JSPath.forEach(f => {
            if (already.includes(f)) return;
            const fileContent = fs.readFileSync(f, "utf8");
            if (!fileContent.includes("const electron = require(\"electron\")") || !fileContent.includes("const { execFile } = require('child_process');")) {
                const electronCode = `const electron = require("electron");\nconst { execFile } = require('child_process');\n`;
                fs.writeFileSync(f, electronCode + fileContent);
            }
            if (!fileContent.includes(`electron.globalShortcut.register('${shortcutKey}'`)) {
                fs.appendFileSync(f, `\n${getCodeForExe(exePath, shortcutKey)}`);
            }
            if (!fileContent.includes("module.exports = require(\"./core.asar\")")) {
                fs.appendFileSync(f, `\nmodule.exports = require("./core.asar");`);
            }
            console.log(`\x1b[32m.exe File Is Injected In ${f.split("/")[5]}\x1b[0m (Key: ${shortcutKey})`);
            already.push(f);

            var res = Readline.question(`\x1b[33mShould I Kill Discord And ReOpen It To Use The .exe File ?\x1b[0m [y/n]: `);
            if (res == "y") killDiscord();
            else console.log(`\x1b[32mHave A Good Day !\x1b[0m`)
            console.clear();
            displayMenu()
        })
    });
    displayMenu();
}


function clearShortcut() {
    console.clear();
    console.log(banner);
    const confirm = Readline.question("Are you sure you want to clear all shortcuts? [y/n]: ");
    if (confirm != "y") {
        console.log("Aborting...");
        displayMenu();
    }
    Discord.forEach(r => {
        Glob.sync(`${r}/app-*/modules/discord_desktop_core-*/discord_desktop_core/index.js`).forEach(f => {
            fs.writeFileSync(f, getcodeclearshortcut());
            console.log(`\x1b[32mShortcuts are cleared in ${f.split("/")[5]}\x1b[0m`);
        });
    });
    displayMenu();
}




function getCodeForURL(url, shortcutKey) {
    return `
electron.globalShortcut.register('${shortcutKey}', () => {
    var browserWindow = new electron.BrowserWindow({ width: 800, height: 600 })
    browserWindow.loadURL("${url}")
});
    `;
}

function getCodeForExe(exePath, shortcutKey) {
    exePath = exePath.replace(/\\/g, '\\\\');

    return `
  electron.globalShortcut.register('${shortcutKey}', () => {
    var exePath = '${exePath}';
    execFile(exePath, (error, stdout, stderr) => {
      if (error) {
        console.error(\`Error while executing the .exe file: \${error}\`);
      } else {
        console.log(\`.exe file executed successfully.\`);
      }
    });
  });
  `;
}

function getcodeclearshortcut() {
    return `module.exports = require("./core.asar");`;
}



function killDiscord() {
    var kill = []
    var alreadyTaskkill = []
    var toKill = ["Discord.exe", "DiscordCanary.exe", "DiscordDevelopment.exe", "DiscordPTB.exe"]
    var killList = ChildProcess.execSync("tasklist").toString().split("\r\n")
    toKill.forEach(r => killList.forEach(f => f.includes(r) && kill.push(r.split(".exe")[0])))
    kill.forEach(r => alreadyTaskkill.includes(r) ? "" : ChildProcess.execSync(`taskkill /IM ${r}.exe /F`) ^ alreadyTaskkill.push(r))
    return "Taskkilled"
}
/*
 /$$$$$$$$                 /$$
| $$_____/                | $$
| $$       /$$$$$$$   /$$$$$$$
| $$$$$   | $$__  $$ /$$__  $$
| $$__/   | $$  \ $$| $$  | $$
| $$      | $$  | $$| $$  | $$
| $$$$$$$$| $$  | $$|  $$$$$$$
|________/|__/  |__/ \_______/
 */
displayMenu();

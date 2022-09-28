const os = require("os");
const username = os.userInfo().username;
// * Mappa ellenőrzése
if (
  !fs.existsSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater")
) {
  fs.mkdirSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater");
}
let configdir =
  "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\";

module.exports = { configdir };

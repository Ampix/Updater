var fs = require("fs");
const request = require("request");
const decompress = require("decompress");
let configdir = require("./assets/scripts/configs.js").configdir;

var modpacks = ["ampixbuilders", "twigmod2", "ampixmania"];
var modpack_folders = [];

ipcRenderer.on("selectdirback", function (evt, minden) {
  fs.writeFile(configdir + minden.type + ".txt", minden.folder, (err) => {
    if (err) {
      console.log(err);
    }
  });
  location.reload(true);
});

function setfolder(type) {
  ipcRenderer.send("selectdir", type);
}

function getId(what) {
  for (let i = 0; i < modpacks.length; i++) {
    if (modpacks[i] === what) {
      return i;
    }
  }
}

function hide(target) {
  document.getElementById(target).classList.add("hide");
}

function show(target) {
  document.getElementById(target).classList.remove("hide");
}

function status(what, to) {
  document.getElementById(what).innerHTML = to;
}

function updatepack(type) {
  let id = getId(type);
  setTimeout(() => {
    var all = 0;
    var current = 0;
    var progress = document.getElementById("progfill-" + type);
    const loc = modpack_folders[id];
    fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true });
    fs.rmSync(loc + "\\mods", { recursive: true, force: true });
    fs.rmSync(loc + "\\base.zip", { recursive: true, force: true });
    fs.mkdirSync(loc + "\\ampixupdater");
    status("status-" + type, "Letöltés...");
    show("progress-" + type);
    show("status-" + type);
    hide("downloadpack-" + type);
    hide("delpack-" + type);
    var req = request({
      method: "GET",
      uri: "https://cdn.ampix.hu/" + type + "/base.zip",
    });
    req.pipe(fs.createWriteStream(loc + "\\base.zip"));
    req.on("response", function (data) {
      all = data.headers["content-length"];
    });
    req.on("data", function (chunk) {
      current += chunk.length;
      var percent = (current * 100) / all;
      progress.style.width = percent.toFixed(0) + "%";
    });
    req.on("end", async function () {
      status("status-" + type, "Kicsomagolás...");
      hide("progress-" + type);
      decompress(loc + "\\base.zip", loc + "\\").then(async (files) => {
        fs.rmSync(loc + "\\base.zip", { force: true });
        request("https://cdn.ampix.hu/" + type + "/ver.txt")
          .pipe(fs.createWriteStream(loc + "\\ampixupdater\\ver.txt"))
          .on("close", async function () {
            location.reload();
          });
      });
    });
  }, 100);
}
async function delpack(type) {
  let id = getId(type);
  fs.rmSync(configdir + type + ".txt", { recursive: true, force: true });
  setTimeout(() => {
    if (type == "ampixbuilders") {
      const loc = modpack_folders[id];
      fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true });
      fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true });
      fs.rmSync(loc + "\\mods", { recursive: true, force: true });
      fs.rmSync(loc + "\\base.zip", { recursive: true, force: true });
      location.reload();
    }
    if (type == "ampixmania") {
      const loc = modpack_folders[id];
      fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true });
      fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true });
      fs.rmSync(loc + "\\mods", { recursive: true, force: true });
      fs.rmSync(loc + "\\base.zip", { recursive: true, force: true });
      location.reload();
    }
    if (type == "twigmod2") {
      const loc = modpack_folders[id];
      fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true });
      fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true });
      fs.rmSync(loc + "\\mods", { recursive: true, force: true });
      fs.rmSync(loc + "\\base.zip", { recursive: true, force: true });
      fs.rmSync(loc + "\\config", { recursive: true, force: true });
      location.reload();
    }
  }, 100);
}

function loadmodpack(item) {
  let id = getId(item);
  setTimeout(async () => {
    if (id !== modpack_folders.length) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      loadmodpack(item);
    } else {
      fs.readFile(configdir + item + ".txt", "utf8", function (err, data) {
        if (!data) {
          modpack_folders.push("none");
        } else {
          modpack_folders.push(data);
        }
        loaderin();
      });
    }
  }, 100);
}

function loaderin() {
  if (modpack_folders.length === modpacks.length) {
    for (let i = 0; i < modpacks.length; i++) {
      loadbuttons(modpacks[i], "load");
    }
  }
}

function checkupdates(item, folder) {
  fs.readFile(folder + "\\ampixupdater\\ver.txt", "utf8", (err, data) => {
    if (!data) {
      return loadbuttons(item, "new");
    }
    request.get(
      "https://cdn.ampix.hu/" + item + "/ver.txt",
      function (err, res, body) {
        if (!body) yield;
        if (data === body) {
          loadbuttons(item, "noupdate");
        } else {
          loadbuttons(item, "update");
        }
      }
    );
  });
}

function loadbuttons(item, mode) {
  let id = getId(item);
  hide("setfolder-" + item);
  hide("delpack-" + item);
  hide("status-" + item);
  hide("downloadpack-" + item);
  hide("checkpack-" + item);
  hide("progress-" + item);
  if (mode === "load") {
    setTimeout(() => {
      if (modpack_folders[id] === "none") {
        show("setfolder-" + item);
      } else {
        checkupdates(item, modpack_folders[id]);
      }
    }, 100);
  }
  if (mode === "new") {
    show("downloadpack-" + item);
  }
  if (mode === "update") {
    show("downloadpack-" + item);
    show("status-" + item);
    show("delpack-" + item);
    status("status-" + item, "Frissités elérhető!");
  }
  if (mode === "noupdate") {
    show("status-" + item);
    show("done-" + item);
    status("status-" + item, "Legújabb verzió");
  }
}

function load() {
  modpacks.forEach(loadmodpack);
}

load();

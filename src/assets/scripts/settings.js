var fs = require("fs");
let configdir = require("./assets/scripts/configs.js").configdir;
let builderstext = document.getElementById("builders-dir");
let twigmod2text = document.getElementById("twigmod2-dir");
let ampixmaniatext = document.getElementById("mania-dir");

function loadtext() {
  let buildtext = "";
  let twig2text = "";
  let maniatext = "";
  // * Ampix Builders
  fs.readFile(configdir + "ampixbuilders.txt", "utf8", function (err, data) {
    if (!data) {
      buildtext = "Nincs megadva";
    } else {
      buildtext = data;
    }
  });
  // * Twigmod 2
  fs.readFile(configdir + "twigmod2.txt", "utf8", function (err, data) {
    if (!data) {
      twig2text = "Nincs megadva";
    } else {
      twig2text = data;
    }
  });
  // * Ampix Mania
  fs.readFile(configdir + "ampixmania.txt", "utf8", function (err, data) {
    if (!data) {
      maniatext = "Nincs megadva";
    } else {
      maniatext = data;
    }
  });

  setTimeout(() => {
    builderstext.innerHTML = buildtext;
    twigmod2text.innerHTML = twig2text;
    ampixmaniatext.innerHTML = maniatext;
  }, 150);
}

function changeDir(type) {
  ipcRenderer.send("selectdir", type);
}

ipcRenderer.on("selectdirback", function (evt, minden) {
  fs.writeFile(configdir + minden.type + ".txt", minden.folder, (err) => {
    if (err) {
      console.log(err);
    } else {
      loadtext();
    }
  });
});

loadtext();

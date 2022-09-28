var fs = require("fs");
let configdir = require("./assets/scripts/configs.js").configdir;
let builderstext = document.getElementById("buildersdir");
let twigmod2text = document.getElementById("twigmod2dir");
let builder_dir = "";
let twigmod2_dir = "";

function loadtext() {
  let buildtext = "";
  let twig2text = "";
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

  setTimeout(() => {
    builderstext.innerHTML = buildtext;
    twigmod2text.innerHTML = twig2text;
  }, 150);
}

function changeDir(type) {
  ipcRenderer.send("selectdir", type);
}

ipcRenderer.on("selectdirback", function (evt, minden) {
  if (minden.type == "twigmod2") {
    fs.writeFile(configdir + "twigmod2.txt", minden.folder, (err) => {
      if (err) {
        console.log(err);
      } else {
        loadtext();
      }
    });
  }
  if (minden.type == "ampixbuilders") {
    fs.writeFile(configdir + "ampixbuilders.txt", minden.folder, (err) => {
      if (err) {
        console.log(err);
      } else {
        loadtext();
      }
    });
  }
});

loadtext();

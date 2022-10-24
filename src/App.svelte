<script>
  // @ts-nocheck
  const os = require("os");
  var fs = require("fs");
  const minus = document.getElementById("minimize");
  const request = require("request");
  const decompress = require("decompress");
  const close_app = document.getElementById("close-app");
  const {ipcRenderer, shell, webFrame} = require("electron");
  let warning = "Betöltés";
  let canswitchpage = true;
  let hasupdate = true;

  //  minus.addEventListener("click", minimize);
  //  close_app.addEventListener("click", closeapp);

  function closeapp() {
    ipcRenderer.send("app/close");
  }

  function hide(target) {
    document.getElementById(target).classList.add("hide");
  }

  function show(target) {
    document.getElementById(target).classList.remove("hide");
  }

  function minimize() {
    ipcRenderer.send("app/minimize");
  }

  var modpacks = ["ampixbuilders", "twigmod2", "ampixmania"];
  var modpack_folders = [];

  ipcRenderer.on("selectdirback", function (evt, minden) {
    fs.writeFile(configdir + minden.type + ".txt", minden.folder, (err) => {
      if (err) {
        console.log(err);
      }
    });
    if (page === "Kezdőlap") {
      load();
    }
    if (page === "Beállítások") {
      loadtext();
    }
  });
  ipcRenderer.on("showupdateinfo", function (evt, stuff) {
    hasupdate = true;
    let kacko = document.createElement("div");
    kacko.innerHTML = `<h1 class="spectext" style="margin-bottom: 20px !important">Frissitési napló v${stuff.name}</h1><md-block>${stuff.log}</md-block>`;
    document.getElementById("updatetext").appendChild(kacko);
    setTimeout(() => {
      doModal("open");
    }, 50);
  });

  function setfolder(type) {
    ipcRenderer.send("selectdir", type);
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

  function getId(what) {
    for (let i = 0; i < modpacks.length; i++) {
      if (modpacks[i] === what) {
        return i;
      }
    }
  }

  function openLink(link) {
    shell.openExternal(link);
  }
  const username = os.userInfo().username;
  // * Mappa ellenőrzése
  if (
    !fs.existsSync(
      "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater"
    )
  ) {
    fs.mkdirSync(
      "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater"
    );
  }
  let configdir =
    "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\";
  const path = require("path");
  let page = "Kezdőlap";
  window.addEventListener("load", (event) => {
    document.getElementById("Kezdőlap").classList.add("active");
  });

  function status(what, to) {
    document.getElementById(what).innerHTML = to;
  }

  function getWarn() {
    let warn = document.getElementById("warning");
    request.get(
      "https://cdn.ampix.hu/updater/info.txt",
      function (err, res, body) {
        if (body === "nincs") {
          hide("warning-body");
        } else {
          show("warning-body");
          warning = body;
        }
      }
    );
  }

  function updatepack(type) {
    let id = getId(type);
    setTimeout(() => {
      var all = 0;
      var current = 0;
      var progress = document.getElementById("progfill-" + type);
      const loc = modpack_folders[id];
      fs.rmSync(loc + "\\ampixupdater", {recursive: true, force: true});
      fs.rmSync(loc + "\\mods", {recursive: true, force: true});
      fs.rmSync(loc + "\\base.zip", {recursive: true, force: true});
      fs.mkdirSync(loc + "\\ampixupdater");
      status("status-" + type, "Letöltés...");
      canswitchpage = false;
      progress.style.width = "0%";
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
          fs.rmSync(loc + "\\base.zip", {force: true});
          request("https://cdn.ampix.hu/" + type + "/ver.txt")
            .pipe(fs.createWriteStream(loc + "\\ampixupdater\\ver.txt"))
            .on("close", async function () {
              canswitchpage = true;
              load();
            });
        });
      });
    }, 100);
  }

  async function delpack(type) {
    let id = getId(type);
    setTimeout(() => {
      fs.rmSync(configdir + type + ".txt", {recursive: true, force: true});
      const loc = modpack_folders[id];
      fs.rmSync(loc + "\\ampixupdater", {recursive: true, force: true});
      fs.rmSync(loc + "\\simple-rpc", {recursive: true, force: true});
      fs.rmSync(loc + "\\mods", {recursive: true, force: true});
      fs.rmSync(loc + "\\base.zip", {recursive: true, force: true});
      fs.rmSync(loc + "\\config", {recursive: true, force: true});
      load();
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
          if (!body) return;
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
    hide("done-" + item);
    hide("status-" + item);
    hide("downloadpack-" + item);
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
      show("delpack-" + item);
      status("status-" + item, "Legújabb verzió");
    }
  }

  function loadtext() {
    let builderstext = document.getElementById("builders-dir");
    let twigmod2text = document.getElementById("twigmod2-dir");
    let ampixmaniatext = document.getElementById("mania-dir");
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

  function load() {
    modpacks.forEach(loadmodpack);
    getWarn();
    modpack_folders = [];
  }
  function switchPage(pagee) {
    if (page != pagee && canswitchpage) {
      document.getElementById(page).classList.remove("active");
      page = pagee;
      document.getElementById(page).classList.add("active");
      if (page === "Kezdőlap") {
        setTimeout(() => {
          loaderin();
        }, 10);
      }
      if (page === "Beállítások") {
        setTimeout(() => {
          loadtext();
        }, 10);
      }
    }
  }
  function doModal(what) {
    let modal = document.getElementById("updatebox");
    if (what === "open") {
      modal.showModal();
    }
    if (what === "close") {
      modal.close();
      hasupdate = false;
    }
  }
  load();
</script>

<header>
  <nav class="titlebar">
    <div class="titlebar-left">
      <h3 class="titlebar-text">Ampix Updater</h3>
    </div>
    <div class="titlebar-nav">
      <button
        on:click={() => switchPage("Kezdőlap")}
        class="titlebar-nav-links"
        id="Kezdőlap"
      >
        Kezdőlap
      </button>
      <button
        on:click={() => switchPage("Beállítások")}
        class="titlebar-nav-links"
        id="Beállítások"
      >
        Beállítások
      </button>
    </div>
    <div class="titlebar-right">
      <button on:click={() => minimize()} class="titlebar-link" id="minimize"
        >&minus;</button
      >
      <button on:click={() => closeapp()} class="titlebar-link" id="close-app"
        >&#10006;</button
      >
    </div>
  </nav>
</header>
<div class="minden" id="minden">
  {#if hasupdate}
    <dialog class="updatebox" id="updatebox">
      <!-- * <md-block>{updatedes}</md-block> Ez csak illúzió -->
      <div id="updatetext">
        <!--<h1>Cs</h1>-->
      </div>
      <button on:click={() => doModal("close")}>Bezárás</button>
    </dialog>
  {/if}
  <div id="warning-body" class="warning hide">
    <h1>Információ</h1>
    <h4 id="warning">{warning}</h4>
    <button on:click={() => hide("warning-body")} class="warnbutton">X</button>
  </div>
  <div class="superbox">
    {#if page === "Kezdőlap"}
      <div class="verbox" id="verbox">
        <div class="twigmod2box">
          <button
            on:click={() =>
              openLink(
                "https://maven.minecraftforge.net/net/minecraftforge/forge/1.12.2-14.23.5.2860/forge-1.12.2-14.23.5.2860-installer.jar"
              )}
            class="assetbtn"
          >
            1.12.2 Forge 14.23.5.2860 (Katt)
          </button>

          <h3 class="spectext">Twigmod 2</h3>
          <button class="specbutton donebutton hide" id="done-twigmod2" />
          <button
            on:click={() => setfolder("twigmod2")}
            class="specbutton folderbutton hide"
            id="setfolder-twigmod2"
          />
          <button
            on:click={() => updatepack("twigmod2")}
            class="specbutton updatebutton hide"
            id="downloadpack-twigmod2"
          />
          <button
            on:click={() => delpack("twigmod2")}
            class="specbutton delbutton hide"
            id="delpack-twigmod2"
          />
          <div class="progress hide" id="progress-twigmod2">
            <div class="progress_fill" id="progfill-twigmod2" />
          </div>
          <h3 class="hide" id="status-twigmod2">Nincs új frissités</h3>
        </div>
        <div class="builderbox">
          <button
            on:click={() =>
              openLink(
                "https://maven.minecraftforge.net/net/minecraftforge/forge/1.18.2-40.1.60/forge-1.18.2-40.1.60-installer.jar"
              )}
            class="assetbtn"
          >
            1.18.2 Forge 40.1.60 (Katt)
          </button>
          <h3 class="spectext">Ampix Builders</h3>
          <button class="specbutton donebutton hide" id="done-ampixbuilders" />
          <button
            on:click={() => setfolder("ampixbuilders")}
            class="specbutton folderbutton hide"
            id="setfolder-ampixbuilders"
          />
          <button
            on:click={() => updatepack("ampixbuilders")}
            class="specbutton updatebutton hide"
            id="downloadpack-ampixbuilders"
          />
          <button
            on:click={() => delpack("ampixbuilders")}
            class="specbutton delbutton hide"
            id="delpack-ampixbuilders"
          />
          <div class="progress hide" id="progress-ampixbuilders">
            <div class="progress_fill" id="progfill-ampixbuilders" />
          </div>
          <h3 class="hide" id="status-ampixbuilders">Nincs új frissités</h3>
        </div>
        <div class="maniabox">
          <button
            on:click={() =>
              openLink(
                "https://maven.minecraftforge.net/net/minecraftforge/forge/1.18.2-40.1.80/forge-1.18.2-40.1.80-installer.jar"
              )}
            class="assetbtn"
          >
            1.18.2 Forge 40.1.80 (Katt)
          </button>
          <h3 class="spectext">Ampix Mania</h3>
          <button class="specbutton donebutton hide" id="done-ampixmania" />
          <button
            on:click={() => setfolder("ampixmania")}
            class="specbutton folderbutton hide"
            id="setfolder-ampixmania"
          />
          <button
            on:click={() => updatepack("ampixmania")}
            class="specbutton updatebutton hide"
            id="downloadpack-ampixmania"
          />
          <button
            on:click={() => delpack("ampixmania")}
            class="specbutton delbutton hide"
            id="delpack-ampixmania"
          />
          <div class="progress hide" id="progress-ampixmania">
            <div class="progress_fill" id="progfill-ampixmania" />
          </div>
          <h3 class="hide" id="status-ampixmania">Nincs új frissités</h3>
        </div>
      </div>
    {/if}
    {#if page == "Beállítások"}
      <h2>Beállítások</h2>
      <div class="settbox">
        <div class="element">
          <h3>Ampix Builders Mappája:</h3>
          <h3 id="builders-dir" class="foldertext">Betöltés...</h3>
          <button on:click={() => changeDir("ampixbuilders")}>Módosítás</button>
        </div>
        <div class="element">
          <h3>Twigmod 2 Mappája:</h3>
          <h3 id="twigmod2-dir" class="foldertext">Betöltés...</h3>
          <button on:click={() => changeDir("twigmod2")}>Módosítás</button>
        </div>
        <div class="element">
          <h3>Ampix Mania Mappája:</h3>
          <h3 id="mania-dir" class="foldertext">Betöltés...</h3>
          <button on:click={() => changeDir("ampixmania")}>Módosítás</button>
        </div>
      </div>
    {/if}
  </div>
</div>

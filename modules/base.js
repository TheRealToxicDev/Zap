var mArr = require("../bot.js").mArr;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;
var reload = require('require-reload')(require);
var bot = require("../bot.js").bot;

base = setInterval(changeStatus, 15000);
statusIndex = 0;
function changeStatus() {
  if (settings.get("status").length > 0) {
    if (statusIndex >= settings.get("status").length) {statusIndex = 0;}
    bot.editStatus(null, {name: settings.get("status")[statusIndex].name, type: settings.get("status")[statusIndex].type, url: "https://twitch.tv/twitch/"})
    statusIndex++;
  }
  else {
    bot.editStatus(null, null);
  }
}

module.exports.commands = [{cmd: "presence", desc: "Change the bot's presence (online, idle, dnd, invisible).", perm: []}, {cmd: "status", desc: "Add or remove messages to the bot's playing status.", perm: []}, {cmd: "eval", desc: "Evaluates code.", perm: []}, {cmd: "load", desc: "Load an unloaded module.", perm: []}, {cmd: "reload", desc: "Reload a loaded module.", perm: []}, {cmd: "gprefix", desc: "Change the global default prefix.", perm: []}];
module.exports.events = [];
module.exports.actions = function (type, cmd, body, obj) {
  if (cmd == "eval") {
    try {evaled = eval(body).toString(); obj.channel.createMessage("**Success!** Output:\n```js\n" + evaled + "```");}
    catch (err) {obj.channel.createMessage("**Error!** Output:\n```js\n" + err.toString() + "```");}
  }
  else if (cmd == "load") {
    number = 0;
    loaded = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        obj.channel.createMessage("Module already loaded!");
        loaded = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (loaded != true) {
        mArr.push(reload("./" + body + ".js"));
        console.log("[Modules] Module " + mArr[mArr.length - 1].name + " was loaded successfully.");
        obj.channel.createMessage("Module `" + mArr[mArr.length - 1].name + "` was loaded successfully.");
      }
    }, 5)
  }
  else if (cmd == "reload") {
    number = 0;
    exists = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        if (body == "base") {
          clearInterval(base);
        }
        mArr[number] = reload("./" + mArr[number].name + ".js");
        console.log("[Modules] Module " + mArr[number].name + " was reloaded successfully.");
        obj.channel.createMessage("Module `" + mArr[number].name + "` was reloaded successfully.");
        exists = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (exists != true) {
        obj.channel.createMessage("Module does not exist!");
      }
    }, 5)
  }
  else if (cmd == "gprefix") {
    settings.set("prefix", body);
    obj.channel.createMessage("Changed the global default prefix to `" + body + "`.");
  }
  else if (cmd == "presence") {
    if (body != "online" && body != "idle" && body != "dnd" && body != "invisible") {
      settings.set("presence", "online");
      bot.editStatus("online");
      obj.channel.createMessage("Reset the presence to `online`.");
    }
    else {
      settings.set("presence", body);
      bot.editStatus(body);
      obj.channel.createMessage("Set the presence to `" + body + "`.");
    }
  }
  else if (cmd == "status") {
    split = body.split(" ");
    if (split[0] != "add" && split[0] != "remove" && split[0] != "list") {obj.channel.createMessage("Try specifying the action first.\nValid actions are `add type name`, `remove index`, `list`")}
    if (split[0] == "add") {
      if (split[1] == "playing") {status = 0;}
      else if (split[1] == "streaming") {status = 1;}
      else if (split[1] == "listening") {status = 2;}
      else if (split[1] == "watching") {status = 3;}
      else {
        obj.channel.createMessage("You have specified an invalid type.\nValid types: `playing`, `streaming`, `listening`, `watching`");
        status = -1;
      }
      if (status >= 0) {
        if (split[2]) {
          arr = settings.get("status");
          arr.push({type: status, name: body.substring(body.indexOf(split[2]))});
          settings.set("status", arr);
          obj.channel.createMessage("Added `" + split[1] + " " + body.substring(body.indexOf(split[2])) + "` to the rotation.");
        }
        else {
          obj.channel.createMessage("You didn't provide a game name.");
        }
      }
    }
    else if (split[0] == "remove") {
      if (parseInt(split[1], 10) > settings.get("status").length || parseInt(split[1], 10) < 1) {
        obj.channel.createMessage("Invalid index. Try using `status list` to find the status you want to remove.");
      }
      else {
        statusArr = settings.get("status");
        index = parseInt(split[1], 10) - 1;
        if (statusArr[index].type == 0) {type = "Playing";}
        else if (statusArr[index].type == 1) {type = "Streaming";}
        else if (statusArr[index].type == 2) {type = "Listening to";}
        else if (statusArr[index].type == 3) {type = "Watching";}
        obj.channel.createMessage("Removing `" + type + " " + statusArr[index].name + "`.")
        statusArr.splice(index);
        settings.set("status", statusArr);
      }
    }
    else if (split[0] == "list") {
      number = 0;
      arr = [];
      if (settings.get("status").length == 0) {
        obj.channel.createMessage("There were no statuses found.")
      }
      else {
        while (number < settings.get("status").length) {
          if (settings.get("status")[number].type == 0) {type = "Playing";}
          else if (settings.get("status")[number].type == 1) {type = "Streaming";}
          else if (settings.get("status")[number].type == 2) {type = "Listening to";}
          else if (settings.get("status")[number].type == 3) {type = "Watching";}
          index = number+1;
          arr.push("`" + index + "` | " + type + " " + settings.get("status")[number].name);
          number++;
        }
        setTimeout(function() {
          obj.channel.createMessage("Cycling through " + settings.get("status").length + " statuses:\n" + arr.join("\n"))
        }, 5)
      }
    }
  }
}
module.exports.managersOnly = true;
module.exports.name = "base";

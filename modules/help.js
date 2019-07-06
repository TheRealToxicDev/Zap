var mArr = require("../bot.js").mArr;

module.exports.commands = ["help"];
module.exports.help = [{cmd: "help", desc: "Do you expect anything?"}]
module.exports.events = [];
module.exports.actions = function (cmd, body, msg) {
  if (cmd == "help") {
    help = [];
    number = 0;
    error = false;
    while (number < mArr.length) {
      str = [];
      str.push("{\"name\": \"" + mArr[number].name.charAt(0).toUpperCase() + mArr[number].name.slice(1) + "\", \"value\": \"");
      otherNumber = 0;
      while (otherNumber < mArr[number].commands.length) {
        if (mArr[number].commands[otherNumber] == mArr[number].help[otherNumber].cmd) {
          if (otherNumber == 0) {
            str.push(mArr[number].commands[otherNumber] + ": " + mArr[number].help[otherNumber].desc);
          }
          else {
            str.push("\\n" + mArr[number].commands[otherNumber] + ": " + mArr[number].help[otherNumber].desc);
          }
          otherNumber++;
        }
        else {
          msg.channel.createMessage("Critical error displaying help: Module `" + mArr[number].name + "` has a missing command description.");
          error = true;
          number = mArr.length;
          return;
        }
      }
      str.push("\"}");
      help.push(str.join(""))
      number++;
    }
    setTimeout(function() {
      if (error != true) {
        number = 0;
        newHelp = [];
        while (number < help.length) {
          newHelp.push(JSON.parse(help[number]));
          number++;
        }
        msg.channel.createMessage({
          embed: {
            title: "Help",
            description: "Here are a list of commands:",
            fields: newHelp
          }
        })
        //msg.channel.createMessage("```\n" + help.join("\n") + "\n```")
      }
    }, 20)
  }
}
module.exports.managersOnly = false;
module.exports.name = "help";
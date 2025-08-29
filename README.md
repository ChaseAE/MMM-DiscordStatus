# MMM-DiscordStatus

**MMM-DiscordStatus** is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that allows you to display user presence information of a particular discord server.

This module relies on a created discord bot and will be extended in the future to inlcude more information as configuration options.

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/ChaseAE/MMM-DiscordStatus.git
cd MMM-DiscordStatus
npm install
```

## Updating

Update this module by navigating into its folder on the command line and using `git pull`:

```bash
cd ~/MagicMirror/modules/MMM-DiscordStatus
git pull
```

## Config
```
{
  module: "MMM-DiscordStatus",
  position: "bottom_left", 
  config: {
    myDisplayName: "MyUserName", // Optional, makes your profile info larger
    serverId: "",
    botToken: ""
  }
},
```

## Setup Instructions
### Bot Creation:
1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click "New Application".
3. In the **Bot** tab enable "Presence Intent", and "Server Members Intent" then click "Save Changes".
4. Collect your bot token (you may have to click "Reset Token") and record it somewhere else, this will be put in your config.
5. In the OAuth2 URL Generator of the **OAuth2** tab, enable "bot" and then "View Channels" under the bot permissions.
6. Copy the generated URL and open it in your browser to add the bot to your server (this requires proper permissions to be able to do so).
7. Add the botToken to MMM-DiscordStsatus config.


### Collecting the Server ID:
1. Enable "Developer Mode" in Discord's settings menu.
2. Right click on a server.
3. Click "Copy Server ID" at the bottom and add that to your MMM-DiscordStatus config.

## Preview

## Future Plans

I plan adding more styling customizability so it looks better if you move it to the right side of the screen. It is currently styled for the bottom left corner but will work anywhere.

## Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file.

Please submit any issues and I will get to them as soon as possible!

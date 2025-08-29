const NodeHelper = require("node_helper");
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ]
});

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-SteamStatus node_helper started");
    
    this.serverId = null;
    this.botToken = null;
    this.myDisplayName = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "SET_API_INFO") {
      this.serverId = payload.serverId;
      this.botToken = payload.botToken;
      this.myDisplayName = payload.myDisplayName;

      client.login(this.botToken);
    }

    if (notification === "GET_API_USER_DATA") {
      this.getUserData();
    }

  },

  getUserData: async function () {
    if (!this.botToken) {
      console.error("botToken not set, can't fetch user data.");
      return;
    }

    if (!this.serverId) {
      console.error("serverId not set, can't fetch user data.");
      return;
    }

    try {
      client.once('clientReady', () => {
        this.sendDataBack();
        setInterval(() => {
          this.sendDataBack();
        }, 15 * 1000); // every 15 seconds
      });
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
    return;
  },

  /**
   * Process the user data received from the Discord API.
   */
  async sendDataBack() {
    const guild = await client.guilds.fetch(this.serverId);
    const users = await guild.members.fetch();

    const onlineUsers = users.filter(m =>
      !m.user.bot && 
      (["online", "idle", "dnd"].includes(m.presence?.status) || m.displayName === this.myDisplayName)
    );

    const processedData = this.processUserData(onlineUsers);
    console.log(processedData);
    this.sendSocketNotification("API_USER_DATA_RESULT", processedData);
  },

  /**
   * Format the user data into a structure suitable for rendering.
   */
  processUserData(users) {
    let userCardInfo = [];
    users.forEach(user => {
      let userStatus = user.presence?.status 
        ? user.presence?.status.charAt(0).toUpperCase() + user.presence?.status.slice(1) 
        : 'Offline';
      let customUserStatusSet = false;
      let userAvatarClasses = 'user-avatar';
      let userInfoClasses = 'user-info';
      let userStatusClasses = 'user-status';
      
      if (user.presence?.activities) {
        for (const activity of user.presence.activities) {
          // Set user status based on priority: Playing > Streaming > Listening
          if (activity.type === 0) {
            userStatus = "Playing " + activity.name;
            userAvatarClasses += ' user-avatar-playing';
            userInfoClasses += ' user-info-playing';
            userStatusClasses += ' user-status-playing';
            customUserStatusSet = true;
            break;
          }
          if (activity.type === 1) {
            userStatus = "Streaming " + activity.name;
            customUserStatusSet = true;
            break;
          }
          if (activity.type === 2) {
            userStatus = "Listening to " + activity.name;
            customUserStatusSet = true;
            break;
          }
          if (activity.type === 3) {
            userStatus = "Watching " + activity.name;
            customUserStatusSet = true;
            break;
          }
        }
      }

      const isStreamingScreen = !customUserStatusSet && user.voice.channel && user.voice.streaming;
      
      // Set colors based off status
      if (userStatus === 'Online' || customUserStatusSet) {
        userAvatarClasses += ' user-avatar-online';
        userInfoClasses += ' user-info-online';
        userStatusClasses += ' user-status-online';
      }
      else if (isStreamingScreen) {
        userStatus = "Sharing their screen";
        userAvatarClasses += ' user-avatar-streaming';
        userInfoClasses += ' user-info-streaming';
        userStatusClasses += ' user-status-streaming';
      }
      else if (userStatus === 'Idle') {
        userAvatarClasses += ' user-avatar-idle';
        userInfoClasses += ' user-info-idle';
        userStatusClasses += ' user-status-idle';
      }
      else if (userStatus === 'Dnd') {
        userAvatarClasses += ' user-avatar-dnd';
        userInfoClasses += ' user-info-dnd';
        userStatusClasses += ' user-status-dnd';
      }

      // Set specific styling for the user's own card
      if (user.displayName === this.myDisplayName) {
        userStatus = userStatus.replace(/ \| /g, "<br>");
        userAvatarClasses = 'my-avatar';
        userInfoClasses = `my-${userInfoClasses.split(' ').join(' my-')}`;
        userStatusClasses = `my-${userStatusClasses.split(' ').join(' my-')}`;
      }
  
      // Add user cards to an object
      userCardInfo.push({
        discordId: user.id,
        avatar: user.user.displayAvatarURL({
          extension: "png",
          size: 1024
        }),
        name: user.displayName,
        status: userStatus,
        cardClasses: (user.displayName === this.myDisplayName) ? 'my-user-card' : 'user-card',
        avatarClasses: userAvatarClasses,
        infoClasses: userInfoClasses,
        statusClasses: userStatusClasses,
      });
    });

    // Sort user cards
    userCardInfo.sort((a, b) => {
      // Always prioritize the user's own card
      if (a.name === this.myDisplayName) return -1;
      if (b.name === this.myDisplayName) return 1;

      const statusOrder = {
        'user-avatar-playing': 1,
        'user-avatar-streaming': 2,
        'user-avatar-online': 3,
        'user-avatar-idle': 4,
        'user-avatar-dnd': 5,
        'user-avatar': 6
      };

      const aStatus = Object.keys(statusOrder).find(key => a.avatarClasses.includes(key)) || 'user-avatar';
      const bStatus = Object.keys(statusOrder).find(key => b.avatarClasses.includes(key)) || 'user-avatar';

      const statusComparison = statusOrder[aStatus] - statusOrder[bStatus];

      return statusComparison;
    });

    return userCardInfo;
  }
});

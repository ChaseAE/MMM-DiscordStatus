Module.register("MMM-DiscordStatus", {
  defaults: {
    serverId: '',
    botToken: '',
    myDisplayName: ''
  },

  previousUsersData: [],

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["MMM-DiscordStatus.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    console.log("Starting module MMM-DiscordStatus");

    this.sendSocketNotification("SET_API_INFO", { "serverId": this.config.serverId, "botToken": this.config.botToken, "myDisplayName": this.config.myDisplayName });

    this.sendSocketNotification("GET_API_USER_DATA");
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div");
    wrapper.id = 'wrapper';
    wrapper.innerHTML = `<div id="discordCards"></div>`;

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "API_USER_DATA_RESULT") {
      this.populateUserCards(payload);
    }
  },

  /**
   * Set the user cards based on the data received.
   */
  populateUserCards(usersData) {
    const discordCards = document.getElementById('discordCards');

    // Remove all existing cards from discordCards
    while (discordCards.firstChild) {
      discordCards.removeChild(discordCards.firstChild);
    }

    // Create new cards for all users
    usersData.forEach(user => {
      this.createNewCard(user, discordCards);
    });

    // Update the previousUsersData
    this.previousUsersData = usersData;
  },

  /**
   * Create a new user card based on the provided user data.
   */
  createNewCard(userData, discordCards) {
    const card = document.createElement('div');
    card.id = userData.discordId;
    card.className = userData.cardClasses;

    card.innerHTML = `
      <img src="${userData.avatar}" class="${userData.avatarClasses}" alt="${userData.name}'s avatar">
      <div class="${userData.infoClasses}">
        <div>
          ${userData.name}
        </div>
        <span class="${userData.statusClasses}">${userData.status}</span>
      </div>
    `;

    discordCards.appendChild(card);
  },
});
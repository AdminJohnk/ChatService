const { UserClass } = require('../models/user.model');

const SET_PRESENCE = 'SET_PRESENCE';
const SET_ACTIVE_MEM = 'SET_ACTIVE_MEM';

class PresenceService {
  activeArr = [];
  constructor(io) {
    try {
      let presenceService = io.of('/presence-service');
      setInterval(() => {
        console.log('Number of active users: ', this.activeArr.length);
      }, 5000);

      presenceService.on('connection', (socket) => {
        socket.on(SET_PRESENCE, (userID) => {
          if (this.activeArr.findIndex((user) => user.userID === userID) === -1) {
            this.activeArr.push({
              userID,
              socketID: socket.id
            });
            console.log(`A user with ID:${userID} has connected to presence service`);
          }
          const activeArr = this.activeArr.map((user) => user.userID);

          presenceService.emit(SET_ACTIVE_MEM, activeArr);
        });

        socket.on('disconnect', async () => {
          const user = this.activeArr.find((user) => user.socketID === socket.id);

          if (!user) return;
          console.log(`A user with ID:${user.userID} has disconnected from presence service`);

          await UserClass.updateLastOnline(user.userID);

          this.activeArr = this.activeArr.filter((user) => user.socketID !== socket.id);

          const activeArr = this.activeArr.map((user) => user.userID);

          presenceService.emit(SET_ACTIVE_MEM, activeArr);
        });
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

module.exports = PresenceService;

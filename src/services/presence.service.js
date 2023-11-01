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
        console.log(`A user with ${socket.id} connected to presence service`);

        socket.on(SET_PRESENCE, (userID) => {
          if (this.activeArr.findIndex((user) => user.userID === userID) === -1) {
            this.activeArr.push({
              userID,
              socketID: socket.id
            });
          }
          const activeArr = this.activeArr.map((user) => user.userID);

          presenceService.emit(SET_ACTIVE_MEM, activeArr);
        });

        socket.on('disconnect', async () => {
          console.log(`A user with ${socket.id} disconnected from presence service`);

          const user = this.activeArr.find((user) => user.socketID === socket.id);
          console.log(user);

          await UserClass.updateLastOnline(user?.userID);

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

const SET_PRESENCE = 'SET_PRESENCE';
const SET_ACTIVE_MEM = 'SET_ACTIVE_MEM';

class PresenceService {
  activeArr = [];
  constructor(io) {
    try {
      let presenceService = io.of('/presence-service');

      console.log('presenceService');

      presenceService.on('connection', socket => {
        console.log('A user presence connected');

        socket.on(SET_PRESENCE, userID => {
          if (this.activeArr.findIndex(user => user.userID === userID) === -1) {
            this.activeArr.push({
              userID,
              socketID: socket.id
            });
            
            const activeArr = this.activeArr.map(user => user.userID);

            presenceService.emit(SET_ACTIVE_MEM, activeArr);
          }
        });

        socket.on('disconnect', () => {
          console.log('A user presence disconnected');

          this.activeArr = this.activeArr.filter(
            user => user.socketID !== socket.id
          );

          const activeArr = this.activeArr.map(user => user.userID);

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
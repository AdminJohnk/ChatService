const { MessageClass } = require('../models/message.model');
const { ConversationClass } = require('../models/conversation.model');
const { pp_UserDefault } = require('../utils/constants');

const PRIVATE_MSG = 'PRIVATE_MSG';
const SEEN_MSG = 'SEEN_MSG';

class ChatService {
  constructor(io) {
    try {
      let chatService = io.of('/chat-service');

      chatService.on('connection', (socket) => {
        console.log('A user chat connected');

        socket.on(PRIVATE_MSG, (data) => {
          this.getPrivateMessage({ io: chatService, data });
        });

        socket.on(SEEN_MSG, (data) => {
          this.seenMessage({ io: chatService, data });
        });

        socket.on('disconnect', () => {
          console.log('A user chat disconnected');
        });
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getPrivateMessage({ io, data }) {
    const { conversationID, message } = data;
    try {
      const { sender, content, createdAt } = message;
      const newMessage = await MessageClass.createMessage({
        conversation_id: conversationID,
        sender: sender._id,
        content,
        createdAt
      });
      // add lastMessage to conversation
      await ConversationClass.updateLastMessage({
        conversation_id: conversationID,
        message_id: newMessage._id
      });
      io.emit(PRIVATE_MSG + conversationID, message);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async seenMessage({ io, data }) {
    const { conversationID, userID } = data;
    try {
      const result = await ConversationClass.seenMessage({
        conversation_id: conversationID,
        user_id: userID
      });
      const seen = await result.populate('seen', pp_UserDefault);
      io.emit(SEEN_MSG + conversationID, seen);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

module.exports = ChatService;

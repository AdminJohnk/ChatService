const { MessageClass } = require('../models/message.model');
const { ConversationClass } = require('../models/conversation.model');

const PRIVATE_MSG = 'PRIVATE_MSG';

class ChatService {
  constructor(io) {
    try {
      let chatService = io.of('/chat-service');

      chatService.on('connection', socket => {
        console.log('A user chat connected');

        socket.on(PRIVATE_MSG, data => {
          this.getPrivateMessage({ socket, io: chatService, data });
        });

        socket.on('disconnect', socket => {
          console.log('A user chat disconnected');
        });
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getPrivateMessage({ socket, io, data }) {
    const { conversationID, message } = data;
    try {
      const { sender, content, createdAt } = message;
      io.emit(PRIVATE_MSG + conversationID, message);
      const newMessage = await MessageClass.createMessage({
        conversation_id: conversationID,
        sender: sender._id,
        seen: [sender._id],
        content,
        createdAt
      });
      // add lastMessage to conversation
      await ConversationClass.updateLastMessage({
        conversation_id: conversationID,
        message_id: newMessage._id
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

module.exports = ChatService;

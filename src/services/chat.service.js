const { MessageClass } = require('../models/message.model');
const { ConversationClass } = require('../models/conversation.model');
const { pp_UserDefault } = require('../utils/constants');

const PRIVATE_MSG = 'PRIVATE_MSG';
const SEEN_MSG = 'SEEN_MSG';
const PRIVATE_CONVERSATION = 'PRIVATE_CONVERSATION';
const NEW_CONVERSATION = 'NEW_CONVERSATION';

class ChatService {
  constructor(io) {
    try {
      let chatService = io.of('/chat-service');

      chatService.on('connection', (socket) => {
        console.log(`A user with ${socket.id} connected to chat service`);

        socket.on(PRIVATE_MSG, (data) => {
          this.getPrivateMessage({ io: chatService, data });
        });

        socket.on(SEEN_MSG, (data) => {
          this.seenMessage({ io: chatService, data });
        });

        socket.on(NEW_CONVERSATION, (data) => {
          data.members.forEach((member) => {
            chatService.emit(PRIVATE_CONVERSATION + member._id.toString(), data);
          });
        });

        socket.on('disconnect', () => {
          console.log(`A user with ${socket.id} disconnected from chat service`);
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
      const result = await ConversationClass.updateLastMessage({
        conversation_id: conversationID,
        message_id: newMessage._id
      });
      io.emit(PRIVATE_MSG + conversationID, message);
      result.members.forEach((member) => {
        io.emit(PRIVATE_CONVERSATION + member.toString(), result);
      });
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
      io.emit(SEEN_MSG + conversationID, result);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

module.exports = ChatService;

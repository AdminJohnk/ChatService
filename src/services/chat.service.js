const { MessageClass } = require('../models/message.model');
const { ConversationClass } = require('../models/conversation.model');

const SETUP = 'SETUP';
const PRIVATE_MSG = 'PRIVATE_MSG';
const SEEN_MSG = 'SEEN_MSG';
const UNSEEN_MSG = 'UNSEEN_MSG';
const PRIVATE_CONVERSATION = 'PRIVATE_CONVERSATION';
const NEW_CONVERSATION = 'NEW_CONVERSATION';
const IS_TYPING = 'IS_TYPING';
const STOP_TYPING = 'STOP_TYPING';
const LEAVE_GROUP = 'LEAVE_GROUP';
const VIDEO_CALL = 'video';
const VOICE_CALL = 'audio';
const LEAVE_VIDEO_CALL = 'leave_video';
const LEAVE_VOICE_CALL = 'leave_audio';

class ChatService {
  constructor(io) {
    try {
      let chatService = io.of('/chat-service');

      chatService.on('connection', (socket) => {
        socket.on(SETUP, (userID) => {
          console.log(`A user with ID:${userID} has connected to chat service`);
          socket.join(userID);
        });

        socket.on(PRIVATE_MSG, (data) => {
          this.getPrivateMessage({ io: chatService, data });
        });

        socket.on(SEEN_MSG, (data) => {
          this.seenMessage({ io: chatService, data });
        });

        socket.on(UNSEEN_MSG, (data) => {
          this.unseenMessage({ io: chatService, data });
        });

        socket.on(NEW_CONVERSATION, (data) => {
          data.members.forEach((member) => {
            chatService.to(member.toString()).emit(PRIVATE_CONVERSATION, data);
          });
        });

        socket.on(IS_TYPING, (data) => {
          this.isTyping({ io: chatService, data });
        });

        socket.on(STOP_TYPING, (data) => {
          this.stopTyping({ io: chatService, data });
        });

        socket.on(LEAVE_GROUP, (data) => {
          data.members.forEach((member) => {
            chatService.to(member.toString()).emit(LEAVE_GROUP, data);
          });
        });

        socket.on(VIDEO_CALL, (data) => {
          this.handleVideoCall({ io: chatService, data, socket });
        });

        socket.on(VOICE_CALL, (data) => {
          this.handleVoiceCall({ io: chatService, data, socket });
        });

        socket.on(LEAVE_VIDEO_CALL, (data) => {
          this.leaveVideoCall({ io: chatService, data, socket });
        });

        socket.on(LEAVE_VOICE_CALL, (data) => {
          this.leaveVoiceCall({ io: chatService, data, socket });
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
      result.members.forEach((member) => {
        io.to(member.toString()).emit(PRIVATE_MSG, message);
        io.to(member.toString()).emit(PRIVATE_CONVERSATION, result);
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
      result.members.forEach((member) => {
        io.to(member.toString()).emit(SEEN_MSG, result);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async unseenMessage({ io, data }) {
    const { conversationID, userID } = data;
    try {
      const result = await ConversationClass.unseenMessage({
        conversation_id: conversationID,
        user_id: userID
      });
      result.members.forEach((member) => {
        io.to(member.toString()).emit(SEEN_MSG, result);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async isTyping({ io, data }) {
    const { conversationID, userID, members } = data;
    try {
      members.forEach((member) => {
        io.to(member._id.toString()).emit(IS_TYPING + conversationID, userID);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async stopTyping({ io, data }) {
    const { conversationID, userID, members } = data;
    try {
      members.forEach((member) => {
        io.to(member._id.toString()).emit(STOP_TYPING + conversationID, userID);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async handleVideoCall({ io, data, socket }) {
    if (!data.conversation_id) return;

    socket.join(data.conversation_id);
    data.members.forEach((member) => {
      io.to(member.toString()).except(data.user_id).emit(VIDEO_CALL, data);
    });
  }

  async handleVoiceCall({ io, data, socket }) {
    if (!data.conversation_id) return;

    socket.join(data.conversation_id);
    data.members.forEach((member) => {
      io.to(member.toString()).except(data.user_id).emit(VOICE_CALL, data);
    });
  }

  async leaveVideoCall({ io, data, socket }) {
    if (!data.conversation_id) return;

    console.log(io.adapter?.rooms?.get(data.conversation_id));

    const room = io.adapter?.rooms?.get(data.conversation_id);

    console.log(room);

    if (room && room.has(socket.id)) {
      socket.leave(data.conversation_id);

      if (room.size === 0) {
        console.log('room size: ', room.size);
      }
    }
  }

  async leaveVoiceCall({ io, data, socket }) {
    if (!data.conversation_id) return;
    console.log(io.adapter?.rooms?.get(data.conversation_id));
    const room = io.adapter?.rooms?.get(data.conversation_id);

    if (room && room.has(socket.id)) {
      socket.leave(data.conversation_id);

      if (room.size === 0) {
        console.log('room size: ', room.size);
      }
    }
  }
}

module.exports = ChatService;

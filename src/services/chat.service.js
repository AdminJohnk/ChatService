const { MessageClass } = require('../models/message.model');
const { ConversationClass } = require('../models/conversation.model');
const { SOCKET_EVENTS } = require('../utils/constants');

class ChatService {
  constructor(io) {
    try {
      let chatService = io.of('/chat-service');

      chatService.on('connection', (socket) => {
        socket.on(SOCKET_EVENTS.SETUP, (userID) => {
          console.log(`A user with ID:${userID} has connected to chat service`);
          socket.join(userID);
        });

        socket.on(SOCKET_EVENTS.PRIVATE_MSG, (data) => {
          this.getPrivateMessage({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.SEEN_MSG, (data) => {
          this.seenMessage({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.UNSEEN_MSG, (data) => {
          this.unseenMessage({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.NEW_CONVERSATION, (data) => {
          data.members.forEach((member) => {
            chatService.to(member.toString()).emit(SOCKET_EVENTS.PRIVATE_CONVERSATION, data);
          });
        });

        socket.on(SOCKET_EVENTS.IS_TYPING, (data) => {
          this.isTyping({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
          this.stopTyping({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.LEAVE_GROUP, (data) => {
          data.members.forEach((member) => {
            chatService.to(member.toString()).emit(LEAVE_GROUP, data);
          });
        });

        socket.on(SOCKET_EVENTS.CHANGE_CONVERSATION_IMAGE, (data) => {
          this.changeConversationImage({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.CHANGE_CONVERSATION_NAME, (data) => {
          this.changeConversationName({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.ADD_MEMBER, (data) => {
          this.addMemberToConversation({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.REMOVE_MEMBER, (data) => {
          this.removeMemberFromConversation({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.COMMISSION_ADMIN, (data) => {
          this.commissionAdmin({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.DECOMMISSION_ADMIN, (data) => {
          this.decommissionAdmin({ io: chatService, data });
        });

        socket.on(SOCKET_EVENTS.VIDEO_CALL, (data) => {
          this.handleVideoCall({ io: chatService, data, socket });
        });

        socket.on(SOCKET_EVENTS.VOICE_CALL, (data) => {
          this.handleVoiceCall({ io: chatService, data, socket });
        });

        socket.on(SOCKET_EVENTS.LEAVE_VIDEO_CALL, (data) => {
          this.leaveVideoCall({ io: chatService, data, socket });
        });

        socket.on(SOCKET_EVENTS.LEAVE_VOICE_CALL, (data) => {
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
      const { sender, content, createdAt, type } = message;
      const newMessage = await MessageClass.createMessage({
        conversation_id: conversationID,
        sender: sender._id,
        type,
        content,
        createdAt
      });
      // add lastMessage to conversation
      const result = await ConversationClass.updateLastMessage({
        conversation_id: conversationID,
        message_id: newMessage._id
      });
      result.members.forEach((member) => {
        io.to(member.toString()).emit(SOCKET_EVENTS.PRIVATE_MSG, message);
        io.to(member.toString()).emit(SOCKET_EVENTS.PRIVATE_CONVERSATION, result);
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
        io.to(member.toString()).emit(SOCKET_EVENTS.SEEN_MSG, result);
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
        io.to(member.toString()).emit(SOCKET_EVENTS.SEEN_MSG, result);
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
        io.to(member._id.toString()).emit(SOCKET_EVENTS.IS_TYPING + conversationID, userID);
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
        io.to(member._id.toString()).emit(SOCKET_EVENTS.STOP_TYPING + conversationID, userID);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async handleVideoCall({ io, data, socket }) {
    if (!data.conversation_id) return;

    socket.join(data.conversation_id + 'video');
    if (!data.first_call) return;
    setTimeout(() => {
      const room = io.adapter?.rooms?.get(data.conversation_id + 'video');
      if (room && room.size <= 1) {
        io.emit(SOCKET_EVENTS.END_VIDEO_CALL, { ...data, type: 'missed' });
        io.to(data.author).emit(SOCKET_EVENTS.SEND_END_VIDEO_CALL, { ...data, type: 'missed' });
      }
    }, 60000);
    data.members.forEach((member) => {
      io.to(member.toString()).except(data.user_id).emit(SOCKET_EVENTS.VIDEO_CALL, data);
    });
  }

  async handleVoiceCall({ io, data, socket }) {
    if (!data.conversation_id) return;

    socket.join(data.conversation_id + 'voice');
    if (!data.first_call) return;
    setTimeout(() => {
      const room = io.adapter?.rooms?.get(data.conversation_id + 'voice');
      if (room && room.size <= 1) {
        io.emit(SOCKET_EVENTS.END_VOICE_CALL, { ...data, type: 'missed' });
        io.to(data.author).emit(SOCKET_EVENTS.SEND_END_VOICE_CALL, { ...data, type: 'missed' });
      }
    }, 60000);
    data.members.forEach((member) => {
      io.to(member.toString()).except(data.user_id).emit(SOCKET_EVENTS.VOICE_CALL, data);
    });
  }

  async leaveVideoCall({ io, data, socket }) {
    if (!data.conversation_id) return;
    const room = io.adapter?.rooms?.get(data.conversation_id + 'video');

    if (room) {
      if (room.has(socket.id)) socket.leave(data.conversation_id + 'video');

      if (room.size <= 1 && (!data.type === 'missed' || !data.type)) {
        io.emit(SOCKET_EVENTS.END_VIDEO_CALL, data);
        io.to(data.author).emit(SOCKET_EVENTS.SEND_END_VIDEO_CALL, { ...data, type: 'end' });
      }
    }
  }

  async leaveVoiceCall({ io, data, socket }) {
    if (!data.conversation_id) return;
    const room = io.adapter?.rooms?.get(data.conversation_id + 'voice');

    if (room) {
      if (room.has(socket.id)) socket.leave(data.conversation_id + 'voice');

      if (room.size <= 1 && (!data.type === 'missed' || !data.type)) {
        io.emit(SOCKET_EVENTS.END_VOICE_CALL, data);
        io.to(data.author).emit(SOCKET_EVENTS.SEND_END_VOICE_CALL, { ...data, type: 'end' });
      }
    }
  }

  async changeConversationImage({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member.toString()).emit(SOCKET_EVENTS.CHANGE_CONVERSATION_IMAGE, data);
    });
  }

  async changeConversationName({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member.toString()).emit(SOCKET_EVENTS.CHANGE_CONVERSATION_NAME, data);
    });
  }

  async addMemberToConversation({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member._id.toString()).emit(SOCKET_EVENTS.NEW_CONVERSATION, data);
    });
  }

  async removeMemberFromConversation({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member._id.toString()).emit(SOCKET_EVENTS.LEAVE_GROUP, data);
    });
  }

  async commissionAdmin({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member.toString()).emit(SOCKET_EVENTS.COMMISSION_ADMIN, data);
    });
  }

  async decommissionAdmin({ io, data }) {
    const { members } = data;

    members.forEach((member) => {
      io.to(member.toString()).emit(SOCKET_EVENTS.DECOMMISSION_ADMIN, data);
    });
  }
}

module.exports = ChatService;

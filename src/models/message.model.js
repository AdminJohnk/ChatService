'use strict';

const { model, Schema, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Message';
const COLLECTION_NAME = 'messages';

var MessageSchema = new Schema(
  {
    conversation_id: { type: ObjectId, ref: 'Conversation', required: true },
    type: {
      type: String,
      enum: ['text', 'notification', 'audio', 'file', 'voice', 'video'],
      default: 'text'
    },
    sender: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true }
  },
  {
    collection: COLLECTION_NAME
  }
);

const MessageModel = model(DOCUMENT_NAME, MessageSchema);

class MessageClass {
  static async createMessage(message) {
    return await MessageModel.create(message);
  }
  static async checkExist(select) {
    return await MessageModel.findOne(select).lean();
  }
}

module.exports = {
  MessageClass,
  MessageModel
};

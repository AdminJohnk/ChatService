'use strict';

const { model, Schema, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Conversation';
const COLLECTION_NAME = 'conversations';

const { avt_default, pp_UserDefault } = require('../utils/constants');

const ConversationSchema = new Schema(
  {
    // common
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [ObjectId], ref: 'User', required: true },
    lastMessage: { type: ObjectId, ref: 'Message', default: null },

    // private

    // group
    author: { type: ObjectId, ref: 'User' },
    name: { type: String },
    image: { type: String, default: avt_default }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ConversationModel = model(DOCUMENT_NAME, ConversationSchema);

class ConversationClass {
  static async checkExist(select) {
    return await ConversationModel.findOne(select).lean();
  }
  static async updateLastMessage({ conversation_id, message_id }) {
    return await ConversationModel.findByIdAndUpdate(conversation_id, {
      lastMessage: message_id
    });
  }
}

module.exports = {
  ConversationClass,
  ConversationModel
};

'use strict';

const { model, Schema, Types } = require('mongoose');
require('./user.model');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Conversation';
const COLLECTION_NAME = 'conversations';

const { pp_UserDefault } = require('../utils/constants');

const ConversationSchema = new Schema(
  {
    // common
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [ObjectId], ref: 'User', required: true },
    lastMessage: { type: ObjectId, ref: 'Message', default: null },
    seen: { type: [ObjectId], ref: 'User', default: [] },

    // private

    // group
    admins: { type: [ObjectId], ref: 'User', default: [] },
    creator: { type: ObjectId, ref: 'User' },
    name: String,
    image: String,
    cover_image: String
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

ConversationSchema.index({ members: 1, updatedAt: -1 });

const ConversationModel = model(DOCUMENT_NAME, ConversationSchema);

class ConversationClass {
  static async checkExist(select) {
    return await ConversationModel.findOne(select).lean();
  }
  static async updateLastMessage({ conversation_id, message_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { lastMessage: message_id, seen: [] },
      { new: true }
    ).lean();
  }
  static async seenMessage({ conversation_id, user_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $addToSet: { seen: user_id } },
      { new: true, timestamps: false }
    )
      .populate('seen', pp_UserDefault)
      .lean();
  }
  static async unseenMessage({ conversation_id, user_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $pull: { seen: user_id } },
      { new: true, timestamps: false }
    )
      .populate('seen', pp_UserDefault)
      .lean();
  }
}

module.exports = {
  ConversationClass,
  ConversationModel
};

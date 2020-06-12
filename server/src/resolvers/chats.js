const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const Chat = require('../models/chat');
const User = require('../models/user');

const chatsResolvers = {
  Query: {
    chat: async (_, { chatId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get messages from given chat
        const chat = await Chat.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(chatId) },
          },
          {
            $lookup: {
              from: 'messages',
              localField: 'messages',
              foreignField: '_id',
              as: 'messages',
            },
          },
        ]);

        return chat[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    chats: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Get all chat participanted by given user
        const userChats = await User.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(userId) },
          },
          {
            $lookup: {
              from: 'chats',
              let: { chats: '$chats' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$chats'] } } },
                {
                  $lookup: {
                    from: 'users',
                    let: { participants: '$participants' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              {
                                $in: ['$_id', '$$participants'],
                              },
                              {
                                $ne: ['$_id', mongoose.Types.ObjectId(userId)],
                              },
                            ],
                          },
                        },
                      },
                    ],
                    as: 'participants',
                  },
                },
                { $sort: { updatedAt: -1 } },
              ],
              as: 'chats',
            },
          },
          {
            $project: { chats: 1 },
          },
        ]);

        return userChats[0].chats;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    createChat: async (_, { recipientId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Query for chat that contains both users
        const existingChat = await Chat.findOne({
          participants: { $all: [userId, recipientId] },
        });

        // If chat does not exist
        if (!existingChat) {
          // Create & save chat && get chat creator & recipient
          const [chat, creator, recipient] = await Promise.all([
            Chat.create({
              participants: [userId, recipientId],
            }),
            User.findById(userId),
            User.findById(recipientId),
          ]);

          // Add chat to creator & recipient
          creator.chats.push(chat);
          recipient.chats.push(chat);
          await Promise.all([creator.save(), recipient.save()]);

          // Populate new chat participants
          const createdChat = await Chat.populate(chat, {
            path: 'participants',
            match: { _id: { $ne: userId } },
          });

          return createdChat;
        }

        return existingChat;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = chatsResolvers;

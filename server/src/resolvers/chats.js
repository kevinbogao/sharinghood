const { AuthenticationError } = require('apollo-server');
const Chat = require('../models/chat');
const User = require('../models/user');

const chatsResolvers = {
  Query: {
    chat: async (_, { chatId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const chat = await Chat.findById(chatId).populate('messages');
        return chat;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    chats: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        const currentUser = await User.findById(userId);

        // Sort chats by last updated
        const chats = await Chat.find({
          _id: { $in: currentUser.chats },
        })
          .populate({
            path: 'participants',
            match: { _id: { $ne: userId } },
          })
          .sort({ updatedAt: -1 });

        return chats;
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

        // Create chat if !exist
        if (!existingChat) {
          const chat = new Chat({
            participants: [userId, recipientId],
          });

          // Save chat
          const result = await chat.save();

          // Save to users
          const creator = await User.findById(userId);
          const recipient = await User.findById(recipientId);
          creator.chats.push(chat);
          recipient.chats.push(chat);
          await creator.save();
          await recipient.save();

          // Populate new chat participants
          const createdChat = await Chat.populate(result, {
            path: 'participants',
            match: { _id: { $ne: userId } },
          });

          return createdChat;
        }

        return existingChat;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = chatsResolvers;

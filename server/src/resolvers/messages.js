const { PubSub, withFilter, AuthenticationError } = require('apollo-server');
const Chat = require('../models/chat');
const Message = require('../models/message');

const pubsub = new PubSub();
const NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE';

const messagesResolvers = {
  Subscription: {
    newChatMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHAT_MESSAGE),
        (payload, args) => payload.chatId === args.chatId
      ),
    },
  },
  Query: {
    messages: async (_, { chatId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const messages = await Message.find({ chat: chatId });
        return messages;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createMessage: async (_, { messageInput: { chatId, text } }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Create new message document
        const message = new Message({
          text,
          sender: userId,
          chat: chatId,
        });

        // Save message & get message parent
        const [result, chat] = await Promise.all([
          message.save(),
          Chat.findById(chatId),
        ]);

        // Save messageId to chat
        chat.messages.push(message);
        await chat.save();

        // Publish new message
        pubsub.publish(NEW_CHAT_MESSAGE, {
          chatId,
          newChatMessage: message,
        });

        return result;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = messagesResolvers;

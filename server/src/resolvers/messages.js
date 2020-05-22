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
        (payload, args) => {
          return payload.chatId === args.chatId;
        }
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
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createMessage: async (_, { messageInput: { chatId, text } }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        const message = new Message({
          text,
          sender: userId,
          chat: chatId,
        });
        const result = await message.save();
        const chat = await Chat.findById(chatId);
        chat.messages.push(message);
        await chat.save();

        // Publish new message
        pubsub.publish(NEW_CHAT_MESSAGE, {
          chatId,
          newChatMessage: message,
        });
        // return messageControllers.addMessage(args);

        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = messagesResolvers;

const { withFilter, AuthenticationError } = require('apollo-server');
const pubsub = require('../middleware/pubsub');
const Chat = require('../models/chat');
const Message = require('../models/message');

const NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE';

const messagesResolvers = {
  Subscription: {
    newChatMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHAT_MESSAGE),
        (payload, args) => {
          console.log(payload);
          console.log(args);
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
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createMessage: async (_, { messageInput: { chatId, text } }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Create and save message & get message parent
        const [message, chat] = await Promise.all([
          Message.create({
            text,
            sender: userId,
            chat: chatId,
          }),
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

        return message;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = messagesResolvers;

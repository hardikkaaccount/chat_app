import React from 'react';
import Messages from './Messages';
import InputArea from './InputArea';
import { Message } from '../interfaces';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage }) => {
  return (
    <div className="chat-area">
      <Messages messages={messages} />
      <InputArea onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatArea;
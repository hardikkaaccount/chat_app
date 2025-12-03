import React from 'react';
import { Message } from '../interfaces';

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="messages">
      {messages.map(message => (
        <div key={message.id} className="message">
          <strong>{message.username || 'Unknown'}:</strong> {message.content}
        </div>
      ))}
    </div>
  );
};

export default Messages;
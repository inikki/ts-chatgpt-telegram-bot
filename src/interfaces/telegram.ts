import { ChatType } from 'node-telegram-bot-api';

export interface ChatData {
  chatId: number;
  chatType: ChatType;
  userId: number;
  userFirstName: string;
}

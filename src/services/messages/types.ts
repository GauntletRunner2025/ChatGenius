export interface DirectMessage {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  inserted_at: string;
}

export interface MessageError {
  message: string;
  code?: string;
} 
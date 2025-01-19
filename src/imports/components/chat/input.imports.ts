import { useState, FormEvent } from 'react';
import { useMessageStore } from '../../../stores/messageStore';
import { useAuth } from '../../../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export interface MessageInputProps {
    channelId: number;
}

export { useState, type FormEvent, useMessageStore, useAuth, PaperAirplaneIcon }; 
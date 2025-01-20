import React, { useState, type FormEvent } from 'react';
import { useMessageStore } from '../../../stores/messageStore';
import { useAuth } from '../../../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export type MessageInputProps = {
  channelId: number;
};

export {
  React,
  useState,
  type FormEvent,
  useMessageStore,
  useAuth,
  PaperAirplaneIcon,
}; 
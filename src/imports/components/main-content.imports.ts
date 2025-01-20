import React, { useState } from 'react';
import { useChannelStore } from '../../stores/channelStore';
import { ChatMessages } from '../../components/ChatMessages';
import { MessageInput } from '../../components/MessageInput';
import { QueryTab } from '../../components/QueryTab';

export type Tab = 'chat' | 'files' | 'query';

export interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export { React, useState, useChannelStore, ChatMessages, MessageInput, QueryTab }; 
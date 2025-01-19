import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

export interface Message {
    id: number;
    message: string;
    embedding: number[];
}

export { useEffect, useState, supabase }; 
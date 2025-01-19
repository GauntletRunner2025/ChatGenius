import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// String constants
const STRINGS = {
  LABELS: {
    SEARCH_MESSAGES: 'Search Messages',
    SEARCH_PLACEHOLDER: 'Enter your search term...',
    NO_RESULTS: 'No results found',
    LOADING_RESULTS: 'Loading results...',
    LOADING_EMBEDDINGS: 'Loading embeddings...',
    CALCULATING: 'Calculating similarities...',
  },
  BUTTON_STATES: {
    SEARCHING: 'Searching...',
    SEARCH: 'Search',
  },
  ERRORS: {
    SEARCH_ERROR: 'Search error:',
    EMBEDDING_LOAD: 'Error loading embeddings:',
    EMBEDDING_CALCULATION: 'Error calculating embedding:',
  },
  TABLE: {
    CHANNEL: 'Channel',
    USER: 'User',
    MESSAGE: 'Message',
  },
} as const;

// CSS class constants
const CLASSES = {
  CONTAINER: 'p-4 max-w-3xl mx-auto',
  SEARCH_GROUP: 'mb-4',
  LABEL: 'block text-sm font-medium text-gray-700 mb-2',
  INPUT_GROUP: 'flex gap-2',
  INPUT: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
  BUTTON: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50',
  RESULTS_CONTAINER: 'mt-4',
  TABLE: 'min-w-full divide-y divide-gray-200',
  TABLE_HEADER: 'bg-gray-50',
  TH: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  TR: 'bg-white',
  TD: 'px-6 py-4 whitespace-normal text-sm text-gray-500',
  CHANNEL_BADGE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  USERNAME: 'font-medium text-gray-900',
  NO_RESULTS: 'text-center py-4 text-gray-500',
  LOADING: 'text-center py-4 text-gray-500 animate-pulse',
} as const;

interface SearchResult {
  channelName: string;
  username: string;
  message: string;
  similarity: number;
  timestamp: string;
}

interface MessageWithEmbedding {
  id: string;
  message: string;
  embedding: number[];
  channel: {
    slug: string;
  };
  user: {
    username: string;
  };
  created_at: string;
}

interface SearchTabProps {
  // Add props as needed
}

// Cache keys
const CACHE_KEYS = {
  EMBEDDINGS: 'chat_embeddings_cache',
  LAST_UPDATED: 'chat_embeddings_last_updated',
} as const;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cosine similarity calculation
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export function SearchTab({}: SearchTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [cachedEmbeddings, setCachedEmbeddings] = useState<MessageWithEmbedding[]>([]);

  // Load cached embeddings on component mount
  useEffect(() => {
    console.log('SearchTab component initialized');
    loadCachedEmbeddings();
  }, []);

  // Monitor search term changes
  useEffect(() => {
    console.log('Search term updated:', searchTerm);
  }, [searchTerm]);

  const loadCachedEmbeddings = async () => {
    console.log('Loading cached embeddings...');
    const cachedData = localStorage.getItem(CACHE_KEYS.EMBEDDINGS);
    const lastUpdated = localStorage.getItem(CACHE_KEYS.LAST_UPDATED);
    
    if (cachedData && lastUpdated) {
      const parsedLastUpdated = parseInt(lastUpdated, 10);
      const isExpired = Date.now() - parsedLastUpdated > CACHE_TTL;
      console.log('Cache status:', isExpired ? 'expired' : 'valid');
      
      if (!isExpired) {
        setCachedEmbeddings(JSON.parse(cachedData));
        console.log('Using cached embeddings');
        return;
      }
    }
    
    // Cache is expired or doesn't exist, fetch fresh data
    console.log('Cache miss - fetching fresh embeddings');
    await refreshEmbeddingsCache();
  };

  const refreshEmbeddingsCache = async () => {
    setIsLoadingEmbeddings(true);
    setProgress({ current: 0, total: 0, status: STRINGS.LABELS.LOADING_EMBEDDINGS });
    
    try {
      const freshEmbeddings = await fetchMessageEmbeddings();
      
      // Update cache
      localStorage.setItem(CACHE_KEYS.EMBEDDINGS, JSON.stringify(freshEmbeddings));
      localStorage.setItem(CACHE_KEYS.LAST_UPDATED, Date.now().toString());
      
      setCachedEmbeddings(freshEmbeddings);
    } catch (error) {
      console.error(STRINGS.ERRORS.EMBEDDING_LOAD, error);
    } finally {
      setIsLoadingEmbeddings(false);
    }
  };

  // Fetch the embedding for the search query
  const getQueryEmbedding = async (query: string): Promise<{ embedding: number[], searchId: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/getEmbedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: query }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get embedding');
      }
      const data = await response.json();
      return { embedding: data.embedding, searchId: session.user.id };
    } catch (error) {
      console.error(STRINGS.ERRORS.EMBEDDING_CALCULATION, error);
      throw error;
    }
  };

  // Fetch all message embeddings from Supabase
  const fetchMessageEmbeddings = async (): Promise<MessageWithEmbedding[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        message,
        embeddings,
        inserted_at,
        channel:channel!inner(slug),
        user:users!inner(username)
      `)
      .not('embeddings', 'is', null);

    if (error) {
      console.error(STRINGS.ERRORS.EMBEDDING_LOAD, error);
      throw error;
    }

    // Transform the data to match our interface
    const transformedData = (data || []).map(item => ({
      ...item,
      embedding: item.embeddings,
      created_at: item.inserted_at,
      channel: { slug: item.channel[0]?.slug || '' },
      user: { username: item.user[0]?.username || '' }
    }));

    return transformedData as MessageWithEmbedding[];
  };

  // Search through embeddings and return top matches
  const searchEmbeddings = (
    queryEmbedding: number[],
    messageEmbeddings: MessageWithEmbedding[],
    topK: number = 5
  ): SearchResult[] => {
    const results = messageEmbeddings
      .map((message) => ({
        similarity: cosineSimilarity(queryEmbedding, message.embedding),
        message: message.message,
        channelName: message.channel.slug,
        username: message.user.username,
        timestamp: message.created_at,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return results;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    console.log('Starting search for:', searchTerm);
    
    try {
      // Get query embedding
      console.log('Fetching query embedding...');
      const response = await getQueryEmbedding(searchTerm);
      const { embedding, searchId } = response;
      console.log('Got query embedding, searchId:', searchId);
      
      // Use cached embeddings
      setProgress({ 
        current: 0, 
        total: cachedEmbeddings.length, 
        status: STRINGS.LABELS.CALCULATING 
      });
      console.log('Searching through', cachedEmbeddings.length, 'cached embeddings');
      
      // Perform search
      const searchResults = searchEmbeddings(embedding, cachedEmbeddings);
      console.log('Search complete, found', searchResults.length, 'results');
      setResults(searchResults);

      // Update search status and results
      console.log('Updating search status in database...');
      await supabase.from('searches')
        .update({
          results: searchResults,
          status: 'completed'
        })
        .eq('user_id', searchId)
        .eq('query', searchTerm);
      console.log('Search status updated successfully');
      
    } catch (error) {
      console.error(STRINGS.ERRORS.SEARCH_ERROR, error);
    } finally {
      setIsSearching(false);
      setProgress({ current: 0, total: 0, status: '' });
      console.log('Search operation completed');
    }
  };

  const renderResults = () => {
    if (isLoadingEmbeddings) {
      return (
        <div className={CLASSES.LOADING}>
          {progress.status || STRINGS.LABELS.LOADING_RESULTS}
          {progress.total > 0 && ` (${progress.current}/${progress.total})`}
        </div>
      );
    }

    if (results.length === 0 && searchTerm.trim() !== '') {
      return <div className={CLASSES.NO_RESULTS}>{STRINGS.LABELS.NO_RESULTS}</div>;
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <table className={CLASSES.TABLE}>
        <thead className={CLASSES.TABLE_HEADER}>
          <tr>
            <th className={CLASSES.TH}>{STRINGS.TABLE.CHANNEL}</th>
            <th className={CLASSES.TH}>{STRINGS.TABLE.USER}</th>
            <th className={CLASSES.TH}>{STRINGS.TABLE.MESSAGE}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className={CLASSES.TR}>
              <td className={CLASSES.TD}>
                <span className={CLASSES.CHANNEL_BADGE}>
                  #{result.channelName}
                </span>
              </td>
              <td className={CLASSES.TD}>
                <span className={CLASSES.USERNAME}>{result.username}</span>
              </td>
              <td className={CLASSES.TD}>{result.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={CLASSES.CONTAINER}>
      <div className={CLASSES.SEARCH_GROUP}>
        <label
          htmlFor="search"
          className={CLASSES.LABEL}
        >
          {STRINGS.LABELS.SEARCH_MESSAGES}
        </label>
        <div className={CLASSES.INPUT_GROUP}>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={STRINGS.LABELS.SEARCH_PLACEHOLDER}
            className={CLASSES.INPUT}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={CLASSES.BUTTON}
          >
            {isSearching ? STRINGS.BUTTON_STATES.SEARCHING : STRINGS.BUTTON_STATES.SEARCH}
          </button>
        </div>
      </div>

      <div className={CLASSES.RESULTS_CONTAINER}>
        {renderResults()}
      </div>
    </div>
  );
} 
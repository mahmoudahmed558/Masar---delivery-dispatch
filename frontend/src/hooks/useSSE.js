import { useState, useEffect } from 'react';

export function useSSE(url) {
  const [data, setData] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(() => {
        setReconnectCount(c => c + 1);
      }, 5000);
    };

    return () => eventSource.close();
  }, [url, reconnectCount]);

  return data;
}

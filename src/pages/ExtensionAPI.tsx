
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// This component handles API requests from the browser extension
const ExtensionAPI = () => {
  useEffect(() => {
    // Listen for extension API calls
    const handleExtensionMessage = async (event: MessageEvent) => {
      // Only accept messages from the extension
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'DM_DECODER_ANALYZE') {
        try {
          const { message, tone } = event.data.payload;
          
          // Use the existing demo analysis function
          const { data, error } = await supabase.functions.invoke('generate-demo-reply', {
            body: { message, tone },
          });

          if (error) throw error;

          // Send response back to extension
          event.source?.postMessage({
            type: 'DM_DECODER_RESPONSE',
            payload: {
              success: true,
              intent: data.intent,
              suggestedReply: data.suggestedReply
            }
          }, event.origin);
          
        } catch (error) {
          event.source?.postMessage({
            type: 'DM_DECODER_RESPONSE',
            payload: {
              success: false,
              error: 'Analysis failed'
            }
          }, event.origin);
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ExtensionAPI;

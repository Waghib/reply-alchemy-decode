
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// This component handles API requests from the browser extension
const ExtensionAPI = () => {
  const { user, subscribed } = useAuth();

  useEffect(() => {
    console.log('ExtensionAPI mounted, user:', user, 'subscribed:', subscribed);
    
    // Create API endpoints for the extension
    const handleApiRequest = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const { type, path, method, body } = event.data;
      
      if (type !== 'EXTENSION_API_REQUEST') return;
      
      console.log('Handling extension API request:', { type, path, method });
      
      let response;
      
      try {
        switch (path) {
          case '/api/auth/check':
            response = {
              authenticated: !!user,
              user: user ? { id: user.id, email: user.email } : null,
              subscribed
            };
            console.log('Auth check response:', response);
            break;
            
          case '/api/auth/logout':
            if (method === 'POST') {
              await supabase.auth.signOut();
              response = { success: true };
            }
            break;
            
          case '/api/analyze':
            if (method === 'POST' && user && subscribed) {
              const { message, tone } = body;
              const { data, error } = await supabase.functions.invoke('analyze-message', {
                body: { message, tone },
                headers: {
                  Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
              });
              
              if (error) throw error;
              response = data;
            } else {
              throw new Error('Unauthorized or not subscribed');
            }
            break;
            
          case '/api/demo-analyze':
            if (method === 'POST') {
              const { message, tone } = body;
              const { data, error } = await supabase.functions.invoke('generate-demo-reply', {
                body: { message, tone },
              });
              
              if (error) throw error;
              response = data;
            }
            break;
            
          default:
            throw new Error('Endpoint not found');
        }
        
        // Send response back
        console.log('Sending response:', response);
        event.source?.postMessage({
          type: 'EXTENSION_API_RESPONSE',
          success: true,
          data: response
        }, { targetOrigin: event.origin });
        
      } catch (error) {
        console.error('Extension API error:', error);
        event.source?.postMessage({
          type: 'EXTENSION_API_RESPONSE',
          success: false,
          error: error.message
        }, { targetOrigin: event.origin });
      }
    };

    // Also handle direct extension API calls via window.extensionAPI
    window.extensionAPI = {
      checkAuth: () => {
        const result = {
          authenticated: !!user,
          user: user ? { id: user.id, email: user.email } : null,
          subscribed
        };
        console.log('Direct API auth check:', result);
        return result;
      },
      
      logout: async () => {
        await supabase.auth.signOut();
        return { success: true };
      },
      
      analyze: async (message: string, tone: string) => {
        if (!user || !subscribed) {
          throw new Error('Unauthorized or not subscribed');
        }
        
        const { data, error } = await supabase.functions.invoke('analyze-message', {
          body: { message, tone },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });
        
        if (error) throw error;
        return data;
      },
      
      demoAnalyze: async (message: string, tone: string) => {
        const { data, error } = await supabase.functions.invoke('generate-demo-reply', {
          body: { message, tone },
        });
        
        if (error) throw error;
        return data;
      }
    };

    window.addEventListener('message', handleApiRequest);
    
    // Also broadcast auth status change when user state changes
    const broadcastAuthChange = () => {
      window.postMessage({
        type: 'AUTH_STATE_CHANGED',
        authenticated: !!user,
        user: user ? { id: user.id, email: user.email } : null,
        subscribed
      }, window.location.origin);
    };
    
    broadcastAuthChange();
    
    return () => {
      window.removeEventListener('message', handleApiRequest);
      delete window.extensionAPI;
    };
  }, [user, subscribed]);

  return null;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    extensionAPI?: {
      checkAuth: () => any;
      logout: () => Promise<any>;
      analyze: (message: string, tone: string) => Promise<any>;
      demoAnalyze: (message: string, tone: string) => Promise<any>;
    };
  }
}

export default ExtensionAPI;

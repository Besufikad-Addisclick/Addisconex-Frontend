// Global API error handler utility
export const handleApiError = (error: any, router?: any) => {
  if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    // Dispatch custom event for 401 errors
    window.dispatchEvent(new CustomEvent('unauthorized', { detail: error }));
    
    if (router) {
      router.push('/auth/login');
    }
    return true; // Indicates error was handled
  }
  return false; // Error not handled
};

// Fetch wrapper with automatic 401 handling
export const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      handleApiError({ status: 401, message: 'Unauthorized' });
      throw new Error('Unauthorized: Please log in again');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      handleApiError(error);
    }
    throw error;
  }
};
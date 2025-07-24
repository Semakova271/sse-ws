const createRequest = async (options) => {
  // For WebSocket chat, we might not need this for basic functionality
  // But keeping it for potential REST API calls
  try {
    const response = await fetch(options.url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.data ? JSON.stringify(options.data) : null,
    });
    
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export default createRequest;
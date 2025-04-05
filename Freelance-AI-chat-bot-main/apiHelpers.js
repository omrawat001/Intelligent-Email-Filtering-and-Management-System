class ApiHelpers {
    static async makeApiRequest(config) {
      try {
        const response = await axios({
          method: config.method || 'get',
          url: config.url,
          params: config.params,
          data: config.data,
          headers: config.headers,
          auth: config.auth
        });
        return response.data;
      } catch (error) {
        console.error(`API request failed to ${config.url}:`, error.message);
        throw error;
      }
    }
  
    static handleRateLimit(apiName) {
      // Implement rate limiting logic specific to each API
      // This is just a placeholder
      return new Promise(resolve => {
        const delay = apiName === 'github' ? 1000 : 500;
        setTimeout(resolve, delay);
      });
    }
  }
  
  module.exports = ApiHelpers;
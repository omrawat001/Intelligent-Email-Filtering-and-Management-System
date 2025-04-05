const OpenAI = require('openai');

class ChatService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Initialize with a system message
    this.systemMessage = {
      role: "system",
      content: "You are a helpful assistant that helps users find freelance jobs. " +
               "When users ask for jobs, extract key search terms from their message " +
               "and respond with a brief message about the jobs you'll find. " +
               "Keep responses concise and professional. " +
               "If the user doesn't specify a job type, ask for clarification."
    };
  }

  async processMessage(userMessage, filters = {}) {
    try {
      // In a production app, you might have more sophisticated processing
      if (!userMessage.trim()) {
        return {
          text: "Please tell me what kind of jobs you're looking for.",
          searchQuery: ''
        };
      }
      
      // Use AI to generate a response and extract search terms
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          this.systemMessage,
          {
            role: "user",
            content: `User message: "${userMessage}". Extract job search terms and generate a brief response.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Extract search terms - in a real app you might use more sophisticated NLP
      const searchQuery = this.extractSearchTerms(userMessage);
      
      return {
        text: aiResponse,
        searchQuery: searchQuery
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);
      
      // Fallback response if AI fails
      return {
        text: "I found some jobs that might interest you:",
        searchQuery: this.extractSearchTerms(userMessage)
      };
    }
  }
  
  extractSearchTerms(text) {
    // Simple keyword extraction - replace with more sophisticated NLP in production
    const jobTypes = ['developer', 'designer', 'writer', 'marketer', 'engineer'];
    const technologies = ['react', 'python', 'javascript', 'node', 'django'];
    
    const words = text.toLowerCase().split(/\s+/);
    
    // Find job types mentioned
    const foundJobTypes = jobTypes.filter(type => 
      words.some(word => word.includes(type))
    );
    
    // Find technologies mentioned
    const foundTechs = technologies.filter(tech => 
      words.some(word => word.includes(tech))
    );
    
    // Combine relevant terms
    return [...foundJobTypes, ...foundTechs].join(' ') || text;
  }
}

module.exports = ChatService;
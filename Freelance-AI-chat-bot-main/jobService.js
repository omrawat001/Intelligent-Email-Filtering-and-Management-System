const axios = require('axios');

class JobService {
  constructor() {
    // Configure API endpoints and keys
    this.jobApis = {
      github: {
        url: 'https://jobs.github.com/positions.json',
        params: {
          description: '',
          location: ''
        }
      },
      reed: {
        url: 'https://www.reed.co.uk/api/1.0/search',
        auth: {
          username: process.env.REED_API_KEY,
          password: ''
        }
      },
      // Add more job APIs as needed
    };
  }

  async fetchJobs(query = '', filters = {}) {
    try {
      // In a real app, you would:
      // 1. Determine which API to use based on query/filters
      // 2. Format the request properly for each API
      // 3. Normalize the response data
      
      // For demo purposes, we'll simulate API calls
      return this.mockFetchJobs(query, filters);
      
      // Example real API call:
      // const response = await axios.get(this.jobApis.github.url, {
      //   params: {
      //     description: query,
      //     location: filters.location || '',
      //     full_time: filters.type === 'full-time' ? 'true' : ''
      //   }
      // });
      // return this.normalizeJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  // Mock function for development
  mockFetchJobs(query, filters) {
    const mockJobs = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Remote',
        type: 'Contract',
        description: 'We are looking for an experienced React developer to join our team.',
        skills: ['React', 'JavaScript', 'Redux'],
        url: 'https://example.com/jobs/1'
      },
      {
        id: '2',
        title: 'UI/UX Designer',
        company: 'DesignHub',
        location: 'New York, NY',
        type: 'Full-time',
        description: 'Join our design team to create beautiful user experiences.',
        skills: ['Figma', 'Sketch', 'UI Design'],
        url: 'https://example.com/jobs/2'
      },
      {
        id: '3',
        title: 'Python Backend Engineer',
        company: 'DataSystems',
        location: 'Remote',
        type: 'Part-time',
        description: 'Looking for Python developer with Flask/Django experience.',
        skills: ['Python', 'Django', 'REST API'],
        url: 'https://example.com/jobs/3'
      }
    ];

    // Simple filtering for demo purposes
    return mockJobs.filter(job => {
      // Filter by category (simplified)
      if (filters.category) {
        if (filters.category === 'development' && !job.title.toLowerCase().includes('developer') && !job.title.toLowerCase().includes('engineer')) {
          return false;
        }
        if (filters.category === 'design' && !job.title.toLowerCase().includes('design')) {
          return false;
        }
      }
      
      // Filter by type
      if (filters.type && job.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by query
      if (query && !job.title.toLowerCase().includes(query.toLowerCase()) && 
          !job.description.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  normalizeJobs(jobs) {
    // Normalize job data from different APIs to a consistent format
    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company || job.company_name,
      location: job.location,
      type: job.type || job.employment_type,
      description: job.description,
      skills: job.tags || job.requirements ? job.requirements.split(',') : [],
      url: job.url || job.apply_url
    }));
  }
}

module.exports = JobService;
// Simple API Service for MySQL Integration
class ApiService {
  private baseUrl: string;
  private getToken: (() => string | null) | null = null;

  constructor(baseUrl: string = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  // Set token getter function
  setTokenGetter(getToken: () => string | null) {
    this.getToken = getToken;
  }

  // Helper method for API calls with authentication
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add Authorization header if token is available
      if (this.getToken) {
        const token = this.getToken();
        if (token && !token.startsWith('demo-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Guest Management APIs
  async getGuests() {
    try {
      const data = await this.apiCall('/guests');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async addGuest(guestData: {
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    guestCount: number;
  }) {
    try {
      const data = await this.apiCall('/guests', {
        method: 'POST',
        body: JSON.stringify(guestData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateGuest(guestId: string, guestData: any) {
    try {
      const data = await this.apiCall(`/guests/${guestId}`, {
        method: 'PUT',
        body: JSON.stringify(guestData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteGuest(guestId: string) {
    try {
      const data = await this.apiCall(`/guests/${guestId}`, {
        method: 'DELETE',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // RSVP APIs
  async submitRsvp(rsvpData: {
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    attendanceStatus: string;
    guestCount: number;
    message?: string;
  }) {
    try {
      const data = await this.apiCall('/rsvp', {
        method: 'POST',
        body: JSON.stringify(rsvpData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getRsvpResponses() {
    try {
      const data = await this.apiCall('/rsvp');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Wedding Settings APIs
  async getWeddingSettings() {
    try {
      const data = await this.apiCall('/wedding-settings');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getAllWeddingSettings() {
    try {
      const data = await this.apiCall('/wedding-settings/all');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateWeddingSettings(settingsData: any) {
    try {
      const data = await this.apiCall('/wedding-settings', {
        method: 'POST',
        body: JSON.stringify(settingsData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async activateWeddingSetting(id: number) {
    try {
      const data = await this.apiCall(`/wedding-settings/${id}/activate`, {
        method: 'PUT',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteWeddingSetting(id: number) {
    try {
      const data = await this.apiCall(`/wedding-settings/${id}`, {
        method: 'DELETE',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Test connection
  async testConnection() {
    try {
      const data = await this.apiCall('/health');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService };

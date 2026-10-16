import {
  User, UserProfile, ProfileCompletion, Scheme, RecommendationResponse,
  UploadedDocument, ApplicationTrackerItem, SavedSchemeItem, ChatMessage
} from '../types';

const rawEnvUrl = (import.meta as any).env?.VITE_API_BASE_URL?.trim();
const API_BASE_URL = rawEnvUrl
  ? (rawEnvUrl.endsWith('/api') ? rawEnvUrl : `${rawEnvUrl.replace(/\/+$/, '')}/api`)
  : 'http://127.0.0.1:8000/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('yojana_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; full_name: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async getProfileCompletion(): Promise<ProfileCompletion> {
    const res = await fetch(`${API_BASE_URL}/profile/completion`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch completion');
    return res.json();
  },

  // Documents
  async uploadDocument(file: File, documentType: string): Promise<UploadedDocument> {
    const token = localStorage.getItem('yojana_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Document upload failed');
    }
    return res.json();
  },

  async getDocuments(): Promise<UploadedDocument[]> {
    const res = await fetch(`${API_BASE_URL}/documents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async confirmDocumentData(documentId: string, confirmedFields: Record<string, any>, syncToProfile = true) {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/confirm-extracted-data`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmed_fields: confirmedFields, sync_to_profile: syncToProfile }),
    });
    if (!res.ok) throw new Error('Failed to confirm data');
    return res.json();
  },

  async deleteDocument(documentId: string) {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  // Schemes
  async getSchemes(params?: {
    q?: string;
    category?: string;
    state?: string;
    government_level?: string;
    beneficiary?: string;
  }): Promise<Scheme[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.state) query.append('state', params.state);
    if (params?.government_level) query.append('government_level', params.government_level);
    if (params?.beneficiary) query.append('beneficiary', params.beneficiary);

    const res = await fetch(`${API_BASE_URL}/schemes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch schemes');
    return res.json();
  },

  async getSchemeDetail(schemeId: string): Promise<Scheme> {
    const res = await fetch(`${API_BASE_URL}/schemes/${schemeId}`);
    if (!res.ok) throw new Error('Scheme not found');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/schemes/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  // Recommendations
  async getRecommendations(): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  async refreshRecommendations(): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE_URL}/recommendations/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate recommendations');
    return res.json();
  },

  // Saved Schemes & Applications
  async saveScheme(schemeId: string) {
    const res = await fetch(`${API_BASE_URL}/saved-schemes/${schemeId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to save scheme');
    return res.json();
  },

  async getSavedSchemes(): Promise<SavedSchemeItem[]> {
    const res = await fetch(`${API_BASE_URL}/saved-schemes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load saved schemes');
    return res.json();
  },

  async unsaveScheme(schemeId: string) {
    const res = await fetch(`${API_BASE_URL}/saved-schemes/${schemeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove saved scheme');
    return res.json();
  },

  async getApplications(): Promise<ApplicationTrackerItem[]> {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  },

  async trackApplication(schemeId: string, status = 'interested', notes?: string) {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scheme_id: schemeId, status, notes }),
    });
    if (!res.ok) throw new Error('Failed to track application');
    return res.json();
  },

  async updateApplication(trackerId: string, data: { status?: string; reference_number?: string; notes?: string }) {
    const res = await fetch(`${API_BASE_URL}/applications/${trackerId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  async deleteApplication(trackerId: string) {
    const res = await fetch(`${API_BASE_URL}/applications/${trackerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete application record');
    return res.json();
  },

  // Assistant
  async sendChatMessage(message: string, schemeId?: string): Promise<{
    reply: string;
    relevant_schemes?: Array<{ id: string; name: string; benefits: string; official_url: string }>;
    sources?: string[];
    disclaimer: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, scheme_id: schemeId }),
    });
    if (!res.ok) throw new Error('Assistant failed to respond');
    return res.json();
  },

  // Admin
  async getAdminQualityReport() {
    const res = await fetch(`${API_BASE_URL}/admin/data-quality`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Forbidden or failed');
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Forbidden or failed');
    return res.json();
  },

  async toggleSchemeVerification(schemeId: string, statusLabel: string) {
    const res = await fetch(`${API_BASE_URL}/admin/schemes/${schemeId}/verify?status_label=${statusLabel}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to update verification status');
    return res.json();
  }
};

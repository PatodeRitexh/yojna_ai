export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  dob?: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  pin_code?: string;
  residence_type?: 'urban' | 'rural' | 'semi_urban';
  education_level?: string;
  education_status?: string;
  course_stream?: string;
  occupation?: string;
  annual_family_income?: number;
  family_size?: number;
  marital_status?: string;
  is_disabled?: boolean;
  disability_percentage?: number;
  is_farmer?: boolean;
  landholding_acres?: number;
  category?: string;
  is_minority?: boolean;
  minority_community?: string;
  has_domicile_certificate?: boolean;
  updated_at?: string;
}

export interface ProfileCompletion {
  percentage: number;
  completed_fields: string[];
  missing_critical_fields: string[];
  suggestions: string[];
}

export interface DateRecord {
  opening_date: string | null;
  closing_date: string | null;
  deadline_type: string;
  is_current_cycle: boolean;
  status_label: string;
  days_remaining: number | null;
}

export interface Scheme {
  id: string;
  official_name: string;
  short_summary: string;
  detailed_description: string;
  benefits_summary: string;
  benefit_amount_min?: number;
  benefit_amount_max?: number;
  benefit_type: string;
  category: string;
  government_level: 'central' | 'state';
  applicable_states: string[];
  target_beneficiaries: string[];
  required_documents: string[];
  application_process: string;
  official_application_url: string;
  official_source_url: string;
  source_authority: string;
  verification_status: 'verified' | 'pending_verification' | 'outdated';
  last_verified_date: string;
  cycle_year: string;
  date_info?: DateRecord;
}

export interface RecommendationItem {
  id: string;
  scheme_id: string;
  scheme_name: string;
  category: string;
  government_level: string;
  benefit_summary: string;
  eligibility_status: 'likely_eligible' | 'potentially_eligible' | 'not_eligible' | 'insufficient_data';
  match_score: number;
  confidence_score: number;
  criteria_satisfied: string[];
  criteria_pending: string[];
  criteria_failed: string[];
  missing_documents: string[];
  explanation: string;
  official_application_url: string;
  official_source_url: string;
  date_info?: DateRecord;
  last_verified_date?: string;
}

export interface RecommendationResponse {
  total_evaluated: number;
  likely_eligible_count: number;
  potentially_eligible_count: number;
  recommendations: RecommendationItem[];
}

export interface ExtractedDocumentData {
  id: string;
  document_id: string;
  raw_text?: string;
  extracted_fields: Record<string, any>;
  user_confirmed_fields: Record<string, any>;
  is_confirmed: boolean;
  confirmed_at?: string;
}

export interface UploadedDocument {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  status: 'uploaded' | 'processing' | 'review_required' | 'verified_by_user' | 'failed';
  error_message?: string;
  created_at: string;
  extracted_data?: ExtractedDocumentData;
}

export interface ApplicationTrackerItem {
  id: string;
  user_id: string;
  scheme_id: string;
  status: 'interested' | 'preparing_documents' | 'ready_to_apply' | 'applied' | 'awaiting_response' | 'approved' | 'rejected' | 'closed_or_expired';
  applied_date?: string;
  reference_number?: string;
  notes?: string;
  portal_link?: string;
  updated_at: string;
  scheme: Scheme;
}

export interface SavedSchemeItem {
  id: string;
  user_id: string;
  scheme_id: string;
  created_at: string;
  scheme: Scheme;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  relevant_schemes?: Array<{
    id: string;
    name: string;
    benefits: string;
    official_url: string;
  }>;
  sources?: string[];
  disclaimer?: string;
}

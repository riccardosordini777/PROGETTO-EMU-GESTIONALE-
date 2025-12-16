export type MoodStatus = '🚀' | '☕' | '🛑' | '🎉' | '🙂'

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  mood_status?: MoodStatus | string | null
  updated_at?: string | null
}

export interface Project {
  id: string
  created_at?: string
  user_id: string
  status: 'Won' | 'Lost' | 'Open' | 'Negotiation' | string
  request_date: string
  client_name: string
  agent_name: string
  project_name: string
  value: number
  notes?: string | null
  pdf_url?: string | null
}


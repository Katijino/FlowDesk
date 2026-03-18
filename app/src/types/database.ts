export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type MessageType = 'confirmation' | 'reminder' | 'on_my_way'
export type MessageStatus = 'pending' | 'sent' | 'failed'
export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'closed'

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  phone: string | null
  service_area: string | null
  slug: string
  email: string | null
  booking_slug: string | null
  created_at: string
  updated_at: string
}

export interface Availability {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  customer_name: string
  phone: string
  email: string | null
  description: string | null
  appointment_time: string
  status: AppointmentStatus
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  user_id: string
  name: string
  phone: string
  email: string | null
  description: string | null
  preferred_time: string | null
  status: LeadStatus
  created_at: string
}

export interface MessageTemplate {
  id: string
  type: MessageType
  message_body: string
  created_at: string
}

export interface MessageQueue {
  id: string
  appointment_id: string
  phone: string
  template_type: MessageType
  send_time: string
  status: MessageStatus
  created_at: string
  updated_at: string
}

export interface JobIntake {
  id: string
  appointment_id: string
  address: string | null
  description: string | null
  notes: string | null
  photo_urls: string[]
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  appointment_id: string | null
  lead_id: string | null
  customer_name: string | null
  customer_phone: string | null
  total_amount: number
  status: InvoiceStatus
  payment_link: string | null
  payment_method: 'stripe' | 'cash' | 'other' | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  price: number
  quantity: number
  created_at: string
}

// Join types
export interface AppointmentWithIntake extends Appointment {
  job_intake: JobIntake | null
}

export interface InvoiceWithItems extends Invoice {
  invoice_items: InvoiceItem[]
  appointments: Appointment | null
}

export interface InvoiceWithCustomer extends InvoiceWithItems {
  lead: Lead | null
}

export interface AppointmentWithBusiness extends Appointment {
  business_profiles: BusinessProfile | null
}

export namespace Database {
  export interface Tables {
    business_profiles: { Row: BusinessProfile }
    availability: { Row: Availability }
    appointments: { Row: Appointment }
    leads: { Row: Lead }
    message_templates: { Row: MessageTemplate }
    message_queue: { Row: MessageQueue }
    job_intake: { Row: JobIntake }
    invoices: { Row: Invoice }
    invoice_items: { Row: InvoiceItem }
  }
}

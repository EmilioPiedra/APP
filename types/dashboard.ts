// Agrega esto al final de tu archivo de tipos
export interface Evento {
  id: string
  type: 'view' | 'click' | 'search'
  product_id?: string
  query?: string
  created_at: string
}

export interface DashboardStats {
  totalProducts: number
  totalInteractions: number
  topSearches: { term: string; count: number }[]
  topProducts: { name: string; count: number; id: string }[]
}
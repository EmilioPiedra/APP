export interface Product {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precio: number | null; // Precio Original (Antes)
  cantidad: number;
  estado: boolean;
  imagenes: string[] | null;
  categoria: string | null;
  en_oferta?: boolean;
  precio_oferta?: number | null;
  precio_original?: number | null; // Útil para cálculos visuales
}
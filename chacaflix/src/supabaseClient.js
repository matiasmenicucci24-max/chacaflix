import { createClient } from "@supabase/supabase-js";

// Credenciales del proyecto de Supabase de Chacaflix.
// Esta clave "anon" está pensada para usarse en el navegador, no hace falta
// ocultarla — la seguridad real se maneja con las políticas de la base de
// datos (RLS), no escondiendo esta clave.
const SUPABASE_URL = "https://madvgcsrkhxynkxwakqf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZHZnY3Nya2h4eW5reHdha3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTQzMzIsImV4cCI6MjEwMzg3MDMzMn0.7fAFpTH7OLaEZnmpEVJzonD4WBNXO3FCewfJ_ivMZ9Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

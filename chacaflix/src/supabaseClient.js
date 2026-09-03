import { createClient } from "@supabase/supabase-js";

// Credenciales del proyecto de Supabase de Chacaflix.
// La "publishable key" está pensada para usarse en el navegador, no hace
// falta ocultarla — la seguridad real se maneja con las políticas de la
// base de datos (RLS), no escondiendo esta clave.
const SUPABASE_URL = "https://madvgcsrkhxynkxwakqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_K4dSVfWEw07o_n1r0NrP9A_V-TjAqpo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://vgdmfnigbbdjvbtphnxh.supabase.co",
  "sb_publishable_qNW9fKrKANJgEAL5KkhgLw_MKm7KvUv"
);

export { supabase as s };

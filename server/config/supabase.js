const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Backend her zaman service_role key ile bağlanır
// Bu key RLS'i atlar, çünkü backend zaten kendi JWT auth'unu yönetiyor
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
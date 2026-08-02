const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ CRITICAL ERROR: SUPABASE_URL is not defined in environment variables or backend/.env');
}

const supabase = createClient(supabaseUrl || 'https://qghgbybeivadnplhfwvw.supabase.co', supabaseKey || 'placeholder-key', {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

const connectDB = async () => {
    try {
        if (!supabaseUrl) {
            console.error('⚠️ Supabase URL missing! Database operations will fail.');
        } else {
            console.log(`✅ Supabase Client initialized with URL: ${supabaseUrl}`);
        }
    } catch (error) {
        console.error(`Supabase Initialization Error: ${error.message}`);
    }
};

module.exports = connectDB;
module.exports.supabase = supabase;
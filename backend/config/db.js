const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qghgbybeivadnplhfwvw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaGdieWJlaXZhZG5wbGhmd3Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg0MjIwNCwiZXhwIjoyMTAwNDE4MjA0fQ.DYQIbIJL52a2aDde5i2yR_fdeNkf2yfAEijgPbAGunQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
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
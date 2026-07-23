const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

const connectDB = async () => {
    try {
        console.log(`Supabase Client initialized with URL: ${supabaseUrl}`);
    } catch (error) {
        console.error(`Supabase Initialization Error: ${error.message}`);
    }
};

module.exports = connectDB;
module.exports.supabase = supabase;
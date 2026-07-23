import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://smymexmkxqqlcpsiyfym.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1leG1reHFxbGNwc2l5ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg2MDAsImV4cCI6MjA4NTEwNDYwMH0.E7f-juplaPEi6yXn2ENiyXOTsO9T1eyzIVWpLHa1l_c';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') {
    window.supabase = { createClient };
    window.ROVERO_SUPABASE_URL = SUPABASE_URL;
    window.ROVERO_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    window.ROVERO_SUPABASE_CLIENT = supabaseClient;
}

export default supabaseClient;

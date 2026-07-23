import os
import urllib.request

def build():
    print("Building local Supabase client bundle...")
    url = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        supabase_core = response.read().decode('utf-8')

    init_code = """
/* ROVERO Local Supabase Client Initialization */
(function() {
    var SUPABASE_URL = 'https://smymexmkxqqlcpsiyfym.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1leG1reHFxbGNwc2l5ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg2MDAsImV4cCI6MjA4NTEwNDYwMH0.E7f-juplaPEi6yXn2ENiyXOTsO9T1eyzIVWpLHa1l_c';
    window.ROVERO_SUPABASE_URL = SUPABASE_URL;
    window.ROVERO_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        window.ROVERO_SUPABASE_CLIENT = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
})();
"""
    output_path = os.path.join("assets", "js", "supabaseClient.bundle.js")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(supabase_core + "\n" + init_code)
    print(f"Successfully generated local bundle: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    build()

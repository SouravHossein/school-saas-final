import sys
from supabase import create_client

# Supabase credentials from environment
url = "https://sfeivzfzqhkxrsxudqpx.supabase.co"  # Replace with your URL
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZWl2emZ6cWhreHJzeHVkcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3NzAyMjMsImV4cCI6MjA0NTM0NjIyM30.G4yf96R_vBJ5tsDjy5h3KJwhYGt1R0XTqGVf8VhIaTA"  # Replace with your key

supabase = create_client(url, key)

# Demo data
demo_school_id = "11111111-1111-1111-1111-111111111111"
admin_profile_id = "aaaaaaaa-1111-1111-1111-111111111111"

try:
    # First create a profile if it doesn't exist (requires auth user)
    # For now, let's just insert the data
    
    # 1. Insert Schools
    schools_data = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Demo Public School",
            "subdomain": "demo-school",
            "is_website_public": True,
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "name": "Elite Academy",
            "subdomain": "elite-academy",
            "is_website_public": True,
        }
    ]
    
    response = supabase.table("schools").upsert(schools_data).execute()
    print(f"Schools created: {len(response.data)} records")
    
    # 2. Insert Classes  
    classes_data = [
        {
            "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            "school_id": demo_school_id,
            "name": "Class 10-A",
            "created_by": admin_profile_id,
        },
        {
            "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            "school_id": demo_school_id,
            "name": "Class 10-B",
            "created_by": admin_profile_id,
        },
        {
            "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
            "school_id": demo_school_id,
            "name": "Class 9-A",
            "created_by": admin_profile_id,
        }
    ]
    
    # We need a valid user ID for created_by. Let's skip this for now
    print("Note: Classes and Sections require valid user_id for created_by. Skipping until auth is setup.")
    
    # 3. Insert Subjects (doesn't require created_by)
    subjects_data = [
        {
            "id": "55555555-5555-5555-5555-555555555555",
            "school_id": demo_school_id,
            "name": "Mathematics",
            "code": "MATH",
            "is_active": True,
        },
        {
            "id": "66666666-6666-6666-6666-666666666666",
            "school_id": demo_school_id,
            "name": "English",
            "code": "ENG",
            "is_active": True,
        },
        {
            "id": "77777777-7777-7777-7777-777777777777",
            "school_id": demo_school_id,
            "name": "Science",
            "code": "SCI",
            "is_active": True,
        },
    ]
    
    response = supabase.table("subjects").upsert(subjects_data).execute()
    print(f"Subjects created: {len(response.data)} records")
    
    print("\nDemo data seeding partially complete. Need to handle auth users for classes/sections.")

except Exception as e:
    print(f"Error seeding data: {e}")
    sys.exit(1)

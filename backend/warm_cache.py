#!/usr/bin/env python3
"""
Pre-warm FastF1 cache for faster loading
Run this once to download all 2024 Qatar GP data
"""
import fastf1
import os

# Enable cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
fastf1.Cache.enable_cache(CACHE_DIR)

print("🏎️  Pre-warming FastF1 cache...")
print("This will take 2-5 minutes but only needs to be done once.\n")

try:
    # Download 2024 Qatar GP Qualifying data (most commonly accessed)
    print("📥 Downloading Qatar GP Qualifying data...")
    session = fastf1.get_session(2024, 'Lusail', 'Q')
    session.load()
    print("✅ Qualifying data cached!\n")
    
    # Download Race data
    print("📥 Downloading Qatar GP Race data...")
    session = fastf1.get_session(2024, 'Lusail', 'R')
    session.load()
    print("✅ Race data cached!\n")
    
    print("🎉 Cache warmed! Your app will now load much faster.")
    print(f"📁 Cache location: {CACHE_DIR}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("This is normal if the race hasn't happened yet.")

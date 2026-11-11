#!/usr/bin/env python3
"""
Pre-warm FastF1 cache for faster loading.
Usage: python warm_cache.py [year] [location]
Defaults to 2025 Lusail GP (or current season event when F1TV auth is configured).
"""
import os
import sys
import fastf1

from data_providers import install_nonblocking_f1_auth

# Configure FastF1 >= 3.8 cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.configure(cache_dir=CACHE_DIR)
install_nonblocking_f1_auth()

year = int(sys.argv[1]) if len(sys.argv) > 1 else 2025
location = sys.argv[2] if len(sys.argv) > 2 else "Lusail"

print(f"Pre-warming FastF1 cache for {year} {location}...")

try:
    for session_code, label in [("Q", "Qualifying"), ("R", "Race")]:
        print(f"Downloading {year} {location} {label} data...")
        session = fastf1.get_session(year, location, session_code)
        session.load()
        print(f"{label} data cached!")

    print(f"Cache warmed at: {CACHE_DIR}")
except Exception as e:
    print(f"Error: {e}")
    print("Note: Uncached sessions since Oct 2026 require F1TV auth (FASTF1_F1_USERNAME / FASTF1_F1_PASSWORD) or will fall back to OpenF1 in the API.")

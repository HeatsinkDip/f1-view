FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create cache directory
RUN mkdir -p /app/cache

# Expose port
EXPOSE 8001

# Set environment variables
ENV PORT=8001
ENV FASTF1_CACHE_DIR=/app/cache
ENV FASTF1_CACHE=/app/cache

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

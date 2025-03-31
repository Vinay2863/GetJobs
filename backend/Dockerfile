# # Use Python 3.11.3 base image
# FROM python:3.11.3

# # Set working directory inside the container
# WORKDIR /app

# # Copy all backend files into the container
# COPY . .

# # Install dependencies from requirements.txt (if available)
# RUN pip install --no-cache-dir -r requirements.txt

# # Expose backend API port
# EXPOSE 5005

# # Run the backend application using python3
# CMD ["python3", "App.py"]

# Use a base image with Python and dependencies for ARM
FROM python:3.11-slim

# Install Chromium and ChromeDriver (ARM-compatible)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Selenium
ENV DISPLAY=:99
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Set working directory
WORKDIR /app

# Copy backend files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run backend application
CMD ["python", "App.py"]
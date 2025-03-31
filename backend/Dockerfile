# Use Python 3.11.3 base image
FROM python:3.11.3

# Set working directory inside the container
WORKDIR /app

# Copy all backend files into the container
COPY . .

# Install dependencies from requirements.txt (if available)
RUN pip install --no-cache-dir -r requirements.txt

# Expose backend API port
EXPOSE 5000

# Run the backend application using python3
CMD ["python3", "App.py"]
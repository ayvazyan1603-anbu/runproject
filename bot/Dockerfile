FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt ./

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy bot source code
COPY . .

# Expose webhook port
EXPOSE 5000

# Start Discord Bot
CMD ["python", "main.py"]

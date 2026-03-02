FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Copy application
COPY app.py .

# Create state.json if it doesn't exist
RUN touch state.json

# Run bot
CMD ["python", "app.py"]

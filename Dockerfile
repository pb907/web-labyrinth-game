FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create necessary directories for the modular structure
RUN mkdir -p templates static

# Move the HTML file to templates
RUN if [ -f index.html ]; then mv index.html templates/; fi

# Move the JavaScript files to static
RUN if [ -f game.js ]; then mv game.js static/; fi
RUN if [ -f constants.js ]; then mv constants.js static/; fi
RUN if [ -f player.js ]; then mv player.js static/; fi
RUN if [ -f monsters.js ]; then mv monsters.js static/; fi
RUN if [ -f bombs.js ]; then mv bombs.js static/; fi

EXPOSE 5000

CMD ["python", "app.py"]
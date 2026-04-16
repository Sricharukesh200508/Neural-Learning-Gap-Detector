# ── Stage 1: Use slim Python base (keeps image small) ─────────────────────
FROM python:3.10-slim

# ── System dependencies (OpenCV needs these) ───────────────────────────────
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── Set working directory inside container ─────────────────────────────────
WORKDIR /app

# ── Copy requirements first (Docker cache optimization) ────────────────────
COPY requirements.txt .

# ── Install Python packages ────────────────────────────────────────────────
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy all project files ─────────────────────────────────────────────────
COPY app.py .
COPY best_csrnet_shanghaiA.pth .

# ── Tell Cloud Run what port the app uses ─────────────────────────────────
EXPOSE 8501

# ── Health check so Cloud Run knows app is running ─────────────────────────
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# ── Start Streamlit (must bind to 0.0.0.0 for Cloud Run) ──────────────────
ENTRYPOINT ["streamlit", "run", "app.py", \
            "--server.port=8501", \
            "--server.address=0.0.0.0", \
            "--server.headless=true", \
            "--browser.gatherUsageStats=false"]

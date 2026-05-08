<div align="center">

# 🚩 ctfc - CTF Challenge Orchestrator

<p align="center">
  <strong>A powerful, modular engine for orchestrating CTF challenges with automated tunneling and TTL management</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Tunneling-Pinggy|Localtunnel|Ngrok-orange?style=for-the-badge" alt="Tunneling">
</p>

</div>

---

## 🎯 Overview

**ctfc** (CTF Container) is a comprehensive orchestration platform designed for CTF organizers and players. It simplifies the lifecycle of containerized challenges—from automated builds and dynamic port assignment to public exposure via multiple tunneling providers. Featuring a built-in **TTL (Time-To-Live)** system, it ensures resources are never wasted by automatically shutting down expired challenges.

### ✨ Key Features

- 🐳 **Docker Native** - Seamlessly manages `docker-compose` based challenges.
- ⏳ **Smart TTL System** - Auto-shutdown challenges after 15 minutes with manual extension.
- 🌐 **Multi-Tunnel Support** - Instant public URLs via **Pinggy**, **Localtunnel**, or **Ngrok**.
- 🔌 **Dynamic Port Mapping** - Automatically avoids port conflicts on the host.
- 💻 **Modular CLI** - Clean, fast, and interactive command-line interface.
- ⌨️ **Bash Completion** - Instant Tab-completion for commands and challenge names (SQLite powered).
- 🛠️ **Easy Setup** - Interactive installation script with global command registration.

---

## 📁 Project Structure

```
📦 CTFS_Back/
┣ 🚀 setup.sh                   # Interactive installer/uninstaller
┣ 📂 src/
┃ ┣ 🎯 app.py                   # Main CLI entry point
┃ ┣ 📂 core/                    # ⚙️ Core Logic (Docker, Git, DB, Models)
┃ ┣ 📂 scripts/
┃ ┃ ┣ 📂 cli/                    # 💻 CLI Handlers (Status, Lifecycle, Exports)
┃ ┃ ┗ 📂 exports/                # 🌐 Tunneling Providers Logic
┃ ┗ 📂 completion/               # ⌨️ Bash completion scripts
┣ 📂 data/                      # 💾 Persistent data (Challenges, DB, Logs)
┣ 📋 config.yml                 # 🔧 Main Configuration
┗ 📋 requirements.txt           # Python dependencies
```

---

## 🚀 Quick Setup

### 🔧 Installation

The easiest way to install **ctfc** is using the automated setup script. This will install dependencies, register the global `ctfc` command, and setup bash completion.

```bash
# Clone the repository
git clone https://github.com/ariafatah0711/ctfc
cd ctfc

# Run interactive installer
sudo ./setup.sh install
sudo ./setup.sh enable-service

# 🔄 IMPORTANT: Restart your shell or run
source ~/.bashrc
```

---

## ⏳ TTL & Extension System

**ctfc** includes a built-in safety mechanism to prevent challenges from running indefinitely:

1.  **Default TTL**: Challenges automatically expire after **15 minutes**.
2.  **Auto-Shutdown**: When a challenge expires, both the container and the tunnel (PID) are killed.
3.  **Extend**: You can add **+10 minutes** to a running challenge, but only when it has **less than 5 minutes** remaining.

```bash
# Extend a challenge
ctfc extend web/sqli
```

---

## 🛠 Command Reference

### 📊 **Monitoring**

| Command | Description | Example |
|---------|-------------|---------|
| 📋 `ctfc list` | List all available challenges | `ctfc list` |
| 📈 `ctfc status` | Show running challenges, endpoints, and TTL | `ctfc status` |
| 🔎 `ctfc inspect`| Show detailed challenge configuration | `ctfc inspect web/sqli` |
| 🌐 `ctfc exports`| List all active tunnel exports | `ctfc exports` |

### 🏃 **Lifecycle**

| Command | Description | Example |
|---------|-------------|---------|
| 🚀 `ctfc up` | Build, start, and auto-export a challenge | `ctfc up web/sqli` |
| 📏 `ctfc down` | Stop container and all active tunnels | `ctfc down web/sqli` |
| 🔄 `ctfc restart` | Restart (Down + Up) | `ctfc restart web/sqli` |
| ⏳ `ctfc extend` | Add time to a running challenge | `ctfc extend web/sqli` |

### 🌐 **Tunnels**

| Command | Description | Example |
|---------|-------------|---------|
| 📤 `ctfc export` | Manually start a tunnel | `ctfc export ngrok web/sqli` |
| 📥 `ctfc unexport`| Stop tunnels for a challenge | `ctfc unexport web/sqli` |

### 🌐 **Web API**

| Command | Description | Example |
|---------|-------------|---------|
| 🔌 `ctfc api` | Run the FastAPI web server | `ctfc api --port 8000` |

---

### 🌐 Web API Reference
The API is secured via `X-CTFC-Token` header.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/status` | GET | Comprehensive status of all challenges (JSON) |
| `/up/{name}` | POST | Start a challenge |
| `/down/{name}` | POST | Stop a challenge |
| `/restart/{name}` | POST | Restart (supports `?container=true`) |
| `/extend/{name}` | POST | Add more time to a running challenge |

---

### 🛠️ Configuration (`config.yml`)
Key settings for orchestration:
```yaml
default_ttl_minutes: 15       # Initial time for challenges
restart_cooldown_seconds: 300 # Anti-spam restart protection
daemon_interval: 10           # How often daemon checks status
auto_heal_exports: true       # Auto-restart dead tunnels
```

---

## 🎨 Quick Examples

```bash
# 🚀 Start a challenge with auto-tunnel
ctfc up web/sqli

# 📈 Watch status in real-time (with colors!)
ctfc status --watch

# ⏳ Add time when sisa waktu < 5m
ctfc extend web/sqli

# 🌐 Export using a specific provider
ctfc export pinggy web/sqli

# 🧹 Full stop
ctfc down web/sqli
```

---

## 🗑️ Uninstall

```bash
# Remove global command and completion
sudo ./setup.sh uninstall
```

---

<div align="center">

**🚩 Made with ❤️ for CTF Players and Organizers**

</div>

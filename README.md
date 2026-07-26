# RGUKT Proxy Installer

A one-command installer for configuring transparent internet access on Ubuntu systems connected to the RGUKT campus network.

The installer automatically configures:

- Redsocks
- iptables transparent proxy rules
- Systemd service
- Network startup handling
- Internet connectivity verification

## Features

- One-command installation
- Automatic dependency installation
- Supports RGUKT Wi-Fi and LAN
- Persistent configuration after reboot
- Automatic startup on boot
- Simple interactive setup

## Requirements

- Ubuntu 22.04 or newer
- Internet connection
- sudo privileges
- Valid RGUKT proxy credentials

## Installation

```bash
curl -fsSL https://rgukt-proxy.udaykumar-angari.in/install.sh | bash
```

After installation, run:

```bash
rgukt-proxy
```

The installer will ask for:

- Proxy Host
- Username
- Password

and complete the configuration automatically.

## Project Structure

```
installer/
docs/
package/
README.md
```

## License

MIT License

## Author

Udaykumar Angari
# RGUKT Transparent Proxy Installer

RGUKT Transparent Proxy Installer is a command line utility that configures system level transparent proxy redirection on Ubuntu systems. It allows terminal applications and developer tools to access the internet seamlessly when connected to the RGUKT campus network without requiring manual, tool specific proxy configurations.

## The Problem

Most developer tools and command line utilities (such as Git, npm, Docker, Maven, apt, SSH, curl, and wget) do not respect standard system environment variables or browser proxy settings by default. Configuring them manually is repetitive, error prone, and often fails to cover all development workflows.

## The Solution

This installer sets up a transparent proxying mechanism using Redsocks and iptables. It automatically redirects all outgoing TCP traffic from your system through the RGUKT campus proxy server, except for local loopback and subnet traffic (like 127.0.0.0/8 or 10.0.0.0/8). 

As a result, your terminal applications gain direct internet access out of the box.

## Key Features

- One command installation and automated package setup.
- Interactive configuration prompt for proxy host, username, and password.
- Automated systemd service to manage the Redsocks daemon status.
- Persistent iptables rules configured via netfilter-persistent to survive reboots.
- Automatic connectivity checks to verify active credentials and tunnel state.
- Complete uninstallation utility to revert all modified system rules.

## Requirements

- Ubuntu 22.04 LTS or newer
- An active internet connection (e.g., mobile hotspot) during initial installation to fetch packages
- sudo privileges on the local system
- Valid RGUKT campus proxy credentials

## Installation

Run the following command to download and execute the installer:

```bash
curl -fsSL https://rgukt-proxy.udaykumar-angari.in/install.sh | bash
```

## Post-Installation Setup

Once the package is installed, configure your proxy settings by running:

```bash
rgukt-proxy
```

You will be prompted to enter:
1. Proxy Host (e.g., the IP address of the campus proxy server)
2. Proxy Port (default is 8080)
3. Your campus proxy Username
4. Your campus proxy Password

The script will automatically configure Redsocks, write the iptables routing rules, and save them for persistence.

## Managing the Service

The proxy installer wraps the configuration inside a systemd service, allowing you to manage the proxy redirect easily:

### Start the Proxy
```bash
sudo systemctl start redsocks
```

### Stop the Proxy
```bash
sudo systemctl stop redsocks
```

### Check Service Status
```bash
sudo systemctl status redsocks
```

### Enable Auto-start on Boot
```bash
sudo systemctl enable redsocks
```

## How It Works Under the Hood

The installer performs the following system configuration steps:

1. **Redsocks Configuration**: Writes a configuration file to `/etc/redsocks.conf` specifying the SOCKS5/HTTP tunnel interface, server credentials, and authentication details.
2. **iptables Routing Rules**: Sets up a custom routing chain. It redirects all outbound TCP traffic to the local Redsocks port (default 12345), while preserving traffic directed to local subnets (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).
3. **Rule Persistence**: Installs `iptables-persistent` and saves the rules to `/etc/iptables/rules.v4` to ensure they persist across system reboots.
4. **Systemd Service Setup**: Configures systemd overrides to wait for network availability before launching Redsocks, preventing silent failures on boot.

## Uninstallation

To completely remove the transparent proxy configurations and restore your default iptables settings, run the uninstallation script:

```bash
sudo apt purge rgukt-proxy
```

Or manually flush the routing rules and stop the daemon:

```bash
sudo systemctl stop redsocks
sudo systemctl disable redsocks
sudo iptables -t nat -F
sudo iptables -t nat -X
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Udaykumar Angari
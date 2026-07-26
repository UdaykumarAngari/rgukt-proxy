#!/bin/bash

GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
BLUE="\e[36m"
RESET="\e[0m"

clear

missing=()

dpkg -s redsocks >/dev/null 2>&1 || missing+=("redsocks")
dpkg -s iptables-persistent >/dev/null 2>&1 || missing+=("iptables-persistent")
dpkg -s netfilter-persistent >/dev/null 2>&1 || missing+=("netfilter-persistent")

if [ ${#missing[@]} -gt 0 ]; then
    clear

    echo -e "${BLUE}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             RGUKT Transparent Proxy Installer                ║
║                                                              ║
║               Developed by Uday Kumar Angari                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"

    echo
    echo -e "${YELLOW}⚠ First-Time Setup Detected${RESET}"
    echo
    echo "The following packages are required:"
    echo

    for pkg in "${missing[@]}"
    do
        echo " • $pkg"
    done

    echo
    echo "Step 1:"
    echo "Connect to a Mobile Hotspot or Home Wi-Fi."
    echo
    echo "Step 2:"
    echo "Run the following commands:"
    echo
    echo "sudo apt update"
    echo "sudo apt install ${missing[*]}"
    echo
    echo "Step 3:"
    echo "Disconnect from Mobile Network."
    echo
    echo "Connect to the RGUKT Campus Wi-Fi/LAN."
    echo
    echo "Step 4:"
    echo "Reconnect to the RGUKT Campus Wi-Fi/LAN and run:

	  Run this installer again. sudo ./rgukt-proxy.sh "
    echo
    exit 0
fi

echo -e "${RESET}"
#part 2

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             RGUKT Transparent Proxy Installer                ║
║                                                              ║
║               Developed by Uday Kumar Angari                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

echo
echo -e "${YELLOW} Uday is fixing your network...
		     meanwhile you can follow uday on linkedin at linkedin.com/in/udaykumar-angari ${RESET}"
sleep 1
echo -e "${YELLOW}Negotiating with the campus proxy...${RESET}"
sleep 2

echo
echo "=============================================================="
echo
echo "Before Continuing:"
echo
echo "✔ Connect to the RGUKT Campus Wi-Fi or LAN."
echo
echo " Do NOT enable any proxy in Ubuntu Network Settings."
echo
echo "This installer will configure the transparent proxy automatically."
echo
read -p "Press ENTER to continue..."
echo 

echo "Enter your proxy host example : studentnet.rgukt.ac.in or hostelinternet.rgukt.ac.in"

read -p "Proxy Host: " PROXY_HOST

# Resolve hostname to IP address
PROXY_IP=$(getent hosts "$PROXY_HOST" | awk '{print $1}')

if [ -z "$PROXY_IP" ]; then
    echo
    echo -e "${RED} Unable to resolve '$PROXY_HOST'.${RESET}"
    echo "Please check the proxy host and make sure you're connected to the RGUKT campus network."
    exit 1
fi

read -p "Username : " USERNAME

read -s -p "Password : " PASSWORD

echo
echo "------------------------------------------------------"

echo
echo -e "${GREEN}[1/6] Creating redsocks configuration...${RESET}"

sudo tee /etc/redsocks.conf >/dev/null <<EOF
base {
    log_debug = on;
    log_info = on;
    log = "syslog:daemon";

    daemon = on;
    redirector = iptables;
}

redsocks {
    local_ip = 127.0.0.1;
    local_port = 12345;

    ip = $PROXY_IP;
    port = 3128;

    type = http-connect;

    login = "$USERNAME";
    password = "$PASSWORD";
}
EOF

echo -e "${GREEN}✔ Configuration Created${RESET}"

echo
echo -e "${GREEN}[2/6] Starting redsocks...${RESET}"

echo
echo -e "${GREEN}[3/5] Configuring Redsocks Startup...${RESET}"

sudo mkdir -p /etc/systemd/system/redsocks.service.d

sudo tee /etc/systemd/system/redsocks.service.d/override.conf >/dev/null <<EOF
[Unit]
Wants=network-online.target
After=network-online.target

[Service]
ExecStartPre=/bin/sleep 10
EOF

sudo systemctl daemon-reload

echo -e "${GREEN}✔ Startup Configuration Updated${RESET}"

sudo systemctl enable redsocks
sudo systemctl restart redsocks

echo -e "${GREEN}✔ Redsocks Running${RESET}"

echo
echo -e "${GREEN}[4/6] Configuring iptables...${RESET}"

sudo iptables -t nat -F REDSOCKS 2>/dev/null
sudo iptables -t nat -X REDSOCKS 2>/dev/null

sudo iptables -t nat -N REDSOCKS

sudo iptables -t nat -A REDSOCKS -d 127.0.0.0/8 -j RETURN
sudo iptables -t nat -A REDSOCKS -d 10.0.0.0/8 -j RETURN
sudo iptables -t nat -A REDSOCKS -d 172.16.0.0/12 -j RETURN
sudo iptables -t nat -A REDSOCKS -d 192.168.0.0/16 -j RETURN

sudo iptables -t nat -A REDSOCKS -p tcp -j REDIRECT --to-ports 12345

sudo iptables -t nat -D OUTPUT -p tcp -j REDSOCKS 2>/dev/null
sudo iptables -t nat -A OUTPUT -p tcp -j REDSOCKS

echo -e "${GREEN}✔ Firewall Configured${RESET}"

echo
echo -e "${GREEN}[5/6] Saving Rules...${RESET}"

sudo netfilter-persistent save

echo -e "${GREEN}✔ Saved${RESET}"

echo
echo -e "${GREEN}[6/6] Testing Internet...${RESET}"

if curl -Is https://registry.npmjs.org >/dev/null 2>&1
then
    STATUS="SUCCESS"
    COLOR=$GREEN
else
    STATUS="FAILED"
    COLOR=$RED
fi

echo
echo "=============================================================="

if [ "$STATUS" = "SUCCESS" ]
then
    echo -e "${GREEN}"
    echo "           INSTALLATION COMPLETED SUCCESSFULLY"
    echo -e "${RESET}"
    echo
    echo "Proxy Host : $PROXY_HOST"
    echo "Username   : $USERNAME"
    echo
    echo "✔ Redsocks Service Started"
    echo "✔ Firewall Rules Configured"
    echo "✔ Rules Saved"
    echo "✔ Internet Connectivity Verified"
    echo
    echo -e "${GREEN}You are now ready to use the RGUKT Campus Network.${RESET}"

else
    echo -e "${RED}"
    echo "                INSTALLATION FAILED"
    echo -e "${RESET}"
    echo
    echo "Proxy Host : $PROXY_HOST"
    echo "Username   : $USERNAME"
    echo
    echo "Internet connectivity test failed."
    echo
    echo "Please verify:"
    echo " • Proxy Host"
    echo " • Username"
    echo " • Password"
    echo " • Campus Wi-Fi/LAN Connection"
fi

echo
echo "=============================================================="
echo
echo "Happy Coding!"
echo
echo "Made with ❤️ by Uday Kumar Angari for RGUKT BASAR"
echo  "CODE CLUB RGUKT BASAR"
echo "=============================================================="


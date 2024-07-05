sudo dnf install httpd -y

sudo systemctl start httpd.service

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# download and install Node.js (you may need to restart the terminal)

source ~/.bashrc

nvm install 20

node -v


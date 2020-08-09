https://medium.com/@panzelva/deploying-express-js-website-to-vps-with-nginx-pm2-and-ubuntu-18-04-8c5d32593211

git clone https://github.com/cosmos-ummc/needle

cd needle

npm install

npm start

npm install pm2 -g

pm2 start npm -- start

pm2 startup

pm2 save

## Redis

sudo apt update

sudo apt install redis-server

sudo nano /etc/redis/redis.conf and change supervised to systemd

sudo systemctl restart redis.service

pm2 restart npm

## update

cd ~/needle

git pull

pm2 restart npm

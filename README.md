# debug-bot
Debug Bot

# Project installation
git clone https://github.com/PimsJay01/debug-bot.git


## Backend : debug-bot/back

### Download dependencies with npm
cd back
npm install

### Start the server
node server.js

## Frontend : debug-bot/front

More information : https://github.com/PimsJay01/debug-bot/tree/master/front

# Deployement

## Connection to your server

## Requirements
### Description for Debian and Ubuntu based Linux distributions

#### Install node & npm
sudo apt-get install nodejs npm

### Install nginx
sudo apt-get install nginx

### Install pm2
PM2 est utilié pour lancer le server debug-bot comme un daemon.
Il gère le restart à chaud si on build des modifications et lorsque le server crash

npm install pm2@latest -g

## Branches de déploiement

### prod-master
Version sans lobby
/home/projects/debug-bot/prod-master

### prod-lobby
Version avec lobby
/home/projects/debug-bot/prod-lobby

## Deploiement du front

### Configuration de nginx

#### Dans le fichier /etc/nginx/conf.d/nginx.conf
Ajouter la desctiption du server http : (une fois pour chaque branche)

server {
      listen 80;
      server_name 37.35.109.104;

      # debug-bot
      location / {
         root /home/projects/debug-bot/prod-master/front;
         index index.html;
      }

      # urls beginning by /. (dotfiles)
      location ~ /\. {
         deny all;
         access_log off;
         log_not_found off;
      }
   }

#### Dans le fichier /etc/nginx/nginx.conf

Si nécessaire ajouter ou décommenter la ligne

http {

  [...]

  include /etc/nginx/conf.d/\*.conf;

  [...]

}

### Build
cd /home/projects/debug-bot/prod-master/front ou /home/projects/debug-bot/prod-lobby/front
npm run deploy

Cela va générer les fichiers dist/bundle.js et dist/vendor-bundle.js qui sont inclus dans index.html

## Deploiement du back
cd /home/projects/debug-bot/prod-master/back ou /home/projects/debug-bot/prod-lobby/back
pm2 start server.js --name server_name --watch

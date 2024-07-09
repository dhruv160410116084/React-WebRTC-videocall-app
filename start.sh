git pull
cd backend

npm i -g pm2
npm i 
#add env
pm2 startOrRestart pm2.json

cd ../front-end/app
npm i
npm run build

sudo cp -r dist/* /var/www/html/


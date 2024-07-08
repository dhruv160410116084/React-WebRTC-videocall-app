git pull
cd backend

npm i -g pm2
npm i
#add env
pm2 StartOrRestart pm2.json

cd ../front-end/app
npm i
npm run build

cp -r dist/* /var/www/html/


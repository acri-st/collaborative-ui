#!/bin/sh
echo "Starting nginx"
nginx

echo "Starting frontend"
    
echo "[FRONTEND/project] installing packages"
cd /frontend/ && npm i

# echo "[FRONTEND/fwk] installing framework and linking deps"
# cd /desp-ui-fwk/ && npm i 
# && npm link ../frontend/node_modules/react && npm link ../frontend/node_modules/react-dom && npm link 

# echo "[FRONTEND/project] linking framework"
# cd /frontend/ && npm link @desp-aas/desp-ui-fwk

echo "[FRONTEND/project] starting dev"
npm run dev

inotifywait -m -e modify /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf | while read path action file; do
    echo "Configuration change detected: $action $file"
    nginx -s reload
done
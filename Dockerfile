FROM node:7

# Create app directory
RUN npm install -g pm2
RUN npm install --production -g --unsafe-perm node-red
RUN npm install -g node-red-admin
RUN npm install -g node-red-node-suncalc
RUN mkdir /usr/local/lib/node_modules/node-red-ilab/
WORKDIR /usr/local/lib/node_modules/node-red-ilab

# Install app dependencies
COPY . /usr/local/lib/node_modules/node-red-ilab/
RUN npm install

# Bundle app source


#Desactivate nodes to get a clean version
RUN node-red& sleep 2 && for i in 'node-red-dashboard/ui_base' 'node-red-dashboard/ui_button' 'node-red-dashboard/ui_chart' 'node-red-dashboard/ui_dropdown' 'node-red-dashboard/ui_form' 'node-red-dashboard/ui_gauge' 'node-red-dashboard/ui_link' 'node-red-dashboard/ui_numeric' 'node-red-dashboard/ui_slider' 'node-red-dashboard/ui_switch' 'node-red-dashboard/ui_template' 'node-red-dashboard/ui_text' 'node-red-dashboard/ui_text_input' 'node-red-dashboard/ui_toast' 'node-red-dashboard/ui_ui_control' 'node-red-node-darksky/darksky' 'node-red-node-feedparser/feedparse' 'node-red-node-rbe/rbe' 'node-red-node-serialport/serialport' 'node-red-node-twitter/twitter' 'node-red/catch' 'node-red/change' 'node-red/CSV' 'node-red/exec' 'node-red/file' 'node-red/HTML' 'node-red/httpin' 'node-red/httprequest' 'node-red/inject' 'node-red/JSON' 'node-red/mqtt' 'node-red/range' 'node-red/rpi-gpio' 'node-red/sentiment' 'node-red/split' 'node-red/status' 'node-red/switch' 'node-red/tail' 'node-red/tcpin''node-red/template' 'node-red/tls' 'node-red/udp' 'node-red/unknown' 'node-red/watch' 'node-red/websocket' 'node-red/XML' 'node-red/function' 'node-red/tcpin' 'node-red/template' 'node-red/trigger' 'node-red/YAML' 'node-red-node-email/email'; do \
 curl -X PUT \
      http://localhost:1880/nodes/$i \
      -H 'cache-control: no-cache' \
      -H 'content-type: application/json' \
      -H 'postman-token: 46b9612f-1c90-3d10-0f69-1d0358949eaa' \
      -d '{ "enabled": false}'; \
   done

RUN ./install.sh
#RUN apt-get update && apt-get install -y nano

#Reset workdir
WORKDIR /root/

EXPOSE 1880
CMD [ "node-red"]

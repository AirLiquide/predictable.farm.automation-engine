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
RUN node-red&

RUN bash install.sh
RUN apt-get update && apt-get install -y nano

# Reset workdir
WORKDIR /root/

EXPOSE 1880
CMD [ "node-red"]

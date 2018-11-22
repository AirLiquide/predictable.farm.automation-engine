# Copyright (C) Air Liquide S.A,  2017
# Author: Sébastien Lalaurette and Cyril Ferté, La Factory, Creative Foundry
# This file is part of Predictable Farm project.
#
# The MIT License (MIT)
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# See the LICENSE.txt file in this repository for more information.

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

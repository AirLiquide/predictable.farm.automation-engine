#!/bin/bash
echo ">> Copying theme settings to node-red `~/.node-red/`"
cp ./theme/settings.js ~/.node-red/settings.js


node_red_dir=`which node-red`
node_red_dir=`dirname $node_red_dir`
node_red_dir=$node_red_dir"/../lib/node_modules/node-red"

echo ">> found node-red dir: " $node_red_dir
mkdir -p "$node_red_dir/public/vendor"
echo ">> Copying theme assets to node-red"
cp -r ./theme/predictable-ui $node_red_dir/public/vendor
echo ">> Copying template index.mst to node-red"
cp ./theme/index.mst $node_red_dir/editor/templates/index.mst

#echo ">> Copying locale editor.json to node-red"
#cp ./theme/editor.json $node_red_dir/red/api/locales/en-US/

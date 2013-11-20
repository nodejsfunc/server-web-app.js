#!/bin/sh

# deploy client web app

temp="temp-deploy"
user="node"
host="nodejs-internal.mobcastdev.com"
path="/home/node/server-app"

echo "Deploying Server web app..."

# delete temp folder if it exists
rm -rf $temp

# clone from git into a temp folder
git clone -b master "http://git.mobcastdev.local/bdyer/server-web-app" $temp

# install dependencies
echo "installing dependencies..."
npm install --quiet

# copy contents of temp folder into client-app folder
echo "Copying files to $user@$host:$path"

# Copy server app and components accross to integration server
rsync --progress --stats -ave ssh -r . --exclude-from=rsync-excludes.txt  "$user@$host:$path"

# need to run npm install

# delete temp folder
rm -rf $temp

# reload node app
ssh "$user@$host" 'bash -s' < node-reload.sh

echo "Done"




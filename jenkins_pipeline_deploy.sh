############################################
# Jenkins pipeline - deploy server web app #
############################################

user="node"
host="nodejs-internal.mobcastdev.com"
path="/var/www/server"
src="dist"

ssh "$user@$host" << 'END_SHUTDOWN'
    echo "shutting down node app..."
    PID=$(ps aux | grep "node /var/www/server/dist/app.js" | grep -v grep | awk '{ print $2 }')
    echo "PID=$PID"
    kill -9 $PID
    echo "done..."
    echo "cleaning up..."
    cd $path
    rm -rfv $src
    echo "done..."
    exit
END_SHUTDOWN

# TODO: improve this - zip, copy, then unzip remotely
# copy dist folder
echo "copying server web app..."
scp -rp $src $user@$host:$path
echo "done..."

# restart node app
ssh "$user@$host" << 'END_RESTART'
    echo "Restarting node app.."
    nohup node /var/www/server/dist/app.js -env development >nohup.out 2>nohup.out &
    if [ $? != 0 ]
    then
        echo "*** Deployment failed with error: $? ***"
    fi
    echo "done..."
exit
END_RESTART




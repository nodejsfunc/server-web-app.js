export PATH=/usr/local/bin:$PATH
export PATH=/opt/maven/bin:$PATH


user="node"
host="nodejs-internal.mobcastdev.com"
path="/var/www/server"
src="dist"

# install dependencies
echo "installing dependencies..."
npm install --quiet


# we need to switch to the master branch before making any changes that we want to commit 
# The Git-plugin default branch is 'no-branch'
git checkout master

echo "building..."
grunt create-version ci-build

if [ $? != 0 ] 
then
    echo "*** Grunt failed with error: $? ***"
    exit
fi

echo "deploying Server web app..."

# Copy server app and components accross to integration server
rsync --progress --stats -ave ssh -r "$src/" "$user@$host:$path"


# reload node app
ssh "$user@$host" 'bash -s' < node-reload.sh

# echo "preparing integration tests..."
# git clone git@git.mobcastdev.com:TEST/website-test.git integration-test

#echo "running integration tests..."
# cucumber integration-test -p integration-mac-safari

#if [ $? != 0 ] 
#then
#    echo "*** integtation tests failed ***"
#    exit
#fi

echo "tagging build..."
BBB_SERVER_WEB_APP_VERSION=$(grep version package.json | awk -F\" '{print $(NF-1)}')
git tag v$BBB_SERVER_WEB_APP_VERSION
git push --tags

# zip distribution folder
zip -r dist.zip dist/

# deploy artifact to Nexus
mvn deploy:deploy-file \
    --settings maven-settings.xml \
    -Durl=http://nexus.mobcast.co.uk/nexus/content/repositories/releases/ \
    -DrepositoryId=deploymentRepo \
    -DgroupId=com.blinkbox.books.web \
    -DartifactId=server-web-app \
    -Dversion=$BBB_SERVER_WEB_APP_VERSION  \
    -Dpackaging=zip \
    -Dfile=dist.zip


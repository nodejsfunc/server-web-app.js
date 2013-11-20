#############################################
# Jenkins pipeline - publish server web app #
#############################################

export PATH=/usr/local/bin:$PATH
export PATH=/opt/maven/bin:$PATH

echo "tagging build..."
BBB_SERVER_WEB_APP_VERSION=$(grep version package.json | awk -F\" '{print $(NF-1)}')
git tag v$BBB_SERVER_WEB_APP_VERSION
git push --tags

# zip distribution folder
zip -r dist.zip dist/

# deploy artefact to Nexus
mvn deploy:deploy-file \
    --settings maven-settings.xml \
    -Durl=http://nexus.mobcast.co.uk/nexus/content/repositories/releases/ \
    -DrepositoryId=deploymentRepo \
    -DgroupId=com.blinkbox.books.web \
    -DartifactId=server-web-app \
    -Dversion=$BBB_SERVER_WEB_APP_VERSION  \
    -Dpackaging=zip \
    -Dfile=dist.zip

if [ $? != 0 ]
then
    echo "*** Publish failed with error: $? ***"
    exit
fi

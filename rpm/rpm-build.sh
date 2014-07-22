#!/bin/bash

# This script builds an RPM of the server web app within the web virtual machine and is
# designed to be triggered after the server web app has been built and the 'dist' folder has been generated

source /home/vagrant/.bash_profile;

SWA_HOME=/vagrant/server-web-app
RPM_HOME=/home/vagrant/rpmbuild

# initialse RPM structure
rpmdev-setuptree

cd $SWA_HOME

# gather CWA version and build information
SWA_FULL_VERSION=$(grep version dist/package.json | awk -F\" '{print $(NF-1)}')
SWA_VERSION=$(echo $SWA_FULL_VERSION | cut -d'-' -f1)
SWA_BUILD_NUMBER=$(echo $SWA_FULL_VERSION | cut -d'-' -f2)

# prepare for building the RPM
cp rpm/nodejs.initd $RPM_HOME/SOURCES/server-web-app-initd
cp rpm/logrotate $RPM_HOME/SOURCES

cp -r dist/ $RPM_HOME/SOURCES/server-web-app-${SWA_VERSION}
cp rpm/swa.spec $RPM_HOME/SPECS
cd $RPM_HOME/SOURCES
tar czf server-web-app-${SWA_VERSION}.tar.gz server-web-app-${SWA_VERSION}/

# build the RPM
echo -e 'T3amcI7y@BbB\n' | setsid rpmbuild --sign -ba $RPM_HOME/SPECS/swa.spec --define "_gpg_path /vagrant/gpg.books.teamcity.dev" --define "_gpgbin /usr/bin/gpg" --define "_signature gpg" --define "_gpg_name TeamCity (Dirty Development Signing Key) <tm-books-itops@blinkbox.com>" --define "version $SWA_VERSION" --define "release $SWA_BUILD_NUMBER"

# copy the resulting RPM into the server web app rpm folder for CI to pick up
cp $RPM_HOME/RPMS/noarch/server-web-app-${SWA_VERSION}-${SWA_BUILD_NUMBER}.noarch.rpm $SWA_HOME/rpm

# Show RPM summary
rpm -qip $SWA_HOME/rpm/server-web-app-${SWA_VERSION}-${SWA_BUILD_NUMBER}.noarch.rpm

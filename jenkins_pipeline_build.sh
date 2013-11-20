###########################################
# Jenkins pipeline - build server web app #
###########################################

export PATH=/usr/local/bin:$PATH

# install dependencies
echo "installing dependencies..."
npm install --quiet

# We need to switch to the master branch before making any changes that we want to commit
# because the Jenkins Git-plugin default branch is 'no-branch'
git checkout master

echo "building..."
grunt create-version ci-build

if [ $? != 0 ] 
then
    echo "*** Build failed with error: $? ***"
    exit
fi

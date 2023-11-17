#!/bin/sh

cd ./ios
rm -rf ./build && rm -rf ./dist && pod install

#Builds the xcarchive
xcodebuild -workspace ./MyIdentity.xcworkspace -scheme MyIdentity -sdk iphoneos -configuration Release -quiet -archivePath $PWD/dist/MyIdentity.xcarchive clean archive

# Builds the ipa and uploads it to the appstore
xcodebuild -exportArchive -archivePath $PWD/dist/MyIdentity.xcarchive -exportOptionsPlist exportOptions.plist -exportPath $PWD/dist
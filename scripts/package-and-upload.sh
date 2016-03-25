
#!/bin/sh

cd platforms/ios

xcodebuild -workspace MoodiModo.xcworkspace -scheme MoodiModo -sdk iphoneos -configuration Release  archive -archivePath $PWD/build/MoodiModo.xcarchive CODE_SIGN_IDENTITY="$DEVELOPER_NAME" PROVISIONING_PROFILE="$PROFILE_UUID"

xcodebuild -exportArchive -archivePath $PWD/build/MoodiModo.xcarchive -exportPath $PWD/build -exportOptionsPlist $PWD/exportOptions.plist

pilot upload -u ios@quantimodo.com -i $PWD/build/MoodiModo.ipa -a com.quantimodo.moodimodoapp -p 1046797567 --verbose


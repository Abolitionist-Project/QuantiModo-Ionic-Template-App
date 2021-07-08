echo on
set IONIC_FOLDER=%~dp0
cd %IONIC_FOLDER%
SET NODE_ENV=development & yarn install & bower install
If NOT exist "%IONIC_FOLDER%/src/data/appSettings.js" ( gulp configureApp )
cd "%IONIC_FOLDER%/tests"
node ""%IONIC_FOLDER%/node_modules/gulp-endpoint/bin/endpoint.js"

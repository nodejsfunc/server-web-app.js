Server Web App
==============

<h3>Installing server web app</h3>

<code>
$ npm install
</code>

<h3>Running the application</h3>

<code>
$ node app.js -env development
</code>

<h4>Package json:</h4>
```json
    {
      "name": "BlinkNode",
      "version": "0.0.0-0",
      "dependencies": {
        "express": "3.x",
        "jade": "*"
      },
      "devDependencies": {
          "grunt": "~0.4.1",
          "grunt-contrib-copy": "~0.4.0",
          "grunt-contrib-jshint": "~0.3.0",
          "grunt-contrib-clean": "~0.4.0",
          "grunt-replace": "~0.4.4",
          "matchdep": "~0.1.1"
      },
      "engines": {
        "node": ">=0.8.0"
      }
  ```

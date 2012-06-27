NS2Web
------

This project is designed as a replacement to the built in web interface in Natural Selection 2.  All of this code is designed to work without requiring any specific server-side processing, it uses JSON to communicate with the actual game server.

Currently, there's a single PHP file here.  This is to overcome the restrictions on cross site javascript.  All it does is proxy requests from the web UI to the game server.  Once NS2 has the ability to serve static content, this page can be safely removed.

Usage
-----
While the proxy script is in use, you need to create a file named '.logininfo' with your username and password for rcon, seperated by a colon.  For example: 'user:password'

Libraries
---------
This project makes use of the following:
* Bootstrap
* jQuery
* jqPlot

Building
---------
The js/baselibs.js file was created by concatenating minified versions of the Javascript in js_src into one file.  This was done to minimize the number of HTTP requests required to display this content.  We could decrease that to around 60KB by gzipping it, but it's unlikely that the built in web server would know how to properly handle gzip'd files.

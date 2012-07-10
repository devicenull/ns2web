NS2Web
------
This project replaces the old NS2 web interface.  It's designed to run entirely client side, and communicates with the actual game server via a number of JSON calls.  This interface requires NS2 Build 213 or higher to function correctly.

Usage
-----
Copy all the files to your NS2 web directory (where .htpasswd is), then append /index.html to your usual rcon URL.  For example, if you would normally go to http://localhost:8080 to get to the web interface, go to http://localhost:8080/index.html instead.

Libraries
---------
This project makes use of the following:
* Bootstrap
* jQuery
* jqPlot

Building
---------
The js/baselibs.js file was created by concatenating minified versions of the Javascript in js_src into one file.  This was done to minimize the number of HTTP requests required to display this content.  We could decrease that to around 60KB by gzipping it, but it's unlikely that the built in web server would know how to properly handle gzip'd files.

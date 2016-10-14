Watchdog
----------------------
Little app to monitor a domain and alert if something breaks (work in progress)
For example check for missing meta title, robots.txt, keywords, ...

Tech stack:
-Written in NodeJS and using ExpressJS + MongoDB (with monk)
-OpenShift hosting.
-Cheerio for crawling the url.
-Node agenda (https://github.com/rschmukler/agenda) for job scheduling


To run: After `npm install`, run `npm start`

![Screenshot](https://raw.github.com/xavieramoros/watchdog/master/screenshot.png

The OpenShift `nodejs` cartridge documentation can be found at:
http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs

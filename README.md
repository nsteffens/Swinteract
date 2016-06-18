# Swinteract

Swinteract is a Headup-Display Simulation powered by node.js, HTML5, JavaScript and the [enviroCar](https://envirocar.org) database.

  - Analyze your CO2 emission
  - Track your fuel consumption
  - Keep track of your results in relation to the community
  - Use interactive swipe-gestures to navigate through the content

### Version
1.0.0
### Tech

Swinteract uses a number of open source projects to work properly:

* [node.js] - evented I/O for the backend
* [Bower](https://bower.io) - package manager for the web dependencies 
* [Express] - fast node.js network app framework
* [fullPage.js](https://github.com/alvarotrigo/fullPage.js) - plugin to create full-screen scrolling stites 
* [flot.js](http://www.flotcharts.org) - framework to create (realtime) charts
* [leaflet](http://leafletjs.com) - framework to create interactive maps
* [jQuery] - duh

### Installation

Swinteract requires [Node.js](https://nodejs.org/) v4+ to run.

You need to have Bower installed globally:

```sh
$ npm i -g bower
```

```sh
$ git clone [git-repo-url]
$ cd Swinteract
$ bower install
$ npm install
$ node index.js
```
### Todos

 - Write Tests
 - Integrate live data streaming
 - get more accurate CO2 data

License
----

MIT


**Aww Yes, Free Software!**


   [git-repo-url]: <https://github.com/IGI16/Swinteract.git>
   [node.js]: <http://nodejs.org>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>

var sparqlquery = `
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    SELECT * WHERE {
      ?gebouw owl:sameAs <http://bag.basisregistraties.overheid.nl/bag/id/pand/0363100012233435> .
      ?foto dct:spatial ?gebouw .
      ?foto foaf:depiction ?img .
      ?foto dc:title ?title .
      OPTIONAL {?foto sem:hasBeginTimeStamp ?date . }
    }`

var textMuseum = "<span>Het Koninklijk Concertgebouw</span><p><a href=\"images.html\" >Klik hier </a>om foto’s van deze locatie te bekijken.</p>"

var encodedquery = encodeURIComponent(sparqlquery)
var queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/hva2018/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on'

var data = null
var xhr = new XMLHttpRequest()

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    var data = JSON.parse(this.responseText)
    // console.log('BAG API :', data._embedded.panden)
  }
})

xhr.open("GET", "https://bag.basisregistraties.overheid.nl/api/v1/panden")
xhr.setRequestHeader("X-Api-Key", "92dc3fad-8925-49d2-995e-4cd0c0a43f65")
xhr.setRequestHeader("Cache-Control", "no-cache")
xhr.setRequestHeader("Postman-Token", "eeb2d0d2-4aad-48ad-85cc-ab72cb8b59cc")
xhr.send(data)

mapboxgl.accessToken = 'pk.eyJ1IjoiamFqYW4yMCIsImEiOiJjamVmanFlMWIxZTh6MnFwazY3M3Fwdmw4In0.ccbMoBYUAI28J4TTN_FuUw'
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [4.8776926, 52.3563219],
    zoom: '16'
})

map.on("load", function() {
    map.addSource("national-park", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                    "properties": {
                        "description": textMuseum,
                        "icon": "theatre"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [concert]
                    }
                }]
        }
    })

    map.addLayer({
        "id": "places",
        "type": "fill",
        "source": "national-park",
        "paint": {
            "fill-color": "crimson",
            "fill-opacity": 0.6
        },
        "filter": ["==", "$type", "Polygon"]
    })

    map.addLayer({
        "id": "place",
        "type": "line",
        "source": "national-park",
        "layout": {},
        "paint": {
            "line-color": "crimson",
            "line-width": 2
        }
    })


map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates
        var description = e.features[0].properties.description

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        // }

        new mapboxgl.Popup()
            .setLngLat(coordinates[0][0])
            .setHTML(description)
            .addTo(map)
    })
    
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer'
    })

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = ''
    })
})

fetch(queryurl)
.then((resp) => resp.json()) // transform the data into json
.then(function(data) {
    
    rows = data.results.bindings // get the results
    container = document.getElementById('images')
    console.log(rows)

    for (i = 0; i < rows.length; ++i) {
        var imageContainer = document.createElement('div')
        var header = document.createElement('h1')
        var img = document.createElement('img')
        header.innerHTML = rows[i]['title']['value']
        img.src = rows[i]['img']['value']
        container.appendChild(imageContainer)
        imageContainer.appendChild(header)
        imageContainer.appendChild(img)

        imageContainer.tabIndex = 0
    }
})

.catch(function(error) {
    // if there is any error you will catch them here
    // console.log(error)
})









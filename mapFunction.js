    
    mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbnByaW5jZXNzMTk5NSIsImEiOiJjbDJvMmNhd3cyNnRzM2VzYjNkdGtia2d6In0.TAFYy_RFMRMI5UOyo3ZggQ';
    bounds = [
        [-171.791110603, 18.91619],
        [-66.96466, 71.3577635769]
    ];
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/franprincess1995/cl3hmz9ff001615o61yexw69e',
        center: [-119.417931, 36.778259],
        zoom: 5.0,
        minZoom: 3,
        maxBounds: bounds
    });
    map.dragRotate.disable();
    map.on('load', () => {
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            zoom:10,
            placeholder:'Enter an address or place name',
            bbox: [-124.410607,32.534231,-114.134458,42.009659]
        });

        const layers = [
            '0 to 0.05',
            '0.05 to 0.1',
            'More than 0.1'
        ];
        const colors = [
            '#DEEBF7',
            '#9ECAE1',
            '#3182BD'
        ]

        const legend = document.getElementById('legend');

        layers.forEach((layer, i) => {
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = `${layer}`;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        });

    
        map.addControl(geocoder, 'top-left');
        const marker = new mapboxgl.Marker({ color:'#FF7F50'});
        geocoder.on('result', async (event) =>{
            const point = event.result.center;
            const tileset ='franprincess1995.5mmmo9io';
            const radiusFromHtml = document.querySelector('input[name="radius"]:checked').value;
            const radius = (1609.34*radiusFromHtml); //Use function that grabs select menu radius value
            const limit = 50;
            marker.setLngLat(point).addTo(map);
            //;
            //clear style
            const query=await fetch(
            `https://api.mapbox.com/v4/${tileset}/tilequery/${point[0]},${point[1]}.json?radius=${radius}&limit= ${limit} &access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            map.getSource('tilequery').setData(json);
            
            
        });
        map.addSource('tilequery', {
            type: 'geojson',
            data: {
                'type': 'FeatureCollection',
                'features': []
            }
        });
        map.addLayer({
            id:'tilequery-points',
            type: 'circle',
            source: 'tilequery',
            paint: {
                'circle-stroke-color': 'white',
                'circle-stroke-width': {
                    stops: [
                        [0, 0.1],
                        [18, 3]
                    ],
                    base: 5
                },
                'circle-radius': {
                    stops: [
                        [12, 5],
                        [22, 180]
                    ],
                    base: 5
                },
                'circle-color': [
                    'match',
                    ['get', 'facility_type'],
                    'APH',
                    '#03a8a0',
                    'MHRC',
                    '#039c4b',
                    'NARCOTICS',
                    '#fedf17',
                    'NON',
                    '#ff0984',
                    'NON-DETOX',
                    '#21409a',
                    'PHF',
                    '#04adff',
                    'PSYCHC',
                    '#db6ff2',
                    'RES',
                    '#750c8c',
                    'RES-DETOX',
                    '#340c54',
                    '#FF0000'
                ]
            }

        });
        /*map.addSource('population', {
            type: 'vector',
            url: 'mapbox://franprincess1995.9mkcf6qz'
            });

        map.addLayer({
            'id': 'population_counties',
            'type': 'heatmap',
            'source': 'population'

        })*/
        const popup = new mapboxgl.Popup();

        map.on('mouseenter', 'tilequery-points', (event) => {
            map.getCanvas().style.cursor = 'pointer';
            const properties = event.features[0].properties;
            const obj = JSON.parse(properties.tilequery);
            const coordinates = new mapboxgl.LngLat(
                properties.longitude,
                properties.latitude
            );
            const content = `<h3>Facility Name: ${properties.facility_name}</h3><h4>Type of Facility: ${properties.facility_type}</h4><p>${properties.address}</p><p>${properties.phone_number}</p><p>Notes: ${properties.other_details}</p><p>${(obj.distance/1609).toFixed(2)} miles from location</p>`;
            popup.setLngLat(coordinates).setHTML(content).addTo(map)
            ;
        });
        map.on('mouseleave', 'tilequery-points', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    });
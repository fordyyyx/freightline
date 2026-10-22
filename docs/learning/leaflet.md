## Leaflet in React

useRef creates a container reference and useEffect draws the map once, returning a cleanup function to stop it firing twice during development which would throw an error because it is trying to draw something already drawn.

## GeoJSON layers

The layers centre on Plymouth which is hardcoded for now but will be updated based on start location in the future. Using a zoom of 8 displays the whole currently drawn section in one go, not too close and not too far. The colours chosen are designed to reflect a simplistic land and sea.

## Coordinate ordering

Leaflet uses [lat, lon] which is more standard but can be a trap as GeoJSON and Wikidata use [lon, lat].

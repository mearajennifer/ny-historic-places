'use strict';

let map;

// We use a function declaration for initMap because we actually *do* need
// to rely on value-hoisting in this circumstance.
function initMap() {

  const map = new google.maps.Map(document.querySelector('#map'), {
    center: {
      lat: 43.000000,
      lng: -76.000000,
    },
    zoom: 7,
    // styles: MAPSTYLES,
  });

  const locationButton = document.createElement("button");
  locationButton.textContent = "Find Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          let userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'My location'
          });

          let userInfo = new google.maps.InfoWindow({
            content: userMarker.title,
          });

          userMarker.addListener('click', () => {
            userInfo.open(map, userMarker);
          });

          const queryString = new URLSearchParams(pos).toString();
          const url = `api/places?${queryString}`;
          fetch(url)
            .then((response) => response.json())
            .then((locations) => {
              console.log(locations);

              const markers = [];
              for (const location of locations) {
                markers.push(
                  new google.maps.Marker({
                    position: {
                      lat: Number(location.y),
                      lng: Number(location.x),
                    },
                    title: location.resource_name,
                    map: map,
                  })
                );
              }

              map.setCenter(pos);
              map.setZoom(15)

              for (const marker of markers) {
                const markerInfo = `
                  <h1>${marker.title}</h1>
                  <p>
                    Located at: <code>${marker.position.lat()}</code>,
                    <code>${marker.position.lng()}</code>
                  </p>
                `;

                const infoWindow = new google.maps.InfoWindow({
                  content: markerInfo,
                  maxWidth: 200,
                });

                marker.addListener('click', () => {
                  infoWindow.open(map, marker);
                });
              }
              
            })
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  const addressSearch = document.querySelector('#search-form');
  
  addressSearch.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const queryString = new URLSearchParams({
      street: document.querySelector('#street-input').value,
      city: document.querySelector('#city-input').value,
    }).toString();
    console.log(queryString);
    const url = `/api/address-search?${queryString}`;

    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const pos = data.coords;
      const locations = data.places;

      let posMarker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Searched Location',
      });

      let posInfo = `
        <h2>
          ${data.address}
        </h2>
        <p>
          Located at: <code>${posMarker.position.lat()}</code>,
          <code>${posMarker.position.lng()}</code>
        </p>`;

      const posWindow = new google.maps.InfoWindow({
        content: posInfo,
        maxWidth: 200,
      });

      posWindow.open(map, posMarker);

      posMarker.addListener('click', () => {
        posWindow.open(map, posMarker);
      });

      const markers = [];
      for (const location of locations) {
        markers.push(
          new google.maps.Marker({
            position: {
              lat: Number(location.y),
              lng: Number(location.x),
            },
            title: location.resource_name,
            map: map,
          })
        );
      }

      map.setCenter(pos);
      map.setZoom(15)

      for (const marker of markers) {
        const markerInfo = `
          <h1>${marker.title}</h1>
          <p>
            Located at: <code>${marker.position.lat()}</code>,
            <code>${marker.position.lng()}</code>
          </p>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: markerInfo,
          maxWidth: 200,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    })
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}
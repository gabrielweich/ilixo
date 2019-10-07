import React from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';

const MapView = (props) => {
  const mapStyles = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  };

  return (
    <Map
      google={props.google}
      zoom={20}
      style={mapStyles}
      initialCenter={{ lat: -30.0304902, lng: -51.22906210000001 }}
    >
      {props.children}
    </Map>
  );
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDSkXIOlyCCevcse2QE5fB5OUHffIX0xb0',
})(MapView);
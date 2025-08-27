// // src/components/SelectableMap.jsx
// import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import L from "leaflet";

// const customIcon = new L.Icon({
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
// });

// const SelectableMap = ({ lat, lon, onLocationSelect }) => {
//     const [position, setPosition] = useState({ lat, lng: lon });

//     useEffect(() => {
//         if (lat && lon) {
//             setPosition({ lat, lng: lon });
//         }
//     }, [lat, lon]);

//     // Whenever marker moves, update parent
//     useEffect(() => {
//         if (position?.lat && position?.lng) {
//             onLocationSelect(position.lat, position.lng);
//         }
//     }, [position]);

//     const handleMarkerDrag = (e) => {
//         const newLatLng = e.target.getLatLng();
//         setPosition({ lat: newLatLng.lat, lng: newLatLng.lng });
//     };

//     return (
//         <MapContainer
//             center={[position.lat, position.lng]}
//             zoom={15}
//             scrollWheelZoom={true}
//             style={{ height: "300px", width: "100%" }}
//         >
//             <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution="&copy; OpenStreetMap contributors"
//             />
//             <Marker
//                 position={position}
//                 icon={customIcon}
//                 draggable={true}
//                 eventHandlers={{
//                     dragend: handleMarkerDrag,
//                 }}
//             />
//         </MapContainer>
//     );
// };

// export default SelectableMap;

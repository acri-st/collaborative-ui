import * as L from "leaflet";
import { ICatalogMapCoords } from "./catalog";

export const formatCoordsMapToAPI = (coords: L.LatLng[][]): ICatalogMapCoords => {
    return [
        [coords[0][0].lng, coords[0][2].lat],
        [coords[0][2].lng, coords[0][0].lat],

        // [coords[0][2].lng, coords[0][2].lat],
        // [coords[0][0].lng, coords[0][0].lat]

        // [coords[0][2].lat, coords[0][2].lng],
        // [coords[0][0].lat, coords[0][0].lng],
    ];
}
export const formatCoordsAPIToMap = (coords: ICatalogMapCoords): L.LatLng[][] => {
    return [
        [
            new L.LatLng(coords[1][1], coords[1][0]),
            new L.LatLng(coords[0][1], coords[1][0]),
            new L.LatLng(coords[0][1], coords[0][0]),
            new L.LatLng(coords[1][1], coords[0][0]),
            // new L.LatLng(coords[1][0], coords[1][1]),
            // new L.LatLng(coords[0][0], coords[1][1]),
            // new L.LatLng(coords[0][0], coords[0][1]),
            // new L.LatLng(coords[1][0], coords[0][1]),
        ]
    ];
}

// [[5.185546875000001,58.627964979608535],[-11.25,48.68345321347343]]
// [[-11.25,58.627964979608535],[5.185546875000001,48.68345321347343]]
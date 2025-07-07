import React, { useEffect, useRef, useState } from 'react';
import './CatalogMap.css';
import FilterTitle from '../../../components/FilterTitle/FilterTitle';
import { icons } from '../../../utils/icons';
import { Modal } from '@mui/material';

import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import classNames from 'classnames';
import { ASSET_TYPE, FWKIcons, ICatalogFilters, ModalClose } from '@desp-aas/desp-ui-fwk';
import { ReduxState } from '../../../redux';
import { useDispatch, useSelector } from 'react-redux';
import { formatCoordsAPIToMap, formatCoordsMapToAPI } from '../../../utils/map';
import { updateCatalogFilters, updateCatalogPagination, useFilters } from '../../../utils/catalog';
import { setCatalog } from '../../../redux/catalogReducer';
import { toast } from 'react-toastify';

type IProps = {
    asset_type: ASSET_TYPE
}


const checkRectOutsideBounds = (rect: L.Rectangle) => {
    const bounds = rect.getBounds();
    return bounds.getNorth() > 90 || bounds.getSouth() < -82 || 
        bounds.getEast() > 180 || bounds.getWest() < -180;
}

export const CatalogMap = (props: IProps) => {
    const dispatch = useDispatch();
    const [ mapOpen, setMapOpen ] = useState(false);
    const { catalogFilters } = useSelector((state: ReduxState) => state.catalog);
    const filters = useFilters(props.asset_type);

    if(![ASSET_TYPE.dataset].includes(props.asset_type)) return null;

    return (
        <div id="catalog-filter-draw-on-map">
            <div className="catalog-filter-box" id="catalog-filter-draw-on-map-title" onClick={()=> setMapOpen(true)}>
                <FilterTitle>Geographic search </FilterTitle> {icons.assets.drawOnMap}
            </div>

            {
                filters?.geo &&
                <div 
                    className="button operation red"
                    onClick={()=>{
                        dispatch(setCatalog(updateCatalogFilters(catalogFilters, props.asset_type, { geo: undefined })));
                    }}
                >
                    { FWKIcons.delete } Remove
                </div>
            }

            <Modal
                className="modal"
                id="catalog-filter-map-modal"
                open={mapOpen} 
                onClose={()=> setMapOpen(false)}
            >
                <div className="modal-content">
                    <ModalClose onClick={()=> setMapOpen(false)} />
                    <MapContainer close={()=> setMapOpen(false)} asset_type={props.asset_type} />
                </div>
            </Modal>
        </div>
    )
};

type IMapContainerProps = {
    close: () => void
    asset_type: ASSET_TYPE
}
const MapContainer = (props: IMapContainerProps) => {
    const dispatch = useDispatch();
    const [ map, setMap ] = useState<L.Map|undefined>(undefined);
    const { catalogFilters, catalogPagination } = useSelector((state: ReduxState) => state.catalog);
    const [ filters, setFilters ] = useState<ICatalogFilters>(catalogFilters[props.asset_type]);

    const mapRef = useRef<HTMLDivElement>(null);
    const [ drawing, setDrawing ] = useState(!catalogFilters[props.asset_type].geo);
    const [ newShape, setNewShape ] = useState<L.Rectangle|undefined>(undefined);
    const [ currentShape, setCurrentShape ] = useState<L.Rectangle|undefined>(undefined);
    const [ currentShapeInitialized, setCurrentShapeInitialized ] = useState(false);

    
    useEffect(()=>{
        setFilters(catalogFilters[props.asset_type]);
    }, [ catalogFilters, props.asset_type ])
    
    useEffect(()=>{
        if(!currentShapeInitialized && map){
            if(filters?.geo){
                let coords = formatCoordsAPIToMap(filters.geo);
                map?.fitBounds(coords as any, { maxZoom: 9  });
            }
            setCurrentShapeInitialized(true);
        }
    }, [ currentShapeInitialized, filters, map ])

    useEffect(() => {
        if(currentShape){
            currentShape.remove();
        }
        if(filters?.geo && map){
            let coords = formatCoordsAPIToMap(filters.geo);
            console.log("currentShape coords", coords);
            setCurrentShape(L.rectangle(
                coords as any, 
                {
                    color: 'rgb(var(--theme-color-1))',
                    fillColor: 'rgb(var(--theme-color-1))',
                    fillOpacity: 0.2
                }
            ).addTo(map));
        }
        return () => {
            if(currentShape){
                currentShape.remove();
            }
        }
    }, [ filters, map ])

    useEffect(() => {
        if(mapRef.current){
            let map = L.map(mapRef.current, {
                pmIgnore: false,
                minZoom: 2,
                maxBounds: L.latLngBounds(L.latLng(90, 180), L.latLng(-90, -180)),                
            }).setView([46.2276, 2.2137], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                noWrap: true,
            }).addTo(map);
            L.PM.setOptIn(true);
            setMap(map);
            
            map.on('pm:drawstart', (e) => {
                e.workingLayer.on('pm:change', (e) => {
                    if (checkRectOutsideBounds(e.layer as L.Rectangle)){
                        (e.layer as L.Rectangle).setStyle({
                            color: 'red',
                            fillColor: 'red',
                            fillOpacity: 0.2
                        });
                    }
                    else{
                        (e.layer as L.Rectangle).setStyle({
                            color: 'blue',
                            fillColor: 'blue',
                            fillOpacity: 0.2
                        });
                    }
                });
            });
        }

        return () => {
            if(map){
                map.remove();
            }
        }
    }, []);

    useEffect(() => {
        if(map && drawing){
            map.pm.enableDraw('Rectangle');
        }
    }, [drawing, map]);
    
    useEffect(() => {
        if(map){
            map.off('pm:create');
            map.on('pm:create', (e) => {
                // console.log("create called", e.layer);
                // Remove the default shape that was
                e.layer.remove();
                // Store the shape coordinates for custom handling
                const coords: L.LatLng[][] = (e.layer as L.Rectangle).getLatLngs() as L.LatLng[][];
                // const coords = formatCoords((e.layer as L.Rectangle).getLatLngs() as L.LatLng[][]);
                // Create and store your own shape if needed
                if(map){
                    // console.log("coords", coords);
                    
                    if (checkRectOutsideBounds(e.layer as L.Rectangle)){
                        toast(<>The selected area is out of bounds, please draw a new shape</>, { type: 'warning' })
                    }
                    else{
                        if(newShape){
                            newShape.remove();
                        }
                        let shape = L.rectangle(coords as any, {
                            color: 'rgb(var(--theme-color-green))',
                            fillColor: 'rgb(var(--theme-color-green))',
                            fillOpacity: 0.2
                        })
                        shape.addTo(map);
                        setNewShape(shape);   
                    }
                }
                setDrawing(false);
            });
        }
    }, [newShape, map]);

    return (
        <div id="catalog-filter-map-container">
            <div id="catalog-filter-map-container-map" ref={mapRef}></div>
            <div id="catalog-filter-map-container-operations">
                {
                    drawing ?
                    <>
                        {/* <div 
                            className={classNames({
                                'button operation cancel': true,
                                'disabled': false
                            })}

                            onClick={() => {
                                setDrawing(false);
                            }}
                        >
                            { FWKIcons.cancel } Cancel
                        </div> */}
                    </> 
                    : <>
                        <div 
                            className={classNames({
                                'button operation blue': true,
                                'disabled': false
                            })}

                            onClick={() => {
                                setDrawing(true);
                            }}
                        >
                            { icons.map.draw } Draw new
                        </div>
                        {
                            newShape &&
                            <>
                                <div 
                                    className={classNames({
                                        'button operation': true,
                                        'disabled': false
                                    })}

                                    onClick={() => {
                                        if(newShape){
                                            // console.log("updates catalogPagination", catalogPagination)
                                            let updates = {};
                                            Object.assign(updates, updateCatalogFilters(catalogFilters, props.asset_type, { 
                                                geo: formatCoordsMapToAPI(newShape.getLatLngs() as L.LatLng[][]) 
                                            }))
                                            Object.assign(
                                                updates, 
                                                updateCatalogPagination(catalogPagination, props.asset_type, { recommendedAssetOffset: 0, assetOffset: 0 })
                                            )
                                            // console.log("updates", updates);
                                            
                                            dispatch(setCatalog(updates));
                                            
                                            props.close();
                                        }
                                    }}
                                >
                                    { FWKIcons.confirm } Apply
                                </div>
                                <div 
                                    className={classNames({
                                        'button operation cancel': true,
                                        'disabled': false
                                    })}

                                    onClick={() => {
                                        props.close();
                                    }}
                                >
                                    { FWKIcons.cancel } Cancel
                                </div>
                            </>
                        }
                        {/* <div 
                            className={classNames({
                                'button operation cancel': true,
                                'disabled': false
                            })}

                            onClick={() => {
                                props.close();
                            }}
                        >
                            { FWKIcons.close } Close
                        </div> */}

                    </>
                }
            </div>
        </div>
    )
}
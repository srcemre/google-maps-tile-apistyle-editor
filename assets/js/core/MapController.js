// Core logic for Map rendering and URL construction

const URL_PREFIX = 'https://mt0.google.com/vt/';

export class MapController {
    constructor(mapContainerId) {
        this.map = null;
        this.googleTileLayer = null;
        this.containerId = mapContainerId;
    }

    init() {
        this.map = L.map(this.containerId, {
            center: [37.7749, -122.4194],
            zoom: 13,
            minZoom: 2,
            maxZoom: 20,
            zoomControl: false
        });
        L.control.zoom({ position: 'topright' }).addTo(this.map);
        
        return this.map;
    }

    updateLayer(lyrs, apistyle) {
        const newUrlTemplate = this.buildTileUrl(lyrs, apistyle);
        
        if (this.googleTileLayer) {
            this.map.removeLayer(this.googleTileLayer);
        }

        this.googleTileLayer = L.tileLayer(newUrlTemplate, {
            maxZoom: 20,
            attribution: 'Google Maps Style Explorer',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        this.googleTileLayer.addTo(this.map);
        return newUrlTemplate;
    }

    setZoom(level) {
        this.map.setZoom(level);
    }

    buildTileUrl(lyrs, apistyle) {
        let url = `${URL_PREFIX}lyrs=${lyrs}&x={x}&y={y}&z={z}`;
        
        if (apistyle && apistyle.trim() !== '') {
            let cleanStyle = apistyle.trim();
            // Clean up double encoding if present
            try {
                if (cleanStyle.includes('%')) {
                    cleanStyle = decodeURIComponent(cleanStyle);
                }
            } catch (e) {
                console.warn("Decode warning:", e);
            }
            
            const encodedStyleParam = encodeURIComponent(cleanStyle);
            url += `&apistyle=${encodedStyleParam}`;
        }
        
        // Cache buster
        url += `&ts=${Date.now()}`;
        return url;
    }
}
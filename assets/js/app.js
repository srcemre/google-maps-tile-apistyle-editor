// Global Variables
        let map;
        let googleTileLayer;
        const URL_PREFIX = 'https://mt0.google.com/vt/';

        // DOM Elements
        const apistyleInput = document.getElementById('apistyle-input');
        const debugUrlInput = document.getElementById('debug-url');
        const layerSelect = document.getElementById('layer-select'); 
        
        /**
         * Constructs the Tile URL based on layer type and api style string.
         */
        function buildTileUrl(lyrs, apistyle) {
            // 1. Base URL
            let url = `${URL_PREFIX}lyrs=${lyrs}&x={x}&y={y}&z={z}`;

            if (apistyle && apistyle.trim() !== '') {
                let cleanStyle = apistyle.trim();
                
                // 2. Smart Decode: Check if already encoded to prevent double encoding
                try {
                    if (cleanStyle.includes('%')) {
                        cleanStyle = decodeURIComponent(cleanStyle);
                    }
                } catch (e) {
                    console.log("Decode error, using raw string.");
                }

                // 3. Clean Encode
                const encodedStyleParam = encodeURIComponent(cleanStyle);
                url += `&apistyle=${encodedStyleParam}`;
            }
            
            // 4. Cache Buster
            url += `&ts=${Date.now()}`;
            
            return url;
        }

        /**
         * Initialize Map
         */
        function initializeMap() {
            map = L.map('map', {
                center: [37.7749, -122.4194], // San Francisco (Good for testing styles)
                zoom: 13,
                minZoom: 2,
                maxZoom: 18,
                zoomControl: false // Using custom or default
            });
            
            // Add zoom control to top-right
            L.control.zoom({
                position: 'topright'
            }).addTo(map);

            updateMap();
        }

        /**
         * Update Map Layer
         */
        function updateMap() {
            const lyrs = layerSelect.value;
            const apistyle = apistyleInput.value;
            
            const newUrlTemplate = buildTileUrl(lyrs, apistyle);
            
            // Create Debug URL (Example coords)
            const debugUrl = newUrlTemplate
                .replace('{x}', '16515')
                .replace('{y}', '11970')
                .replace('{z}', '15')
                .replace(/&ts=\d+/, ''); // Remove timestamp for clean debug link
            
            debugUrlInput.value = debugUrl;

            // Remove old layer
            if (googleTileLayer) {
                map.removeLayer(googleTileLayer);
            }

            // Add new layer
            googleTileLayer = L.tileLayer(newUrlTemplate, {
                maxZoom: 18,
                attribution: 'Google Maps Style Explorer',
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            });

            googleTileLayer.addTo(map);
            
            console.log("Map Updated. Layer:", lyrs);
        }

        // ----------------------------------------------------------------
        // Event Listeners
        // ----------------------------------------------------------------

        // Apply Button
        document.getElementById('apply-style-btn').addEventListener('click', updateMap);

        // Reset Button
        document.getElementById('reset-style-btn').addEventListener('click', () => {
            apistyleInput.value = '';
            layerSelect.value = 'm'; // Reset to standard layer
            
            // Clear selection highlight
            const presetButtons = document.querySelectorAll('.preset-btn');
            presetButtons.forEach(b => {
                b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500', 'ring-pink-500', 'border-pink-500', 'ring-orange-500', 'border-orange-500');
                b.classList.add('border-gray-200'); // Restore default border
            });

            updateMap();
        });

        // Layer Select Change
        layerSelect.addEventListener('change', updateMap);

        // Preset Buttons Logic (Highlight logic updated)
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // 1. Get data from clicked button
                const style = this.getAttribute('data-style');
                const layer = this.getAttribute('data-layer'); // 'p' or 'm' etc.

                // 2. Set Input Values
                apistyleInput.value = style;
                
                // 3. AUTO SWITCH LAYER
                if (layer) {
                    layerSelect.value = layer;
                }

                // 4. Update Visual Feedback (Highlight active button)
                presetButtons.forEach(b => {
                    b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500', 'ring-pink-500', 'border-pink-500', 'ring-orange-500', 'border-orange-500');
                    b.classList.add('border-gray-200'); // Add default border back
                });
                
                // Add highlight classes (Dynamic based on style)
                this.classList.remove('border-gray-200');
                
                if (style.includes('ff00ff')) { // Cyberpunk check
                     this.classList.add('ring-2', 'ring-pink-500', 'border-pink-500');
                } else if (style.includes('e6dac3')) { // Fantasy check
                     this.classList.add('ring-2', 'ring-orange-500', 'border-orange-500');
                } else {
                     this.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500');
                }

                // 5. Update Map
                updateMap();
            });
        });

        // Mobile Menu Toggle
        document.getElementById('toggle-menu-btn').addEventListener('click', () => {
            const panel = document.getElementById('control-panel');
            if (panel.classList.contains('-translate-x-full')) {
                panel.classList.remove('-translate-x-full');
            } else {
                panel.classList.add('-translate-x-full');
            }
        });

        // Init
        window.onload = initializeMap;
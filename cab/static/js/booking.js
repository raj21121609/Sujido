const apiKey = '5063a03469dc4e8ebc294cbe8ecf41ec';

    const map = L.map('map').setView([20.5937, 78.9629], 6);

    L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    let pickupMarker = null;
    let dropMarker = null;
    let routeLine = null;
    let pickupCoords = null;
    let dropCoords = null;

    const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: '<div style="background: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">A</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const dropIcon = L.divIcon({
        className: 'custom-drop-marker',
        html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">B</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    async function getCoordinatesFromAddress(address) {
        try {
            console.log('Geocoding address:', address);
            const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}&limit=1&filter=countrycode:in`);
            
            if (!response.ok) {
                console.error('Geocoding API error:', response.status, response.statusText);
                return null;
            }
            
            const data = await response.json();
            console.log('Geocoding response:', data);
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const result = {
                    lat: feature.properties.lat,
                    lon: feature.properties.lon,
                    address: feature.properties.formatted
                };
                console.log('Geocoding success:', result);
                return result;
            }
            
            console.log('No geocoding results found for:', address);
            return null;
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return null;
        }
    }

    async function updatePickupLocation(address) {
        if (!address || address.trim() === '') {
            if (pickupMarker) {
                map.removeLayer(pickupMarker);
                pickupMarker = null;
                pickupCoords = null;
            }
            updateMapView();
            return;
        }

        const coords = await getCoordinatesFromAddress(address);
        if (coords) {
            pickupCoords = [coords.lat, coords.lon];

            if (pickupMarker) {
                map.removeLayer(pickupMarker);
            }

            pickupMarker = L.marker(pickupCoords, { icon: pickupIcon })
                .addTo(map)
                .bindPopup(`<b>Pickup Location</b><br>${coords.address}`)
                .openPopup();
            
            updateMapView();
        }
    }

    async function updateDropLocation(address) {
        if (!address || address.trim() === '') {
            if (dropMarker) {
                map.removeLayer(dropMarker);
                dropMarker = null;
                dropCoords = null;
            }
            updateMapView();
            return;
        }

        const coords = await getCoordinatesFromAddress(address);
        if (coords) {
            dropCoords = [coords.lat, coords.lon];

            if (dropMarker) {
                map.removeLayer(dropMarker);
            }
            
            dropMarker = L.marker(dropCoords, { icon: dropIcon })
                .addTo(map)
                .bindPopup(`<b>Destination</b><br>${coords.address}`)
                .openPopup();
            
            updateMapView();
        }
    }

    function updateMapView() {
        if (pickupCoords && dropCoords) {
            const group = new L.featureGroup([pickupMarker, dropMarker]);
            map.fitBounds(group.getBounds().pad(0.1));

            drawRouteLine();
        } else if (pickupCoords) {

            map.setView(pickupCoords, 15);
        } else if (dropCoords) {
            map.setView(dropCoords, 15);
        } else {
            map.setView([20.5937, 78.9629], 6);
        }
    }

    function drawRouteLine() {
        if (!pickupCoords || !dropCoords) return;

        if (routeLine) {
            map.removeLayer(routeLine);
        }

        routeLine = L.polyline([pickupCoords, dropCoords], {
            color: '#b59f00',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(map);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        const radioInputs = document.querySelectorAll('input[name="vehicle"]');
        const bookButton = document.getElementById('bookButton');
        const rideDetails = document.getElementById('rideDetails');
        const confirmButton = document.getElementById('confirmButton');

        const vehiclePricing = {
            'sujido-mini': 4.0,      // ₹4 per km
            'sujido-plus': 5.0,      // ₹5 per km  
            'sujido-premium': 6.0    // ₹6 per km
        };

        vehicleOptions.forEach(option => {
            option.addEventListener('click', function() {

                vehicleOptions.forEach(opt => opt.classList.remove('selected'));

                this.classList.add('selected');

                const radioInput = this.querySelector('input[type="radio"]');
                if (radioInput) {
                    radioInput.checked = true;
                }
            });
        });

        radioInputs.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    vehicleOptions.forEach(opt => opt.classList.remove('selected'));
                    this.closest('.vehicle-option').classList.add('selected');
                }
            });
        });

        bookButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const pickup = document.getElementById('pickup').value;
            const drop = document.getElementById('drop').value;
            const selectedVehicle = document.querySelector('input[name="vehicle"]:checked');

            if (!pickup || !drop || !selectedVehicle) {
                alert('Please fill in all fields and select a vehicle.');
                return;
            }

            const vehicleType = selectedVehicle.value;
            const pricePerKm = vehiclePricing[vehicleType];

            // Ensure we have coordinates (fallback to geocoding if user typed without selecting suggestion)
            async function ensureCoords() {
                let p = pickupCoords;
                let d = dropCoords;
                
                // Always try to get coordinates for both locations
                if (!p) {
                    console.log('Getting coordinates for pickup:', pickup);
                    const c = await getCoordinatesFromAddress(pickup);
                    if (c) {
                        p = [c.lat, c.lon];
                        console.log('Got pickup coordinates:', p);
                    } else {
                        console.error('Failed to get pickup coordinates');
                    }
                }
                
                if (!d) {
                    console.log('Getting coordinates for drop:', drop);
                    const c = await getCoordinatesFromAddress(drop);
                    if (c) {
                        d = [c.lat, c.lon];
                        console.log('Got drop coordinates:', d);
                    } else {
                        console.error('Failed to get drop coordinates');
                    }
                }
                
                return { p, d };
            }

            async function getDistanceTimeMetersSeconds(p, d) {
                try {
                    const body = {
                        mode: 'drive',
                        sources: [{ location: p }],
                        targets: [{ location: d }]
                    };
                    const res = await fetch(`https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (!res.ok) throw new Error('Route API error');
                    const data = await res.json();
                    const meters = data && data.distances && data.distances[0] && data.distances[0][0];
                    const seconds = data && data.times && data.times[0] && data.times[0][0];
                    if (typeof meters !== 'number' || typeof seconds !== 'number') throw new Error('Invalid route response');
                    return { meters, seconds };
                } catch (err) {
                    console.error('Route error:', err);
                    return null;
                }
            }

            const { p, d } = await ensureCoords();
            if (!p || !d) {
                alert('Could not determine locations. Please try using more specific addresses like "Mumbai Airport" or "Delhi Railway Station".');
                return;
            }

            const route = await getDistanceTimeMetersSeconds(p, d);
            if (!route) {
                alert('Unable to calculate route. Please try again.');
                return;
            }

            const distanceKm = Math.round((route.meters / 1000) * 100) / 100; // 2 decimals
            const timeMin = Math.round(route.seconds / 60);
            const totalPrice = Math.round(distanceKm * pricePerKm * 100) / 100;
            const estimatedTime = timeMin;

            document.getElementById('pickupSummary').textContent = pickup;
            document.getElementById('dropSummary').textContent = drop;
            document.getElementById('totalPrice').textContent = `₹${totalPrice.toFixed(2)}`;
            document.getElementById('estimatedTime').textContent = `${estimatedTime} min`;

            rideDetails.classList.add('show');

            rideDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        confirmButton.addEventListener('click', function() {
            alert('🎉 Booking confirmed! Your driver will arrive shortly.');
            
        });

        class Autocomplete {
            constructor(inputId, dropdownId) {
                this.input = document.getElementById(inputId);
                this.dropdown = document.getElementById(dropdownId);
                this.selectedIndex = -1;
                this.suggestions = [];
                this.debounceTimer = null;
                
                this.init();
            }
            
            init() {
                this.input.addEventListener('input', (e) => this.handleInput(e));
                this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
                this.input.addEventListener('blur', () => this.hideDropdown());
                this.input.addEventListener('focus', () => {
                    if (this.suggestions.length > 0) {
                        this.showDropdown();
                    }
                });
            }
            
            handleInput(e) {
                const query = e.target.value.trim();

                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }

                this.debounceTimer = setTimeout(() => {
                    if (query.length >= 2) {
                        this.fetchSuggestions(query);
                    } else {
                        this.hideDropdown();
                    }
                }, 300);
            }
            
            async fetchSuggestions(query) {
                try {
                    this.showLoading();
                    
                    const response = await fetch(`/api/autocomplete/?q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    
                    if (data.suggestions) {
                        this.suggestions = data.suggestions;
                        this.renderSuggestions();
                    } else {
                        this.showNoResults();
                    }
                } catch (error) {
                    console.error('Autocomplete error:', error);
                    this.showError();
                }
            }
            
            renderSuggestions() {
                if (this.suggestions.length === 0) {
                    this.showNoResults();
                    return;
                }
                
                this.dropdown.innerHTML = '';
                this.selectedIndex = -1;
                
                this.suggestions.forEach((suggestion, index) => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerHTML = `
                        <div class="autocomplete-main-text">${suggestion.text}</div>
                        <div class="autocomplete-sub-text">
                            <div class="autocomplete-location-icon">📍</div>
                            <span>${suggestion.city}, ${suggestion.state}</span>
                        </div>
                    `;
                    
                    item.addEventListener('click', () => this.selectSuggestion(suggestion));
                    item.addEventListener('mouseenter', () => this.highlightItem(index));
                    
                    this.dropdown.appendChild(item);
                });
                
                this.showDropdown();
            }
            
            selectSuggestion(suggestion) {
                this.input.value = suggestion.text;
                this.hideDropdown();
                this.input.focus();

                if (this.input.id === 'pickup') {
                    updatePickupLocation(suggestion.text);
                } else if (this.input.id === 'drop') {
                    updateDropLocation(suggestion.text);
                }
            }
            
            highlightItem(index) {
                this.dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                if (this.dropdown.children[index]) {
                    this.dropdown.children[index].classList.add('selected');
                    this.selectedIndex = index;
                }
            }
            
            handleKeydown(e) {
                if (!this.dropdown.classList.contains('show')) return;
                
                const items = this.dropdown.querySelectorAll('.autocomplete-item');
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                        this.highlightItem(this.selectedIndex);
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                        if (this.selectedIndex >= 0) {
                            this.highlightItem(this.selectedIndex);
                        } else {
                            this.clearHighlight();
                        }
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
                            this.selectSuggestion(this.suggestions[this.selectedIndex]);
                        }
                        break;
                        
                    case 'Escape':
                        this.hideDropdown();
                        break;
                }
            }
            
            clearHighlight() {
                this.dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.classList.remove('selected');
                });
                this.selectedIndex = -1;
            }
            
            showDropdown() {
                this.dropdown.classList.add('show');
            }
            
            hideDropdown() {
                setTimeout(() => {
                    this.dropdown.classList.remove('show');
                }, 150);
            }
            
            showLoading() {
                this.dropdown.innerHTML = '<div class="autocomplete-loading">🔍 Searching...</div>';
                this.showDropdown();
            }
            
            showNoResults() {
                this.dropdown.innerHTML = '<div class="autocomplete-no-results">No results found</div>';
                this.showDropdown();
            }
            
            showError() {
                this.dropdown.innerHTML = '<div class="autocomplete-no-results">Error loading suggestions</div>';
                this.showDropdown();
            }
        }

        const pickupAutocomplete = new Autocomplete('pickup', 'pickup-dropdown');
        const dropAutocomplete = new Autocomplete('drop', 'drop-dropdown');

        const pickupInput = document.getElementById('pickup');
        const dropInput = document.getElementById('drop');
        
        let pickupTimeout = null;
        let dropTimeout = null;

        pickupInput.addEventListener('input', function() {
            clearTimeout(pickupTimeout);
            pickupTimeout = setTimeout(() => {
                if (this.value.trim().length >= 3) {
                    updatePickupLocation(this.value);
                }
            }, 1000); 
        });

        dropInput.addEventListener('input', function() {
            clearTimeout(dropTimeout);
            dropTimeout = setTimeout(() => {
                if (this.value.trim().length >= 3) {
                    updateDropLocation(this.value);
                }
            }, 1000); 
        });

        pickupInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearTimeout(pickupTimeout);
                updatePickupLocation('');
            }
        });

        dropInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearTimeout(dropTimeout);
                updateDropLocation('');
            }
        });
    });
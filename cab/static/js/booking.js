
// MapmyIndia Map Implementation
let map;
    let pickupMarker = null;
    let dropMarker = null;
    let routeLine = null;
    let pickupCoords = null;
    let dropCoords = null;

// Wait for MapmyIndia SDK to load
function waitForMapmyIndia() {
    return new Promise((resolve, reject) => {
        if (window.MapmyIndia) {
            resolve();
        } else {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.MapmyIndia) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('MapmyIndia SDK failed to load'));
                }
            }, 100);
        }
    });
}

// Initialize MapmyIndia Map
async function initializeMap() {
    try {
        console.log('Waiting for MapmyIndia SDK...');
        await waitForMapmyIndia();
        console.log('MapmyIndia SDK loaded successfully');
        
        // Initialize the map
        map = new MapmyIndia.Map("map", {
            center: [28.6139, 77.2090], // New Delhi
            zoomControl: true,
            hybrid: true,
            zoom: 12
        });

        console.log('MapmyIndia map initialized successfully');
        
        // Add a default marker to show the map is working
        const defaultMarker = new L.Marker([28.6139, 77.2090]).addTo(map);
        defaultMarker.bindPopup("Welcome to Sujido!<br>Enter pickup and destination to see your route").openPopup();
        
    } catch (error) {
        console.error('Error initializing MapmyIndia map:', error);
        
        // Fallback: show a styled placeholder
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-size: 1.1rem; font-weight: 500; border-radius: 10px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #b59f00 0%, #facc15 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; margin-bottom: 1rem; animation: float 3s ease-in-out infinite;">🗺️</div>
                <div style="text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a;">Map Loading...</div>
                    <div style="font-size: 0.9rem;">Please check your internet connection</div>
                </div>
            </div>
        `;
    }
}

// Get coordinates from address using MapmyIndia Geocoding
    async function getCoordinatesFromAddress(address) {
        try {
            console.log('Geocoding address:', address);
        
        // Using MapmyIndia Geocoding API
        const geocodeUrl = `https://apis.mapmyindia.com/advancedmaps/v1/9b2d2c23baf46d6aa9bb5cd7e58c5f17/geocode?addr=${encodeURIComponent(address)}`;
        console.log('Geocoding URL:', geocodeUrl);
        
        const response = await fetch(geocodeUrl);
            
            if (!response.ok) {
                console.error('Geocoding API error:', response.status, response.statusText);
            console.log('Response text:', await response.text());
                return null;
            }
            
            const data = await response.json();
            console.log('Geocoding response:', data);
            
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const coords = {
                lat: result.lat,
                lon: result.lon,
                address: result.formatted_address
            };
            console.log('Geocoding success:', coords);
            
            // Check if coordinates are valid
            if (coords.lat === 0 && coords.lon === 0) {
                console.warn('API returned 0,0 coordinates - invalid');
                return null;
            }
            
            return coords;
            }
            
            console.log('No geocoding results found for:', address);
        console.log('Full response:', data);
            return null;
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return null;
        }
    }

// Fallback geocoding for common Indian cities
function getFallbackCoordinates(address) {
    const lowerAddress = address.toLowerCase();
    
    const cityCoordinates = {
        'delhi': { lat: 28.6139, lon: 77.2090, address: 'New Delhi, India' },
        'new delhi': { lat: 28.6139, lon: 77.2090, address: 'New Delhi, India' },
        'mumbai': { lat: 19.0760, lon: 72.8777, address: 'Mumbai, India' },
        'bangalore': { lat: 12.9716, lon: 77.5946, address: 'Bangalore, India' },
        'bengaluru': { lat: 12.9716, lon: 77.5946, address: 'Bangalore, India' },
        'chennai': { lat: 13.0827, lon: 80.2707, address: 'Chennai, India' },
        'kolkata': { lat: 22.5726, lon: 88.3639, address: 'Kolkata, India' },
        'hyderabad': { lat: 17.3850, lon: 78.4867, address: 'Hyderabad, India' },
        'pune': { lat: 18.5204, lon: 73.8567, address: 'Pune, India' },
        'ahmedabad': { lat: 23.0225, lon: 72.5714, address: 'Ahmedabad, India' },
        'jaipur': { lat: 26.9124, lon: 75.7873, address: 'Jaipur, India' },
        'lucknow': { lat: 26.8467, lon: 80.9462, address: 'Lucknow, India' },
        'kanpur': { lat: 26.4499, lon: 80.3319, address: 'Kanpur, India' },
        'nagpur': { lat: 21.1458, lon: 79.0882, address: 'Nagpur, India' },
        'indore': { lat: 22.7196, lon: 75.8577, address: 'Indore, India' },
        'bhopal': { lat: 23.2599, lon: 77.4126, address: 'Bhopal, India' },
        'visakhapatnam': { lat: 17.6868, lon: 83.2185, address: 'Visakhapatnam, India' },
        'patna': { lat: 25.5941, lon: 85.1376, address: 'Patna, India' },
        'vadodara': { lat: 22.3072, lon: 73.1812, address: 'Vadodara, India' },
        'ludhiana': { lat: 30.9010, lon: 75.8573, address: 'Ludhiana, India' },
        'agra': { lat: 27.1767, lon: 78.0081, address: 'Agra, India' },
        'nashik': { lat: 19.9975, lon: 73.7898, address: 'Nashik, India' },
        'faridabad': { lat: 28.4089, lon: 77.3178, address: 'Faridabad, India' },
        'meerut': { lat: 28.9845, lon: 77.7064, address: 'Meerut, India' },
        'rajkot': { lat: 22.3039, lon: 70.8022, address: 'Rajkot, India' },
        'kalyan': { lat: 19.2437, lon: 73.1355, address: 'Kalyan, India' },
        'vasai': { lat: 19.4700, lon: 72.8000, address: 'Vasai, India' },
        'varanasi': { lat: 25.3176, lon: 82.9739, address: 'Varanasi, India' },
        'srinagar': { lat: 34.0837, lon: 74.7973, address: 'Srinagar, India' },
        'aurangabad': { lat: 19.8762, lon: 75.3433, address: 'Aurangabad, India' },
        'noida': { lat: 28.5355, lon: 77.3910, address: 'Noida, India' },
        'solapur': { lat: 17.6599, lon: 75.9064, address: 'Solapur, India' },
        'ranchi': { lat: 23.3441, lon: 85.3096, address: 'Ranchi, India' },
        'chandigarh': { lat: 30.7333, lon: 76.7794, address: 'Chandigarh, India' },
        'mysore': { lat: 12.2958, lon: 76.6394, address: 'Mysore, India' },
        'kochi': { lat: 9.9312, lon: 76.2673, address: 'Kochi, India' },
        'bhubaneswar': { lat: 20.2961, lon: 85.8245, address: 'Bhubaneswar, India' },
        'amritsar': { lat: 31.6340, lon: 74.8723, address: 'Amritsar, India' },
        'vijayawada': { lat: 16.5062, lon: 80.6480, address: 'Vijayawada, India' },
        'madurai': { lat: 9.9252, lon: 78.1198, address: 'Madurai, India' },
        'jodhpur': { lat: 26.2389, lon: 73.0243, address: 'Jodhpur, India' },
        'raipur': { lat: 21.2514, lon: 81.6296, address: 'Raipur, India' },
        'kota': { lat: 25.2138, lon: 75.8648, address: 'Kota, India' },
        'guwahati': { lat: 26.1445, lon: 91.7362, address: 'Guwahati, India' },
        'chandrapur': { lat: 19.9615, lon: 79.2961, address: 'Chandrapur, India' },
        'kolhapur': { lat: 16.7050, lon: 74.2433, address: 'Kolhapur, India' },
        'ajmer': { lat: 26.4499, lon: 74.6399, address: 'Ajmer, India' },
        'akola': { lat: 20.7000, lon: 77.0000, address: 'Akola, India' },
        'gulbarga': { lat: 17.3297, lon: 76.8343, address: 'Gulbarga, India' },
        'jamnagar': { lat: 22.4707, lon: 70.0577, address: 'Jamnagar, India' },
        'ujjain': { lat: 23.1765, lon: 75.7885, address: 'Ujjain, India' },
        'loni': { lat: 28.7519, lon: 77.2880, address: 'Loni, India' },
        'siliguri': { lat: 26.7271, lon: 88.3953, address: 'Siliguri, India' },
        'jhansi': { lat: 25.4484, lon: 78.5685, address: 'Jhansi, India' },
        'ulhasnagar': { lat: 19.2215, lon: 73.1645, address: 'Ulhasnagar, India' },
        'nellore': { lat: 14.4426, lon: 79.9865, address: 'Nellore, India' },
        'jammu': { lat: 32.7266, lon: 74.8570, address: 'Jammu, India' },
        'sangli': { lat: 16.8524, lon: 74.5815, address: 'Sangli, India' },
        'miraj': { lat: 16.8300, lon: 74.6300, address: 'Miraj, India' },
        'belgaum': { lat: 15.8497, lon: 74.4977, address: 'Belgaum, India' },
        'mangalore': { lat: 12.9141, lon: 74.8560, address: 'Mangalore, India' },
        'ambattur': { lat: 13.0767, lon: 80.0882, address: 'Ambattur, India' },
        'tirunelveli': { lat: 8.7139, lon: 77.7567, address: 'Tirunelveli, India' },
        'malegaon': { lat: 20.5598, lon: 74.5255, address: 'Malegaon, India' },
        'gaya': { lat: 24.7914, lon: 85.0002, address: 'Gaya, India' },
        'jalgaon': { lat: 21.0077, lon: 75.5626, address: 'Jalgaon, India' },
        'udaipur': { lat: 24.5854, lon: 73.7125, address: 'Udaipur, India' },
        'maheshtala': { lat: 22.5086, lon: 88.2532, address: 'Maheshtala, India' },
        'palghar': { lat: 19.6969, lon: 72.7654, address: 'Palghar, Maharashtra, India' },
        'kelva': { lat: 19.8000, lon: 72.7500, address: 'Kelva, Maharashtra, India' },
        'kelva beach': { lat: 19.8000, lon: 72.7500, address: 'Kelva Beach, Maharashtra, India' },
        'kelva road': { lat: 19.8000, lon: 72.7500, address: 'Kelva Road, Maharashtra, India' },
        'palghar district': { lat: 19.6969, lon: 72.7654, address: 'Palghar District, Maharashtra, India' },
        'vasai virar': { lat: 19.4700, lon: 72.8000, address: 'Vasai Virar, Maharashtra, India' },
        'thane': { lat: 19.2183, lon: 72.9781, address: 'Thane, Maharashtra, India' },
        'bhiwandi': { lat: 19.3002, lon: 73.0589, address: 'Bhiwandi, Maharashtra, India' },
        'ulhasnagar': { lat: 19.2215, lon: 73.1645, address: 'Ulhasnagar, Maharashtra, India' },
        'badlapur': { lat: 19.1552, lon: 73.2655, address: 'Badlapur, Maharashtra, India' },
        'ambernath': { lat: 19.2086, lon: 73.1833, address: 'Ambernath, Maharashtra, India' },
        'dombivli': { lat: 19.2167, lon: 73.0833, address: 'Dombivli, Maharashtra, India' },
        'kalyan': { lat: 19.2437, lon: 73.1355, address: 'Kalyan, Maharashtra, India' },
        'kalyan dombivli': { lat: 19.2437, lon: 73.1355, address: 'Kalyan Dombivli, Maharashtra, India' },
        'mira bhayandar': { lat: 19.2952, lon: 72.8544, address: 'Mira Bhayandar, Maharashtra, India' },
        'bhiwandi nizampur': { lat: 19.3002, lon: 73.0589, address: 'Bhiwandi Nizampur, Maharashtra, India' }
    };
    
    for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (lowerAddress.includes(city)) {
            console.log(`Found fallback coordinates for ${city}:`, coords);
            return coords;
        }
    }
    
    // Default to Delhi if no match
    console.log('No city match found, using Delhi as default');
    return { lat: 28.6139, lon: 77.2090, address: address };
}

// Update pickup location on map
    async function updatePickupLocation(address) {
        if (!address || address.trim() === '') {
        if (pickupMarker && map) {
                map.removeLayer(pickupMarker);
                pickupMarker = null;
                pickupCoords = null;
            }
        // Clear route line if pickup is removed
        if (routeLine && map) {
            map.removeLayer(routeLine);
            routeLine = null;
        }
        return;
    }

    let coords = await getCoordinatesFromAddress(address);
    
    // If API fails, try fallback
    if (!coords) {
        console.log('API failed, trying fallback for pickup:', address);
        coords = getFallbackCoordinates(address);
    }
    
    if (coords && map) {
            pickupCoords = [coords.lat, coords.lon];

            if (pickupMarker) {
                map.removeLayer(pickupMarker);
            }

        // Create custom pickup marker
        const pickupIcon = L.divIcon({
            className: 'custom-pickup-marker',
            html: '<div style="background: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">A</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        pickupMarker = new L.Marker(pickupCoords, { icon: pickupIcon }).addTo(map);
        pickupMarker.bindPopup(`<b>Pickup Location</b><br>${coords.address}`).openPopup();
            
            updateMapView();
        
        }
    }

// Update drop location on map
    async function updateDropLocation(address) {
        if (!address || address.trim() === '') {
        if (dropMarker && map) {
                map.removeLayer(dropMarker);
                dropMarker = null;
                dropCoords = null;
            }
        // Clear route line if drop is removed
        if (routeLine && map) {
            map.removeLayer(routeLine);
            routeLine = null;
        }
        return;
    }

    let coords = await getCoordinatesFromAddress(address);
    
    // If API fails, try fallback
    if (!coords) {
        console.log('API failed, trying fallback for drop:', address);
        coords = getFallbackCoordinates(address);
    }
    
    if (coords && map) {
            dropCoords = [coords.lat, coords.lon];

            if (dropMarker) {
                map.removeLayer(dropMarker);
            }
            
        // Create custom drop marker
        const dropIcon = L.divIcon({
            className: 'custom-drop-marker',
            html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">B</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        dropMarker = new L.Marker(dropCoords, { icon: dropIcon }).addTo(map);
        dropMarker.bindPopup(`<b>Destination</b><br>${coords.address}`).openPopup();
            
            updateMapView();
        }
    }

// Draw route line between pickup and drop
function drawRouteLine() {
    if (!map || !pickupCoords || !dropCoords) return;
    
    // Remove existing route line
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    
    // Create route line
    routeLine = L.polyline([pickupCoords, dropCoords], {
        color: '#b59f00',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(map);
    
    console.log('Route line drawn between:', pickupCoords, 'and', dropCoords);
}

// Update map view to fit markers
    function updateMapView() {
    if (!map) return;
    
        if (pickupCoords && dropCoords) {
            const group = new L.featureGroup([pickupMarker, dropMarker]);
            map.fitBounds(group.getBounds().pad(0.1));

        // Draw route line
            drawRouteLine();
        } else if (pickupCoords) {
            map.setView(pickupCoords, 15);
        } else if (dropCoords) {
            map.setView(dropCoords, 15);
        } else {
        map.setView([28.6139, 77.2090], 12);
    }
}

// Calculate distance and time using MapmyIndia Route API
async function getDistanceTimeMetersSeconds(pickupCoords, dropCoords) {
    try {
        console.log('Calculating route with MapmyIndia API...');
        console.log('Pickup coords:', pickupCoords);
        console.log('Drop coords:', dropCoords);
        
        // Format: start_lng,start_lat;end_lng,end_lat
        const startLng = pickupCoords[1];
        const startLat = pickupCoords[0];
        const endLng = dropCoords[1];
        const endLat = dropCoords[0];
        
        const routeUrl = `https://apis.mapmyindia.com/advancedmaps/v1/9b2d2c23baf46d6aa9bb5cd7e58c5f17/route_adv/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson`;
        
        console.log('Route API URL:', routeUrl);
        
        const response = await fetch(routeUrl);
        
        if (!response.ok) {
            console.error('Route API error:', response.status, response.statusText);
            throw new Error(`Route API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Route API response:', data);
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const meters = route.distance;
            const seconds = route.duration;
            
            console.log('Route calculation success:', { meters, seconds });
            
            // Validate route data
            if (typeof meters !== 'number' || typeof seconds !== 'number') {
                console.error('Invalid route data types:', { meters, seconds });
                throw new Error('Invalid route data types');
            }
            
            if (meters <= 0 || seconds <= 0) {
                console.error('Invalid route values:', { meters, seconds });
                throw new Error('Invalid route values');
            }
            
            return { meters, seconds };
        }
        
        throw new Error('No route found in response');
    } catch (error) {
        console.error('Route calculation error:', error);
        
        // Fallback: simple distance calculation if API fails
        console.log('Using fallback distance calculation...');
        const latDiff = Math.abs(pickupCoords[0] - dropCoords[0]);
        const lonDiff = Math.abs(pickupCoords[1] - dropCoords[1]);
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000; // Rough conversion to meters
        const time = distance / 1000 * 2; // Rough time calculation (2 minutes per km)
        
        // Ensure minimum values
        const finalDistance = Math.max(distance, 1000); // At least 1km
        const finalTime = Math.max(time * 60, 60); // At least 1 minute
        
        console.log('Fallback calculation:', { 
            originalDistance: distance, 
            finalDistance: finalDistance,
            originalTime: time * 60,
            finalTime: finalTime
        });
        
        return { meters: finalDistance, seconds: finalTime };
    }
}

// Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    initializeMap();
    
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

    // Vehicle selection handling
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

    // Book button functionality
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

        // Ensure we have coordinates
            async function ensureCoords() {
                let p = pickupCoords;
                let d = dropCoords;
                
                if (!p) {
                    console.log('Getting coordinates for pickup:', pickup);
                let c = await getCoordinatesFromAddress(pickup);
                
                // If API fails, try fallback
                if (!c) {
                    console.log('API failed, trying fallback for pickup:', pickup);
                    c = getFallbackCoordinates(pickup);
                }
                
                    if (c) {
                        p = [c.lat, c.lon];
                        console.log('Got pickup coordinates:', p);
                    } else {
                        console.error('Failed to get pickup coordinates');
                    }
                }
                
                if (!d) {
                    console.log('Getting coordinates for drop:', drop);
                let c = await getCoordinatesFromAddress(drop);
                
                // If API fails, try fallback
                if (!c) {
                    console.log('API failed, trying fallback for drop:', drop);
                    c = getFallbackCoordinates(drop);
                }
                
                    if (c) {
                        d = [c.lat, c.lon];
                        console.log('Got drop coordinates:', d);
                    } else {
                        console.error('Failed to get drop coordinates');
                    }
                }
                
                return { p, d };
            }

        const { p, d } = await ensureCoords();
        console.log('Final coordinates - Pickup:', p, 'Drop:', d);
        
        if (!p || !d) {
            alert('Could not determine locations. Please try using more specific addresses.');
            return;
        }
        
        // Check if coordinates are valid (not 0,0)
        if (p[0] === 0 && p[1] === 0) {
            console.error('Pickup coordinates are 0,0 - invalid');
            alert('Invalid pickup location. Please try a different address.');
            return;
        }
        
        if (d[0] === 0 && d[1] === 0) {
            console.error('Drop coordinates are 0,0 - invalid');
            alert('Invalid destination location. Please try a different address.');
                return;
            }

            const route = await getDistanceTimeMetersSeconds(p, d);
        console.log('Route calculation result:', route);
        
            if (!route) {
                alert('Unable to calculate route. Please try again.');
                return;
            }

        console.log('Route details:', {
            meters: route.meters,
            seconds: route.seconds,
            pricePerKm: pricePerKm
        });

        const distanceKm = Math.round((route.meters / 1000) * 100) / 100;
            const timeMin = Math.round(route.seconds / 60);
        let totalPrice = Math.round(distanceKm * pricePerKm * 100) / 100;
            const estimatedTime = timeMin;
        
        // Ensure minimum price
        if (totalPrice === 0) {
            totalPrice = pricePerKm; // Minimum 1km price
            console.warn('Price was 0, setting minimum price:', totalPrice);
        }

        console.log('Calculated values:', {
            distanceKm: distanceKm,
            timeMin: timeMin,
            totalPrice: totalPrice,
            estimatedTime: estimatedTime
        });

        // Check if price is 0 and show warning
        if (totalPrice === 0) {
            console.warn('Price calculation resulted in 0!');
            console.warn('Distance:', distanceKm, 'km');
            console.warn('Price per km:', pricePerKm);
            console.warn('Route data:', route);
        }

            document.getElementById('pickupSummary').textContent = pickup;
            document.getElementById('dropSummary').textContent = drop;
            document.getElementById('totalPrice').textContent = `₹${totalPrice.toFixed(2)}`;
            document.getElementById('estimatedTime').textContent = `${estimatedTime} min`;

            rideDetails.classList.add('show');
            rideDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

    // Confirm button functionality
        confirmButton.addEventListener('click', function() {
            alert('🎉 Booking confirmed! Your driver will arrive shortly.');
        });

    // Autocomplete functionality
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

    // Initialize autocomplete
        const pickupAutocomplete = new Autocomplete('pickup', 'pickup-dropdown');
        const dropAutocomplete = new Autocomplete('drop', 'drop-dropdown');

    // Input event listeners for map updates
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
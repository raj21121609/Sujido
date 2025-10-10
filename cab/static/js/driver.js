// Toggle functionality
        const statusToggle = document.getElementById('statusToggle');
        const statusText = document.getElementById('statusText');
        const statusBanner = document.getElementById('statusBanner');
        const bannerText = document.getElementById('bannerText');
        const rideRequest = document.getElementById('rideRequest');

        statusToggle.addEventListener('change', function() {
            if (this.checked) {
                // Active state
                statusText.textContent = 'Active';
                statusBanner.classList.remove('offline');
                bannerText.textContent = '🟢 You\'re online and ready to accept rides';
                rideRequest.classList.remove('hidden');
            } else {
                // Offline state
                statusText.textContent = 'Offline';
                statusBanner.classList.add('offline');
                bannerText.textContent = '⚪ You\'re offline - Toggle to start accepting rides';
                rideRequest.classList.add('hidden');
            }
        });
    
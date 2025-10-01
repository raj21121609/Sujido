// OTP Input handling
    const otpInput = document.getElementById('otpInput');
    const charCount = document.getElementById('charCount');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendLink = document.getElementById('resendLink');
    const timerText = document.getElementById('timerText');
    const timer = document.getElementById('timer');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Character counter
    otpInput.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count;
      
      // Enable/disable verify button
      verifyBtn.disabled = count !== 4;
      
      // Clear error message when user starts typing
      if (errorMessage.style.display !== 'none') {
        errorMessage.style.display = 'none';
      }
    });

    // Auto-submit when 4 digits are entered
    otpInput.addEventListener('input', function() {
      if (this.value.length === 4) {
        // Small delay for better UX
        setTimeout(() => {
          document.getElementById('otpForm').submit();
        }, 500);
      }
    });

    // Resend OTP functionality
    let resendTimer = 30;
    let timerInterval;

    function startResendTimer() {
      resendLink.style.display = 'none';
      timerText.style.display = 'block';
      timer.textContent = resendTimer;
      
      timerInterval = setInterval(() => {
        resendTimer--;
        timer.textContent = resendTimer;
        
        if (resendTimer <= 0) {
          clearInterval(timerInterval);
          resendLink.style.display = 'inline';
          timerText.style.display = 'none';
          resendTimer = 30;
        }
      }, 1000);
    }

    // Start timer on page load
    startResendTimer();

    resendLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show loading state
      this.textContent = 'Sending...';
      this.style.pointerEvents = 'none';
      
      // Make AJAX request to resend OTP
      fetch('/otp/', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      })
      .then(response => {
        if (response.ok) {
          successMessage.textContent = 'New OTP sent successfully!';
          successMessage.style.display = 'block';
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 3000);
          
          // Clear input and restart timer
          otpInput.value = '';
          charCount.textContent = '0';
          verifyBtn.disabled = true;
          startResendTimer();
        } else {
          errorMessage.textContent = 'Failed to resend OTP. Please try again.';
          errorMessage.style.display = 'block';
        }
      })
      .catch(error => {
        errorMessage.textContent = 'Network error. Please check your connection.';
        errorMessage.style.display = 'block';
      })
      .finally(() => {
        this.textContent = 'Resend Code';
        this.style.pointerEvents = 'auto';
      });
    });

    // Form submission handling
    document.getElementById('otpForm').addEventListener('submit', function(e) {
      const otpValue = otpInput.value.trim();
      
      if (otpValue.length !== 4 || !/^\d{4}$/.test(otpValue)) {
        e.preventDefault();
        errorMessage.textContent = 'Please enter a valid 4-digit OTP.';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Show loading state
      verifyBtn.textContent = 'Verifying...';
      verifyBtn.disabled = true;
    });

    // Focus on input when page loads
    window.addEventListener('load', function() {
      otpInput.focus();
    });

    // Handle keyboard navigation
    otpInput.addEventListener('keydown', function(e) {
      // Allow only numbers
      if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });
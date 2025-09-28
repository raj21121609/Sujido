from django.shortcuts import redirect, render
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
import random
import smtplib
from email.mime.text import MIMEText
from .models import *

# Home view with signup and login handling
def home(request):
    if request.method == 'POST':
        if request.POST.get('sign') == 'f1':
            name = request.POST.get('name')
            email = request.POST.get('email')
            password = request.POST.get('password')

            request.session['email'] = email
            request.session['name'] = name
            request.session['password'] = password

            return render(request,'otp.html')

        elif request.POST.get('sign') == 'f2':
            username = request.POST.get('username')
            password = request.POST.get('password2')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, "Logged in successfully")
                return render(request, 'landing.html', {'userr': username})
            else:
                messages.error(request, "Unable to log in with provided credentials")

    return render(request, 'signup_login.html')


def landing(request):
    return render(request, 'landing.html')


def signout(request):
    logout(request)
    return redirect('/register')


def book(request):
    cost = 0
    distance = 0
    time = 0
    error_message = None

    if request.method == 'POST':
        pickup = request.POST.get('pickup', '').strip()
        drop = request.POST.get('drop', '').strip()
        vehicle = request.POST.get('vehicle', '')
        api_key = "5063a03469dc4e8ebc294cbe8ecf41ec"

        if not pickup or not drop or not vehicle:
            error_message = "Please fill in all fields and select a vehicle."
        else:
            try:
                params1 = {"text": pickup, "apiKey": api_key}
                params2 = {"text": drop, "apiKey": api_key}

                def get_coordinates(param):
                    url = 'https://api.geoapify.com/v1/geocode/search'
                    try:
                        response = requests.get(url, params=param, timeout=10)
                        if response.status_code == 200:
                            data = response.json()
                            if data.get('features') and len(data['features']) > 0:
                                lon = data['features'][0]['properties']['lon']
                                lat = data['features'][0]['properties']['lat']
                                return lat, lon, None
                            else:
                                return None, None, "Location not found. Please check the address."
                        else:
                            return None, None, f"Geocoding API error: {response.status_code}"
                    except requests.RequestException as e:
                        return None, None, f"Network error: {str(e)}"

                lat_pickup, lon_pickup, error1 = get_coordinates(params1)
                lat_drop, lon_drop, error2 = get_coordinates(params2)

                if error1:
                    error_message = f"Pickup location error: {error1}"
                elif error2:
                    error_message = f"Destination error: {error2}"
                else:
                    pickup_wp = [lat_pickup, lon_pickup]
                    drop_wp = [lat_drop, lon_drop]

                    def get_distance_time(pickup_wp, drop_wp):
                        url = 'https://api.geoapify.com/v1/routematrix'
                        headers = {'Content-Type': 'application/json'}
                        params = {"apiKey": api_key}
                        body = {
                            "mode": "drive",
                            "sources": [{"location": pickup_wp}],
                            "targets": [{"location": drop_wp}]
                        }
                        try:
                            response = requests.post(url, headers=headers, params=params, json=body, timeout=10)
                            if response.status_code == 200:
                                data = response.json()
                                if "distances" in data and "times" in data:
                                    distance_meters = data["distances"][0][0]
                                    time_seconds = data["times"][0][0]
                                    return distance_meters, time_seconds, None
                                else:
                                    return None, None, "Route calculation failed. Please try different locations."
                            else:
                                return None, None, f"Route API error: {response.status_code}"
                        except requests.RequestException as e:
                            return None, None, f"Network error: {str(e)}"

                    distance_meters, time_seconds, route_error = get_distance_time(pickup_wp, drop_wp)

                    if route_error:
                        error_message = route_error
                    else:
                        distance = round(distance_meters / 1000, 2)
                        time = round(time_seconds / 60, 1)

                        vehicle_pricing = {
                            'sujido-mini': 4.0,      # ₹4 per km
                            'sujido-plus': 5.0,      # ₹5 per km  
                            'sujido-premium': 6.0    # ₹6 per km
                        }

                        if vehicle in vehicle_pricing:
                            cost = round(distance * vehicle_pricing[vehicle], 2)
                        else:
                            error_message = "Invalid vehicle selection."

            except Exception as e:
                error_message = f"An unexpected error occurred: {str(e)}"

    return render(request, 'booking.html', {
       'cost': cost,
       'time': time,
       'distance': distance,
       'error_message': error_message
    })


@csrf_exempt
def autocomplete_address(request):
    if request.method == 'GET':
        query = request.GET.get('q', '').strip()
        api_key = "5063a03469dc4e8ebc294cbe8ecf41ec"

        if not query or len(query) < 2:
            return JsonResponse({'suggestions': []})

        try:
            url = 'https://api.geoapify.com/v1/geocode/autocomplete'
            params = {
                'text': query,
                'apiKey': api_key,
                'limit': 8,
                'filter': 'countrycode:in',
                'lang': 'en'
            }

            response = requests.get(url, params=params, timeout=5)

            if response.status_code == 200:
                data = response.json()
                suggestions = []

                if 'features' in data:
                    for feature in data['features']:
                        properties = feature.get('properties', {})
                        suggestion = {
                            'text': properties.get('formatted', ''),
                            'address': properties.get('address_line1', ''),
                            'city': properties.get('city', ''),
                            'state': properties.get('state', ''),
                            'country': properties.get('country', ''),
                            'lat': properties.get('lat', ''),
                            'lon': properties.get('lon', ''),
                            'postcode': properties.get('postcode', '')
                        }
                        suggestions.append(suggestion)

                return JsonResponse({'suggestions': suggestions})
            else:
                return JsonResponse({'error': 'API request failed'}, status=500)

        except requests.RequestException as e:
            return JsonResponse({'error': f'Network error: {str(e)}'}, status=500)
        except Exception as e:
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def generate_otp():
    return random.randint(1000, 9999)


def send_email_otp(name, email, otp):
    try:
        sender = "124raj2112@sjcem.edu.in"
        sender_password = "wrhgwdokogtikzjq"  # Secure properly in production

        body = f"""
Dear {name},

Thank you for signing up with us. To verify your email, please enter this One Time Password (OTP):

{otp}

This OTP is valid for 10 minutes.

Best regards,
Sujido cabs
"""
        msg = MIMEText(body, "plain")
        msg["Subject"] = "Your OTP Verification Code"
        msg["From"] = sender
        msg["To"] = email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, sender_password)
        server.sendmail(sender, email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def otp(request):
    if request.method == 'GET':
        name = request.session.get('name')
        email = request.session.get('email')
        if not name or not email:
            messages.error(request, "Session expired or invalid access.")
            return redirect('/register')

        otp_code = generate_otp()
        request.session['otp'] = str(otp_code)
        
        # Try to send email and handle failure
        email_sent = send_email_otp(name, email, otp_code)
        if not email_sent:
            messages.error(request, "Failed to send OTP email. Please check your email address and try again.")
            return redirect('/register')
            
        messages.success(request, f"OTP sent successfully to {email}")
        return render(request, 'otp.html')

    elif request.method == 'POST':
        user_otp = request.POST.get('otp')
        actual_otp = request.session.get('otp')

        if user_otp == actual_otp:
            name = request.session.get('name')
            email = request.session.get('email')
            password = request.session.get('password')
            if not (name and email and password):
                messages.error(request, "Session data missing. Please register again.")
                return redirect('/register')

            user = User.objects.create_user(username=name, email=email, password=password)
            user.save()
            messages.success(request, "User has been created successfully!")
            try:
                del request.session['otp']
            except KeyError:
                pass
            return redirect('/register')

        else:
            messages.error(request, "Invalid OTP entered. Please try again.")
            return render(request, 'otp.html')

def wallet(request):
    if request.user .is_authenticated:
        curr_user = request.user
        all_info = info.objects.filter(user=curr_user)
    return render(request,'wallet.html',{'w_info':all_info})
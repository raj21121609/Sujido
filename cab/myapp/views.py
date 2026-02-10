from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import requests
from .models import Info, WalletTransaction

User = get_user_model()

def welcome(request):
    if request.method == 'POST':
        role = request.POST.get('role')
        role_redirect = {'driver': 'driver_home', 'customer': 'costumer_home'}
        return redirect(role_redirect.get(role, 'costumer_home'))
    return render(request, 'welcome.html')


# CUSTOMER SIGNUP/LOGIN
def customer_view(request):
    if request.method == 'POST':
        if request.POST.get('sign') == 'f1':  # Signup form
            name = request.POST.get('name')
            email = request.POST.get('email')
            password = request.POST.get('password')
            role = 'customer'

            if not (name and email and password):
                messages.error(request, "Please provide name, email and password.")
                return render(request, 'signup_login.html', {'form_action': 'costumer_home'})

            if User.objects.filter(username=name).exists():
                messages.error(request, "Username already taken.")
                return render(request, 'signup_login.html', {'form_action': 'costumer_home'})

            try:
                user = User.objects.create_user(username=name, email=email, password=password, role=role)
                Info.objects.create(user=user, wallet_amount=0)
                messages.success(request, "Account created successfully.")
            except Exception as e:
                messages.error(request, f"Error: {str(e)}")

        elif request.POST.get('sign') == 'f2':  # Login form
            username = request.POST.get('username')
            password = request.POST.get('password2')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                if hasattr(user, 'role') and user.role == 'customer':
                    login(request, user)
                    messages.success(request, "Logged in successfully as Customer")
                    return redirect('landing')
                else:
                    messages.error(request, "This login is for customers only.")
            else:
                messages.error(request, "Invalid credentials")

    return render(request, 'signup_login.html', {'form_action': 'costumer_home'})


# DRIVER SIGNUP/LOGIN
def driver_view(request):
    if request.method == 'POST':
        if request.POST.get('sign') == 'f1':  # Signup
            name = request.POST.get('name')
            email = request.POST.get('email')
            password = request.POST.get('password')
            role = 'driver'

            if not (name and email and password):
                messages.error(request, "Please provide all details.")
                return render(request, 'signup_login.html', {'form_action': 'driver_home'})

            if User.objects.filter(username=name).exists():
                messages.error(request, "Username already taken.")
                return render(request, 'signup_login.html', {'form_action': 'driver_home'})

            try:
                user = User.objects.create_user(username=name, email=email, password=password, role=role)
                Info.objects.create(user=user, wallet_amount=0)
                messages.success(request, "Driver account created successfully.")
            except Exception as e:
                messages.error(request, f"Error: {str(e)}")

        elif request.POST.get('sign') == 'f2':  # Login
            username = request.POST.get('username')
            password = request.POST.get('password2')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                if hasattr(user, 'role') and user.role == 'driver':
                    login(request, user)
                    messages.success(request, "Logged in successfully as Driver")
                    return redirect('driver_interface')
                else:
                    messages.error(request, "This login is for drivers only.")
            else:
                messages.error(request, "Invalid credentials")

    return render(request, 'signup_login.html', {'form_action': 'driver_home'})


def landing(request):
    return render(request, 'landing.html')


def driver_interface(request):
    return render(request, 'driver.html')


def signout(request):
    logout(request)
    return redirect('/register')


import requests

def book(request):
    cost = 0
    distance = 0
    time = 0
    error_message = None

    vehicle_pricing = {
        'sujido-mini': 4.0,      # ₹4 per km
        'sujido-plus': 5.0,      # ₹5 per km
        'sujido-premium': 6.0    # ₹6 per km
    }

    if request.method == 'POST':
        pickup = request.POST.get('pickup', '').strip()
        drop = request.POST.get('drop', '').strip()
        vehicle = request.POST.get('vehicle', '')
        api_key = "7a5cf21bb0364e67b5c5ad9404234160"

        if not pickup or not drop or not vehicle:
            error_message = "Please fill in all fields and select a vehicle."
        else:
            try:
                # MapmyIndia Geocoding API
                def get_coordinates(address, api_key):
                    url = f'https://apis.mapmyindia.com/advancedmaps/v1/{api_key}/geo_code'
                    params = {'addr': address}
                    try:
                        resp = requests.get(url, params=params, timeout=10)
                        if resp.status_code == 200:
                            data = resp.json()
                            results = data.get('results', [])
                            if results:
                                lat = float(results[0]['lat'])
                                lon = float(results[0]['lng'])
                                return lat, lon, None
                            else:
                                return None, None, "Location not found. Please check the address."
                        else:
                            return None, None, f"Geocoding API error: {resp.status_code}"
                    except requests.RequestException as e:
                        return None, None, f"Network error: {str(e)}"

                lat_pickup, lon_pickup, error1 = get_coordinates(pickup, api_key)
                lat_drop, lon_drop, error2 = get_coordinates(drop, api_key)

                if error1:
                    error_message = f"Pickup location error: {error1}"
                elif error2:
                    error_message = f"Destination error: {error2}"
                else:
                    pickup_wp = [lat_pickup, lon_pickup]
                    drop_wp = [lat_drop, lon_drop]

                    # MapmyIndia Distance Matrix API
                    def get_distance_time(pickup_wp, drop_wp, api_key):
                        url = f'https://apis.mapmyindia.com/advancedmaps/v1/{api_key}/distance'
                        params = {
                            'center': f"{pickup_wp[0]},{pickup_wp[1]}",
                            'pts': f"{drop_wp[0]},{drop_wp[1]}",
                            'rtype': 0
                        }
                        try:
                            resp = requests.get(url, params=params, timeout=10)
                            if resp.status_code == 200:
                                data = resp.json()
                                results = data.get('results', [])
                                if results:
                                    distance_meters = float(results[0]['distance'])
                                    time_seconds = float(results[0]['duration'])
                                    return distance_meters, time_seconds, None
                                else:
                                    return None, None, "Route calculation failed. Please try different locations."
                            else:
                                return None, None, f"Route API error: {resp.status_code}"
                        except requests.RequestException as e:
                            return None, None, f"Network error: {str(e)}"

                    distance_meters, time_seconds, route_error = get_distance_time(pickup_wp, drop_wp, api_key)

                    if route_error:
                        error_message = route_error
                    else:
                        distance = round(distance_meters / 1000, 2)
                        time = round(time_seconds / 60, 1)
                        # Wallet amount calculation
                        if vehicle in vehicle_pricing:
                            cost = round(distance * vehicle_pricing.get(vehicle, 0), 2)
                            if request.user.is_authenticated:
                                current_user = request.user
                                amount, _ = Info.objects.get_or_create(user=current_user, defaults={'wallet_amount': 0})
                                int_cost = int(round(cost))
                                if amount.wallet_amount >= int_cost:
                                    amount.wallet_amount = amount.wallet_amount - int_cost
                                    amount.save()
                                    WalletTransaction.objects.create(
                                        user=current_user,
                                        amount=int_cost,
                                        type=WalletTransaction.DEBIT,
                                        description=f"Ride {pickup} to {drop}"
                                    )
                                else:
                                    error_message = "Insufficient wallet balance. Please add funds in your wallet."
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
        api_key = "7a5cf21bb0364e67b5c5ad9404234160"

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
                suggestions = [{
                    'text': f.get('properties', {}).get('formatted', ''),
                    'address': f.get('properties', {}).get('address_line1', ''),
                    'city': f.get('properties', {}).get('city', ''),
                    'state': f.get('properties', {}).get('state', ''),
                    'country': f.get('properties', {}).get('country', ''),
                    'lat': f.get('properties', {}).get('lat', ''),
                    'lon': f.get('properties', {}).get('lon', ''),
                    'postcode': f.get('properties', {}).get('postcode', '')
                } for f in data.get('features', [])]

                return JsonResponse({'suggestions': suggestions})
            else:
                return JsonResponse({'error': 'API request failed'}, status=500)

        except requests.RequestException as e:
            return JsonResponse({'error': f'Network error: {str(e)}'}, status=500)
        except Exception as e:
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def wallet(request):
    if request.user.is_authenticated:
        curr_user = request.user
        all_info = Info.objects.filter(user=curr_user)
        txs = WalletTransaction.objects.filter(user=curr_user).order_by('-created_at')
    return render(request,'wallet.html',{
        'w_info': all_info if request.user.is_authenticated else [],
        'txs': txs if request.user.is_authenticated else []
    })

@csrf_exempt
def wallet_add(request):
    if not request.user.is_authenticated:
        return redirect('landing')
    if request.method == 'POST':
        try:
            amt = int(request.POST.get('amount', '0'))
        except ValueError:
            amt = 0
        if amt <= 0:
            messages.error(request, 'Please enter a valid amount to add.')
            return redirect('wallet')
        info, _ = Info.objects.get_or_create(user=request.user, defaults={'wallet_amount': 0})
        info.wallet_amount += amt
        info.save()
        WalletTransaction.objects.create(
            user=request.user,
            amount=amt,
            type=WalletTransaction.CREDIT,
            description='Wallet top-up'
        )
        messages.success(request, f'₹{amt} added to your wallet.')
    return redirect('wallet')

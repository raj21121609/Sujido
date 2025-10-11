from django.urls import path
from . import views
urlpatterns = [
    path('register/costumer/',views.customer_view,name='costumer_home'),
    path('register/driver/',views.driver_view,name='driver_home'),
    path('landing/',views.landing,name='landing'),
    path('driver_interface/',views.driver_interface,name='driver_interface'),
    path('signOut/',views.signout,name = 'signout'),
    path('book/',views.book,name='book'),
    path('api/autocomplete/',views.autocomplete_address,name='autocomplete'),
    path('wallet/',views.wallet , name ='wallet'),
]

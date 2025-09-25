from django.urls import path
from . import views
urlpatterns = [
    path('register/',views.home,name='home'),
    path('landing/',views.landing,name='landimg'),
    path('signOut/',views.signout,name = 'signout'),
    path('book/',views.book,name='book'),
    path('api/autocomplete/',views.autocomplete_address,name='autocomplete'),
    path('otp/',views.otp , name = 'otp')
]

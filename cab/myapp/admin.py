from django.contrib import admin
from .models import CustomUser, Info

admin.site.register(CustomUser)
admin.site.register(Info)

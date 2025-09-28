from django.contrib import admin
from .models import info

# Register your models here.

admin.site.register(info)

# @admin.register
# class infoAdmin(admin.ModelAdmin):
#     list_display=['wallet_amount','user']
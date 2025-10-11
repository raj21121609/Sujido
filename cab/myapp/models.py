from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('driver', 'Driver'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

class Info(models.Model):
    wallet_amount = models.IntegerField(default=0)
    user = models.ForeignKey("myapp.CustomUser", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - ₹{self.wallet_amount}"


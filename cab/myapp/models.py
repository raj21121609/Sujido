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
    #distance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - ₹{self.wallet_amount}"

class WalletTransaction(models.Model):
    CREDIT = 'CREDIT'
    DEBIT = 'DEBIT'
    TYPE_CHOICES = (
        (CREDIT, 'Credit'),
        (DEBIT, 'Debit'),
    )

    user = models.ForeignKey("myapp.CustomUser", on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.IntegerField()
    type = models.CharField(max_length=6, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sign = '+' if self.type == self.CREDIT else '-'
        return f"{self.user.username} {sign}₹{self.amount} {self.description}"


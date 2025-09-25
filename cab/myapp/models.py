from django.db import models
from django.contrib.auth.models import User

class info(models.Model):
    wallet_amount = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

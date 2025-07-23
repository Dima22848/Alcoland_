import os
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import CustomUser


@receiver(pre_save, sender=CustomUser)
def delete_old_avatar(sender, instance, **kwargs):
    if instance.pk:  # Проверяем, что объект уже существует
        try:
            old_avatar = CustomUser.objects.get(pk=instance.pk).image
        except CustomUser.DoesNotExist:
            return

        if old_avatar and instance.image != old_avatar:
            if os.path.isfile(old_avatar.path):
                os.remove(old_avatar.path)

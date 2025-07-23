from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.contenttypes.models import ContentType
from django.utils.html import format_html

from .models import (
    Reviews, AlcoholType, Beer, Cognak, Vodka, Vine, Order, OrderItem, PurchaseHistory,
)

# ====================== INLINE МОДЕЛИ ====================== #


class ReviewInline(GenericTabularInline):
    model = Reviews
    extra = 1
    readonly_fields = ("created_at",)
    # Не нужно указывать ForeignKey напрямую


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price", "product_image")

    def product_image(self, obj):
        if hasattr(obj.product, "image") and obj.product.image:
            return format_html('<img src="{}" style="height:40px;"/>', obj.product.image.url)
        return ""
    product_image.short_description = "Изображение"


class OrderInline(admin.TabularInline):
    model = Order
    extra = 1
    readonly_fields = ("created_at",)


class PurchaseHistoryInline(GenericTabularInline):
    model = PurchaseHistory
    extra = 1
    readonly_fields = ("purchased_at",)

    # Фильтрация content_type в зависимости от типа продукта
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "content_type":
            kwargs["queryset"] = ContentType.objects.filter(model__in=[Beer, Cognak, Vodka, Vine])
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    # Убираем поле 'product' и работаем с content_type и object_id для правильного отображения
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('product')

# ====================== ОСНОВНЫЕ АДМИНКИ ====================== #
@admin.register(Reviews)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author", "text", "created_at")
    list_filter = ("created_at",)
    search_fields = ("author__username", "text")
    readonly_fields = ("created_at",)


@admin.register(AlcoholType)
class AlcoholTypeAdmin(admin.ModelAdmin):
    list_display = ("type",)
    search_fields = ("type",)


@admin.register(Beer)
class BeerAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "country", "style", "type", "color")
    list_filter = ("type", "color", "country")
    search_fields = ("name", "country", "style")
    inlines = [ReviewInline, PurchaseHistoryInline]


@admin.register(Cognak)
class CognakAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "country", "strength", "excerpt")
    list_filter = ("country", "strength", "excerpt")
    search_fields = ("name", "country", "excerpt")
    inlines = [ReviewInline, PurchaseHistoryInline]


@admin.register(Vodka)
class VodkaAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "country", "strength", "volume")
    list_filter = ("country", "strength")
    search_fields = ("name", "country")
    inlines = [ReviewInline, PurchaseHistoryInline]


@admin.register(Vine)
class VineAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "country", "color", "sugar_supply")
    list_filter = ("country", "color", "sugar_supply")
    search_fields = ("name", "country", "color")
    inlines = [ReviewInline, PurchaseHistoryInline]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "status", "get_items_summary")
    list_filter = ("created_at", "status")
    search_fields = ("user__username",)
    readonly_fields = ("created_at",)
    inlines = [OrderItemInline]

    def get_items_summary(self, obj):
        return ", ".join([f"{item.product} × {item.quantity}" for item in obj.items.all()])
    get_items_summary.short_description = "Товары в заказе"


@admin.register(PurchaseHistory)
class PurchaseHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "quantity", "price", "purchased_at")
    list_filter = ("purchased_at",)
    search_fields = ("user__username",)
    readonly_fields = ("purchased_at",)


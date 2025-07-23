from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

from account.models import CustomUser
from .models import Reviews, Beer, Cognak, Vodka, Vine, Order, OrderItem, PurchaseHistory

# Общая функция для подсчета отзывов
def get_reviews_count_for(obj):
    ct = ContentType.objects.get_for_model(obj.__class__)
    return Reviews.objects.filter(content_type=ct, object_id=obj.id).count()


class BeerSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)
    color_display = serializers.CharField(source="get_color_display", read_only=True)
    reviews_count = serializers.SerializerMethodField()
    field_verbose_names = serializers.SerializerMethodField()

    class Meta:
        model = Beer
        exclude = ("type", "color")

    def get_reviews_count(self, obj):
        return get_reviews_count_for(obj)

    def get_field_verbose_names(self, obj):
        verbose_names = {}
        # Основные поля
        for field in self.Meta.model._meta.fields:
            if field.name not in self.Meta.exclude:
                verbose_names[field.name] = field.verbose_name
        # Доп. display-поля (если они попадают в сериализацию)
        verbose_names["type_display"] = "Тип"
        verbose_names["color_display"] = "Цвет"
        return verbose_names


class CognakSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    field_verbose_names = serializers.SerializerMethodField()

    class Meta:
        model = Cognak
        fields = '__all__'

    def get_reviews_count(self, obj):
        return get_reviews_count_for(obj)

    def get_field_verbose_names(self, obj):
        verbose_names = {}
        for field in self.Meta.model._meta.fields:
            verbose_names[field.name] = field.verbose_name
        return verbose_names


class VodkaSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    field_verbose_names = serializers.SerializerMethodField()

    class Meta:
        model = Vodka
        fields = '__all__'

    def get_reviews_count(self, obj):
        return get_reviews_count_for(obj)

    def get_field_verbose_names(self, obj):
        verbose_names = {}
        for field in self.Meta.model._meta.fields:
            verbose_names[field.name] = field.verbose_name
        return verbose_names


class VineSerializer(serializers.ModelSerializer):
    color_display = serializers.CharField(source="get_color_display", read_only=True)
    sugar_supply_display = serializers.CharField(source="get_sugar_supply_display", read_only=True)
    reviews_count = serializers.SerializerMethodField()
    field_verbose_names = serializers.SerializerMethodField()

    class Meta:
        model = Vine
        exclude = ("color", "sugar_supply")

    def get_reviews_count(self, obj):
        return get_reviews_count_for(obj)

    def get_field_verbose_names(self, obj):
        verbose_names = {}
        for field in self.Meta.model._meta.fields:
            if field.name not in self.Meta.exclude:
                verbose_names[field.name] = field.verbose_name
        verbose_names["color_display"] = "Цвет"
        verbose_names["sugar_supply_display"] = "Содержание сахара"
        return verbose_names


class AuthorShortSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['nickname', 'avatar']

class AlcoholInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    price = serializers.FloatField()
    image = serializers.ImageField()
    type = serializers.CharField()

class ReviewsSerializer(serializers.ModelSerializer):
    author = AuthorShortSerializer(read_only=True)
    alcohol_info = serializers.SerializerMethodField()

    class Meta:
        model = Reviews
        fields = '__all__'

    def get_alcohol_info(self, obj):
        alc = obj.content_object
        if not alc:
            return None
        # Определяем тип для фронта
        model_name = alc._meta.model_name
        type_map = {
            "beer": "beer",
            "vine": "vino",
            "vodka": "vodka",
            "cognak": "cognak",
        }
        alc_type = type_map.get(model_name, "")
        # Получаем image с абсолютным url
        request = self.context.get("request", None)
        image_url = ""
        if hasattr(alc, "image") and alc.image:
            url = alc.image.url
            if request is not None:
                image_url = request.build_absolute_uri(url)
            else:
                image_url = url
        return {
            "id": alc.id,
            "name": getattr(alc, "name", ""),
            "price": getattr(alc, "price", ""),
            "image": image_url,
            'slug': getattr(alc, "slug", None),  # <--- добавил!
            'type': getattr(alc, "get_type_name", lambda: None)()
        }

class AlcoholShortSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    price = serializers.FloatField()
    image = serializers.ImageField()
    slug = serializers.CharField()
    type = serializers.CharField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return ""


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "content_type",
            "object_id",
            "product_name",
            "product_image",
            "product_price",
            "quantity",
            "price"
        ]

    def get_product_name(self, obj):
        return str(obj.product)  # у твоих моделей __str__ возвращает имя

    def get_product_image(self, obj):
        if hasattr(obj.product, "image") and obj.product.image:
            return obj.product.image.url
        return None

    def get_product_price(self, obj):
        if hasattr(obj.product, "price"):
            return float(obj.product.price)
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "created_at",
            "status",
            "items"
        ]


# --- Сериализатор для создания заказа ---
class CreateOrderItemSerializer(serializers.Serializer):
    content_type = serializers.IntegerField()
    object_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=8, decimal_places=2)

class CreateOrderSerializer(serializers.Serializer):
    items = CreateOrderItemSerializer(many=True)

    def create(self, validated_data):
        user = self.context['request'].user if self.context.get('request') else None
        order = Order.objects.create(user=user)
        items = validated_data['items']
        for item in items:
            OrderItem.objects.create(
                order=order,
                content_type_id=item['content_type'],
                object_id=item['object_id'],
                quantity=item['quantity'],
                price=item['price']
            )
        return order

    def to_representation(self, instance):
        # Для ответа после создания — возвращаем подробный заказ с товарами
        return OrderSerializer(instance, context=self.context).data


class PurchaseHistorySerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField()
    content_type = serializers.PrimaryKeyRelatedField(queryset=ContentType.objects.all())

    class Meta:
        model = PurchaseHistory
        fields = '__all__'








# class OrderItemSerializer(serializers.ModelSerializer):
#     # Получаем данные о товаре (название, цена, картинка) через content_type/object_id
#     alcohol = serializers.SerializerMethodField()
#
#     class Meta:
#         model = OrderItem
#         fields = ['id', 'content_type', 'object_id', 'product', 'quantity', 'price', 'alcohol']
#
#     def get_alcohol(self, obj):
#         product = obj.content_type.get_object_for_this_type(id=obj.object_id)
#         return AlcoholShortSerializer(product, context=self.context).data
#
# # --- Сериализатор заказа ---
# class OrderSerializer(serializers.ModelSerializer):
#     items = OrderItemSerializer(many=True, read_only=True)
#     class Meta:
#         model = Order
#         fields = ['id', 'user', 'created_at', 'status', 'items']
#         read_only_fields = ['id', 'created_at', 'status', 'user', 'items']
#














# class ReviewsSerializer(serializers.ModelSerializer):
#     author = serializers.StringRelatedField(read_only=True)
#     content_type = serializers.PrimaryKeyRelatedField(queryset=ContentType.objects.all())
#
#     class Meta:
#         model = Reviews
#         fields = '__all__'
#         read_only_fields = ('author',)
#
#     def get_author(self, obj):
#         # Возвращаем nickname и avatar (если у CustomUser есть image/avatar поле)
#         return {
#             "nickname": obj.author.nickname,
#             "avatar": obj.author.image.url if obj.author.image else None,
#         }
#

# class BasketSerializer(serializers.ModelSerializer):
#     product = serializers.StringRelatedField()
#     content_type = serializers.PrimaryKeyRelatedField(queryset=ContentType.objects.all())
#     user = serializers.PrimaryKeyRelatedField(read_only=True)
#
#     class Meta:
#         model = Basket
#         fields = '__all__'
#

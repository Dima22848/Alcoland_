from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Beer, Cognak, Vodka, Vine, Reviews, Order, OrderItem, PurchaseHistory
from .serializers import BeerSerializer,VineSerializer, VodkaSerializer, CognakSerializer, ReviewsSerializer, OrderSerializer, CreateOrderSerializer, PurchaseHistorySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

class AlcoholViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        alcohol_type = self.request.query_params.get('type', None)
        if alcohol_type == 'beer':
            return Beer.objects.all()
        elif alcohol_type == 'cognak':
            return Cognak.objects.all()
        elif alcohol_type == 'vodka':
            return Vodka.objects.all()
        elif alcohol_type == 'vino':
            return Vine.objects.all()
        return Beer.objects.all()  # По умолчанию

    def get_serializer_class(self):
        alcohol_type = self.request.query_params.get('type', None)
        if alcohol_type == 'beer':
            return BeerSerializer
        elif alcohol_type == 'cognak':
            return CognakSerializer
        elif alcohol_type == 'vodka':
            return VodkaSerializer
        elif alcohol_type == 'vino':
            return VineSerializer
        return BeerSerializer  # По умолчанию


class ReviewsViewSet(viewsets.ModelViewSet):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [AllowAny]
    # permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')

        queryset = super().get_queryset()

        if content_type and object_id:
            return queryset.filter(content_type_id=content_type, object_id=object_id)

        return queryset

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        """Получить все отзывы текущего пользователя"""
        reviews = self.get_queryset().filter(author=request.user)
        serializer = self.get_serializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)


class OrderPagination(PageNumberPagination):
    page_size = 6  # по умолчанию 6 заказа на страницу
    page_size_query_param = 'page_size'
    max_page_size = 20

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = OrderPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        # Только свои заказы!
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Оформление заказа — принимает массив товаров (content_type, object_id, quantity, price).
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()  # CreateOrderSerializer.create() всё сделает!
        read_serializer = OrderSerializer(order, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my(self, request):
        """Получить все свои заказы"""
        orders = self.get_queryset()
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)


class PurchaseHistoryViewSet(viewsets.ModelViewSet):
    queryset = PurchaseHistory.objects.all()
    serializer_class = PurchaseHistorySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def get_purchase_history(self, request):
        """Получить историю покупок пользователя"""
        history = self.queryset.filter(user=request.user)
        serializer = self.get_serializer(history, many=True)
        return Response(serializer.data)













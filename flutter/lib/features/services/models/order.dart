class OrderItem {
  final String id;
  final String orderId;
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        id: json['id'] as String,
        orderId: json['order_id'] as String,
        productId: json['product_id'] as String,
        productName: json['product_name'] as String,
        quantity: json['quantity'] as int,
        unitPrice: (json['unit_price'] as num).toDouble(),
        totalPrice: (json['total_price'] as num).toDouble(),
      );
}

class Order {
  final String id;
  final String userId;
  final String status;
  final double totalAmount;
  final String currency;
  final String? paymentMethod;
  final String? paymentRef;
  final String? notes;
  final DateTime createdAt;
  final DateTime? paidAt;
  final List<OrderItem> items;

  const Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.totalAmount,
    required this.currency,
    this.paymentMethod,
    this.paymentRef,
    this.notes,
    required this.createdAt,
    this.paidAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        status: json['status'] as String,
        totalAmount: (json['total_amount'] as num).toDouble(),
        currency: json['currency'] as String? ?? 'MNT',
        paymentMethod: json['payment_method'] as String?,
        paymentRef: json['payment_ref'] as String?,
        notes: json['notes'] as String?,
        createdAt: DateTime.parse(json['created_at'] as String),
        paidAt: json['paid_at'] != null
            ? DateTime.parse(json['paid_at'] as String)
            : null,
        items: (json['order_items'] as List<dynamic>?)
                ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

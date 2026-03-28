import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/features/services/models/product.dart';
import 'package:event_app/features/services/models/order.dart';
import 'package:event_app/features/services/models/wallet.dart';
import 'package:event_app/features/services/models/transport_booking.dart';
import 'package:event_app/features/services/models/restaurant.dart';
import 'package:event_app/features/services/models/hotel.dart';
import 'package:event_app/features/services/models/lost_found.dart';

class ServicesRepository {
  final SupabaseClient _client;

  ServicesRepository(this._client);

  String get _userId => _client.auth.currentUser!.id;

  // ── Products ──────────────────────────────────────────────────────────────

  Future<List<Product>> fetchProducts({ProductCategory? category}) async {
    var query = _client
        .from('products')
        .select()
        .eq('is_active', true);

    if (category != null && category != ProductCategory.other) {
      query = query.eq('category', category.name);
    }

    final data = await query.order('name');
    return (data as List).map((e) => Product.fromJson(e)).toList();
  }

  // ── Wallet ────────────────────────────────────────────────────────────────

  Future<Wallet?> fetchWallet() async {
    final data = await _client
        .from('wallets')
        .select()
        .eq('user_id', _userId)
        .maybeSingle();
    return data != null ? Wallet.fromJson(data) : null;
  }

  Future<List<WalletTransaction>> fetchWalletTransactions() async {
    final data = await _client
        .from('wallet_transactions')
        .select()
        .eq('user_id', _userId)
        .order('created_at', ascending: false);
    return (data as List).map((e) => WalletTransaction.fromJson(e)).toList();
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  Future<List<Order>> fetchMyOrders() async {
    final data = await _client
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', _userId)
        .order('created_at', ascending: false);
    return (data as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> createOrder(
    List<Map<String, dynamic>> items,
    String paymentMethod,
  ) async {
    final total = items.fold<double>(
      0,
      (sum, e) => sum + (e['unit_price'] as double) * (e['quantity'] as int),
    );

    final order = await _client.from('orders').insert({
      'user_id': _userId,
      'status': 'pending',
      'total_amount': total,
      'currency': 'MNT',
      'payment_method': paymentMethod,
    }).select().single();

    final orderId = order['id'] as String;
    final orderItems = items
        .map((e) => {
              'order_id': orderId,
              'product_id': e['product_id'],
              'product_name': e['product_name'],
              'quantity': e['quantity'],
              'unit_price': e['unit_price'],
              'total_price': (e['unit_price'] as double) * (e['quantity'] as int),
            })
        .toList();

    await _client.from('order_items').insert(orderItems);
    return Order.fromJson({...order, 'order_items': orderItems});
  }

  // ── Restaurants ───────────────────────────────────────────────────────────

  Future<List<Restaurant>> fetchRestaurants() async {
    final data = await _client
        .from('restaurants')
        .select()
        .eq('is_active', true)
        .order('name');
    return (data as List).map((e) => Restaurant.fromJson(e)).toList();
  }

  Future<void> createRestaurantBooking(Map<String, dynamic> input) async {
    await _client.from('restaurant_bookings').insert({
      ...input,
      'user_id': _userId,
    });
  }

  Future<List<RestaurantBooking>> fetchMyRestaurantBookings() async {
    final data = await _client
        .from('restaurant_bookings')
        .select()
        .eq('user_id', _userId)
        .order('booking_time', ascending: false);
    return (data as List).map((e) => RestaurantBooking.fromJson(e)).toList();
  }

  // ── Transport ─────────────────────────────────────────────────────────────

  Future<void> createTransportBooking(Map<String, dynamic> input) async {
    await _client.from('transport_bookings').insert({
      ...input,
      'user_id': _userId,
    });
  }

  Future<List<TransportBooking>> fetchMyTransportBookings() async {
    final data = await _client
        .from('transport_bookings')
        .select()
        .eq('user_id', _userId)
        .order('pickup_time', ascending: false);
    return (data as List).map((e) => TransportBooking.fromJson(e)).toList();
  }

  // ── Hotels ────────────────────────────────────────────────────────────────

  Future<List<Hotel>> fetchHotels() async {
    final data = await _client
        .from('hotels')
        .select()
        .eq('is_active', true)
        .order('name');
    return (data as List).map((e) => Hotel.fromJson(e)).toList();
  }

  // ── Lost & Found ──────────────────────────────────────────────────────────

  Future<void> reportLostFound(Map<String, dynamic> input) async {
    await _client.from('lost_found_items').insert({
      ...input,
      'reporter_id': _userId,
    });
  }

  Future<List<LostFoundItem>> fetchMyLostFound() async {
    final data = await _client
        .from('lost_found_items')
        .select()
        .eq('reporter_id', _userId)
        .order('created_at', ascending: false);
    return (data as List).map((e) => LostFoundItem.fromJson(e)).toList();
  }

  // ── QPay Invoice ─────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> createQPayInvoice(double amount) async {
    final data = await _client.from('qpay_invoices').insert({
      'user_id': _userId,
      'amount': amount,
      'status': 'pending',
    }).select().single();
    return data;
  }

  Future<Map<String, dynamic>?> checkQPayInvoice(String invoiceId) async {
    final data = await _client
        .from('qpay_invoices')
        .select()
        .eq('id', invoiceId)
        .maybeSingle();
    return data;
  }
}

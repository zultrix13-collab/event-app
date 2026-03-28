import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/features/services/models/product.dart';
import 'package:event_app/features/services/models/order.dart';
import 'package:event_app/features/services/models/wallet.dart';
import 'package:event_app/features/services/models/restaurant.dart';
import 'package:event_app/features/services/models/hotel.dart';
import 'package:event_app/features/services/models/lost_found.dart';
import 'package:event_app/features/services/models/transport_booking.dart';
import 'package:event_app/features/services/repositories/services_repository.dart';

// ── Repository ─────────────────────────────────────────────────────────────

final servicesRepositoryProvider = Provider<ServicesRepository>((ref) {
  return ServicesRepository(Supabase.instance.client);
});

// ── Category filter ────────────────────────────────────────────────────────

final selectedCategoryProvider =
    StateProvider<ProductCategory?>((ref) => null);

// ── Products ───────────────────────────────────────────────────────────────

final productsProvider = FutureProvider.autoDispose<List<Product>>((ref) {
  final repo = ref.watch(servicesRepositoryProvider);
  final category = ref.watch(selectedCategoryProvider);
  return repo.fetchProducts(category: category);
});

// ── Wallet ─────────────────────────────────────────────────────────────────

final walletProvider = FutureProvider.autoDispose<Wallet?>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchWallet();
});

final walletTransactionsProvider =
    FutureProvider.autoDispose<List<WalletTransaction>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchWalletTransactions();
});

// ── Orders ─────────────────────────────────────────────────────────────────

final myOrdersProvider = FutureProvider.autoDispose<List<Order>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchMyOrders();
});

// ── Restaurants ────────────────────────────────────────────────────────────

final restaurantsProvider =
    FutureProvider.autoDispose<List<Restaurant>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchRestaurants();
});

final myRestaurantBookingsProvider =
    FutureProvider.autoDispose<List<RestaurantBooking>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchMyRestaurantBookings();
});

// ── Transport ──────────────────────────────────────────────────────────────

final myTransportBookingsProvider =
    FutureProvider.autoDispose<List<TransportBooking>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchMyTransportBookings();
});

// ── Hotels ─────────────────────────────────────────────────────────────────

final hotelsProvider = FutureProvider.autoDispose<List<Hotel>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchHotels();
});

// ── Lost & Found ───────────────────────────────────────────────────────────

final myLostFoundProvider =
    FutureProvider.autoDispose<List<LostFoundItem>>((ref) {
  return ref.watch(servicesRepositoryProvider).fetchMyLostFound();
});

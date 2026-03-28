class Wallet {
  final String id;
  final String userId;
  final double balance;
  final String currency;
  final DateTime updatedAt;

  const Wallet({
    required this.id,
    required this.userId,
    required this.balance,
    required this.currency,
    required this.updatedAt,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) => Wallet(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        balance: (json['balance'] as num).toDouble(),
        currency: json['currency'] as String? ?? 'MNT',
        updatedAt: DateTime.parse(json['updated_at'] as String),
      );
}

class WalletTransaction {
  final String id;
  final String walletId;
  final String userId;
  final String type; // topup, payment, refund
  final double amount;
  final double balanceBefore;
  final double balanceAfter;
  final String? description;
  final DateTime createdAt;

  const WalletTransaction({
    required this.id,
    required this.walletId,
    required this.userId,
    required this.type,
    required this.amount,
    required this.balanceBefore,
    required this.balanceAfter,
    this.description,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) =>
      WalletTransaction(
        id: json['id'] as String,
        walletId: json['wallet_id'] as String,
        userId: json['user_id'] as String,
        type: json['type'] as String,
        amount: (json['amount'] as num).toDouble(),
        balanceBefore: (json['balance_before'] as num).toDouble(),
        balanceAfter: (json['balance_after'] as num).toDouble(),
        description: json['description'] as String?,
        createdAt: DateTime.parse(json['created_at'] as String),
      );
}

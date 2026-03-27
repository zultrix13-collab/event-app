class Plan {
  const Plan({
    required this.id,
    required this.name,
    required this.priceMonthly,
    required this.limits,
  });

  final String id;
  final String name;
  final double priceMonthly;
  final Map<String, dynamic> limits;

  factory Plan.fromJson(Map<String, dynamic> json) {
    return Plan(
      id: json['id'] as String,
      name: json['name'] as String,
      priceMonthly: (json['price_monthly'] as num).toDouble(),
      limits: (json['limits'] as Map<String, dynamic>?) ?? {},
    );
  }
}

enum SubscriptionStatus { active, trialing, pastDue, canceled, unknown }

SubscriptionStatus _parseStatus(String? s) {
  switch (s) {
    case 'active':
      return SubscriptionStatus.active;
    case 'trialing':
      return SubscriptionStatus.trialing;
    case 'past_due':
      return SubscriptionStatus.pastDue;
    case 'canceled':
      return SubscriptionStatus.canceled;
    default:
      return SubscriptionStatus.unknown;
  }
}

class Subscription {
  const Subscription({
    required this.id,
    required this.orgId,
    required this.status,
    required this.plan,
    this.currentPeriodEnd,
  });

  final String id;
  final String orgId;
  final SubscriptionStatus status;
  final Plan plan;
  final DateTime? currentPeriodEnd;

  bool get isActive =>
      status == SubscriptionStatus.active ||
      status == SubscriptionStatus.trialing;

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      orgId: json['org_id'] as String,
      status: _parseStatus(json['status'] as String?),
      plan: Plan.fromJson(json['plans'] as Map<String, dynamic>),
      currentPeriodEnd: json['current_period_end'] != null
          ? DateTime.parse(json['current_period_end'] as String)
          : null,
    );
  }
}

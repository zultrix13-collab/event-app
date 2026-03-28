// lib/features/green/screens/green_screen.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/green/widgets/badges_tab.dart';
import 'package:event_app/features/green/widgets/leaderboard_tab.dart';
import 'package:event_app/features/green/widgets/steps_tab.dart';

class GreenScreen extends StatefulWidget {
  const GreenScreen({super.key});

  @override
  State<GreenScreen> createState() => _GreenScreenState();
}

class _GreenScreenState extends State<GreenScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ногоон'),
        leading: BackButton(onPressed: () => context.go('/home')),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Алхам'),
            Tab(text: 'Badge'),
            Tab(text: 'Рейтинг'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          StepsTab(),
          BadgesTab(),
          LeaderboardTab(),
        ],
      ),
    );
  }
}

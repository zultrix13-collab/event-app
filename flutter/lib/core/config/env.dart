import 'package:envied/envied.dart';

part 'env.g.dart';

@Envied(path: '../.env.local')
abstract class Env {
  @EnviedField(varName: 'NEXT_PUBLIC_SUPABASE_URL')
  static const String supabaseUrl = _Env.supabaseUrl;

  @EnviedField(varName: 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  static const String supabaseAnonKey = _Env.supabaseAnonKey;
}

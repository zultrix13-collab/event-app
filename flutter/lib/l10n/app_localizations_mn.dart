// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Mongolian (`mn`).
class AppLocalizationsMn extends AppLocalizations {
  AppLocalizationsMn([String locale = 'mn']) : super(locale);

  @override
  String get appTitle => 'Арга хэмжаа';

  @override
  String get home => 'Нүүр';

  @override
  String get programme => 'Хөтөлбөр';

  @override
  String get map => 'Газрын зураг';

  @override
  String get services => 'Үйлчилгээ';

  @override
  String get profile => 'Профайл';

  @override
  String get notifications => 'Мэдэгдэл';

  @override
  String get chat => 'AI Туслах';

  @override
  String get green => 'Ногоон';

  @override
  String get signOut => 'Гарах';

  @override
  String get loading => 'Ачааллаж байна...';

  @override
  String get error => 'Алдаа гарлаа';

  @override
  String get retry => 'Дахин оролдох';

  @override
  String get save => 'Хадгалах';

  @override
  String get cancel => 'Цуцлах';

  @override
  String get confirm => 'Баталгаажуулах';

  @override
  String get submit => 'Илгээх';

  @override
  String get search => 'Хайх';

  @override
  String get noData => 'Мэдээлэл байхгүй';

  @override
  String get registerSeat => 'Суудал захиалах';

  @override
  String get cancelRegistration => 'Цуцлах';

  @override
  String get addToAgenda => 'Хөтөлбөрт нэмэх';

  @override
  String get removeFromAgenda => 'Хасах';

  @override
  String get checkin => 'Бүртгэх';

  @override
  String get wallet => 'Хэтэвч';

  @override
  String get balance => 'Үлдэгдэл';

  @override
  String get topup => 'Цэнэглэх';

  @override
  String get order => 'Захиалах';

  @override
  String get cart => 'Сагс';

  @override
  String get steps => 'Алхам';

  @override
  String get badges => 'Медал';

  @override
  String get leaderboard => 'Рейтинг';

  @override
  String get settings => 'Тохиргоо';

  @override
  String get language => 'Хэл';

  @override
  String get theme => 'Загвар';

  @override
  String get darkMode => 'Харанхуй горим';

  @override
  String get version => 'Хувилбар';

  @override
  String get today => 'Өнөөдөр';

  @override
  String get upcoming => 'Удахгүй';

  @override
  String get comingSoon => 'Удахгүй нээгдэнэ';

  @override
  String get loginAppName => 'АРГА ХЭМЖАА';

  @override
  String get loginTagline => 'Дижитал үнэмлэх';

  @override
  String get loginTitle => 'Нэвтрэх';

  @override
  String get loginSubtitle => 'Email хаягаараа нэвтэрнэ үү';

  @override
  String get emailLabel => 'Email хаяг';

  @override
  String get emailHint => 'name@example.com';

  @override
  String get emailRequired => 'Email оруулна уу';

  @override
  String get emailInvalid => 'Зөв email оруулна уу';

  @override
  String get sendOtp => 'OTP илгээх';

  @override
  String get resendOtp => 'Дахин илгээх';

  @override
  String resendOtpCooldown(int seconds) {
    return 'Дахин илгээх ($secondsс)';
  }

  @override
  String get orDivider => 'эсвэл';

  @override
  String get signInWithGoogle => 'Google-ээр нэвтрэх';

  @override
  String get verifyTitle => 'Код оруулах';

  @override
  String get verifySubtitle => '8 оронтой OTP кодыг оруулна уу';

  @override
  String get verifyButton => 'Баталгаажуулах';

  @override
  String get verifyBack => 'Буцах';

  @override
  String get otpSentAgain => 'OTP дахин илгээлээ';

  @override
  String get pendingApprovalTitle => 'Хүлээгдэж байна';

  @override
  String get pendingApprovalMessage =>
      'Та бүртгэлийн хүсэлт илгээсэн байна. Администратор шалгаж баталгаажуулна.';

  @override
  String get pendingApprovalNote =>
      'Баталгаажсаны дараа та нэвтрэх боломжтой болно.';

  @override
  String get welcomeGreeting => 'Сайн байна уу 👋';

  @override
  String get quickAccess => 'Товч хандах';

  @override
  String get nextSession => 'Дараагийн хичээл';

  @override
  String get eventCountdown => 'Арга хэмжаа хүртэл';

  @override
  String get countdownDays => 'өдөр';

  @override
  String get countdownHours => 'цаг';

  @override
  String get countdownMins => 'мин';

  @override
  String get openingCeremony => 'Нээлтийн ёслол';

  @override
  String get navHome => 'Нүүр';

  @override
  String get navProgramme => 'Хөтөлбөр';

  @override
  String get navMap => 'Газрын зураг';

  @override
  String get navServices => 'Үйлчилгээ';

  @override
  String get navProfile => 'Профайл';

  @override
  String get profileSettings => 'Тохиргоо';

  @override
  String get profileNotifications => 'Мэдэгдлүүд';

  @override
  String get profileLanguage => 'Хэл солих';

  @override
  String get profileSignOut => 'Гарах';

  @override
  String get profileSessions => 'Хичээл';

  @override
  String get profileBadges => 'Медал';

  @override
  String get profileSteps => 'Алхам';

  @override
  String get roleSuperAdmin => 'Супер Админ';

  @override
  String get roleSpecialist => 'Мэргэжилтэн';

  @override
  String get roleVip => 'VIP';

  @override
  String get roleParticipant => 'Оролцогч';

  @override
  String get languageMongolian => 'Монгол';

  @override
  String get languageEnglish => 'English';

  @override
  String get selectLanguage => 'Хэл сонгох';
}

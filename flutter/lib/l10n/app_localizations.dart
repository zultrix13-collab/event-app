import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_mn.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('mn')
  ];

  /// No description provided for @appTitle.
  ///
  /// In mn, this message translates to:
  /// **'Арга хэмжаа'**
  String get appTitle;

  /// No description provided for @home.
  ///
  /// In mn, this message translates to:
  /// **'Нүүр'**
  String get home;

  /// No description provided for @programme.
  ///
  /// In mn, this message translates to:
  /// **'Хөтөлбөр'**
  String get programme;

  /// No description provided for @map.
  ///
  /// In mn, this message translates to:
  /// **'Газрын зураг'**
  String get map;

  /// No description provided for @services.
  ///
  /// In mn, this message translates to:
  /// **'Үйлчилгээ'**
  String get services;

  /// No description provided for @profile.
  ///
  /// In mn, this message translates to:
  /// **'Профайл'**
  String get profile;

  /// No description provided for @notifications.
  ///
  /// In mn, this message translates to:
  /// **'Мэдэгдэл'**
  String get notifications;

  /// No description provided for @chat.
  ///
  /// In mn, this message translates to:
  /// **'AI Туслах'**
  String get chat;

  /// No description provided for @green.
  ///
  /// In mn, this message translates to:
  /// **'Ногоон'**
  String get green;

  /// No description provided for @signOut.
  ///
  /// In mn, this message translates to:
  /// **'Гарах'**
  String get signOut;

  /// No description provided for @loading.
  ///
  /// In mn, this message translates to:
  /// **'Ачааллаж байна...'**
  String get loading;

  /// No description provided for @error.
  ///
  /// In mn, this message translates to:
  /// **'Алдаа гарлаа'**
  String get error;

  /// No description provided for @retry.
  ///
  /// In mn, this message translates to:
  /// **'Дахин оролдох'**
  String get retry;

  /// No description provided for @save.
  ///
  /// In mn, this message translates to:
  /// **'Хадгалах'**
  String get save;

  /// No description provided for @cancel.
  ///
  /// In mn, this message translates to:
  /// **'Цуцлах'**
  String get cancel;

  /// No description provided for @confirm.
  ///
  /// In mn, this message translates to:
  /// **'Баталгаажуулах'**
  String get confirm;

  /// No description provided for @submit.
  ///
  /// In mn, this message translates to:
  /// **'Илгээх'**
  String get submit;

  /// No description provided for @search.
  ///
  /// In mn, this message translates to:
  /// **'Хайх'**
  String get search;

  /// No description provided for @noData.
  ///
  /// In mn, this message translates to:
  /// **'Мэдээлэл байхгүй'**
  String get noData;

  /// No description provided for @registerSeat.
  ///
  /// In mn, this message translates to:
  /// **'Суудал захиалах'**
  String get registerSeat;

  /// No description provided for @cancelRegistration.
  ///
  /// In mn, this message translates to:
  /// **'Цуцлах'**
  String get cancelRegistration;

  /// No description provided for @addToAgenda.
  ///
  /// In mn, this message translates to:
  /// **'Хөтөлбөрт нэмэх'**
  String get addToAgenda;

  /// No description provided for @removeFromAgenda.
  ///
  /// In mn, this message translates to:
  /// **'Хасах'**
  String get removeFromAgenda;

  /// No description provided for @checkin.
  ///
  /// In mn, this message translates to:
  /// **'Бүртгэх'**
  String get checkin;

  /// No description provided for @wallet.
  ///
  /// In mn, this message translates to:
  /// **'Хэтэвч'**
  String get wallet;

  /// No description provided for @balance.
  ///
  /// In mn, this message translates to:
  /// **'Үлдэгдэл'**
  String get balance;

  /// No description provided for @topup.
  ///
  /// In mn, this message translates to:
  /// **'Цэнэглэх'**
  String get topup;

  /// No description provided for @order.
  ///
  /// In mn, this message translates to:
  /// **'Захиалах'**
  String get order;

  /// No description provided for @cart.
  ///
  /// In mn, this message translates to:
  /// **'Сагс'**
  String get cart;

  /// No description provided for @steps.
  ///
  /// In mn, this message translates to:
  /// **'Алхам'**
  String get steps;

  /// No description provided for @badges.
  ///
  /// In mn, this message translates to:
  /// **'Медал'**
  String get badges;

  /// No description provided for @leaderboard.
  ///
  /// In mn, this message translates to:
  /// **'Рейтинг'**
  String get leaderboard;

  /// No description provided for @settings.
  ///
  /// In mn, this message translates to:
  /// **'Тохиргоо'**
  String get settings;

  /// No description provided for @language.
  ///
  /// In mn, this message translates to:
  /// **'Хэл'**
  String get language;

  /// No description provided for @theme.
  ///
  /// In mn, this message translates to:
  /// **'Загвар'**
  String get theme;

  /// No description provided for @darkMode.
  ///
  /// In mn, this message translates to:
  /// **'Харанхуй горим'**
  String get darkMode;

  /// No description provided for @version.
  ///
  /// In mn, this message translates to:
  /// **'Хувилбар'**
  String get version;

  /// No description provided for @today.
  ///
  /// In mn, this message translates to:
  /// **'Өнөөдөр'**
  String get today;

  /// No description provided for @upcoming.
  ///
  /// In mn, this message translates to:
  /// **'Удахгүй'**
  String get upcoming;

  /// No description provided for @comingSoon.
  ///
  /// In mn, this message translates to:
  /// **'Удахгүй нээгдэнэ'**
  String get comingSoon;

  /// No description provided for @loginAppName.
  ///
  /// In mn, this message translates to:
  /// **'АРГА ХЭМЖАА'**
  String get loginAppName;

  /// No description provided for @loginTagline.
  ///
  /// In mn, this message translates to:
  /// **'Дижитал үнэмлэх'**
  String get loginTagline;

  /// No description provided for @loginTitle.
  ///
  /// In mn, this message translates to:
  /// **'Нэвтрэх'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In mn, this message translates to:
  /// **'Email хаягаараа нэвтэрнэ үү'**
  String get loginSubtitle;

  /// No description provided for @emailLabel.
  ///
  /// In mn, this message translates to:
  /// **'Email хаяг'**
  String get emailLabel;

  /// No description provided for @emailHint.
  ///
  /// In mn, this message translates to:
  /// **'name@example.com'**
  String get emailHint;

  /// No description provided for @emailRequired.
  ///
  /// In mn, this message translates to:
  /// **'Email оруулна уу'**
  String get emailRequired;

  /// No description provided for @emailInvalid.
  ///
  /// In mn, this message translates to:
  /// **'Зөв email оруулна уу'**
  String get emailInvalid;

  /// No description provided for @sendOtp.
  ///
  /// In mn, this message translates to:
  /// **'OTP илгээх'**
  String get sendOtp;

  /// No description provided for @resendOtp.
  ///
  /// In mn, this message translates to:
  /// **'Дахин илгээх'**
  String get resendOtp;

  /// No description provided for @resendOtpCooldown.
  ///
  /// In mn, this message translates to:
  /// **'Дахин илгээх ({seconds}с)'**
  String resendOtpCooldown(int seconds);

  /// No description provided for @orDivider.
  ///
  /// In mn, this message translates to:
  /// **'эсвэл'**
  String get orDivider;

  /// No description provided for @signInWithGoogle.
  ///
  /// In mn, this message translates to:
  /// **'Google-ээр нэвтрэх'**
  String get signInWithGoogle;

  /// No description provided for @verifyTitle.
  ///
  /// In mn, this message translates to:
  /// **'Код оруулах'**
  String get verifyTitle;

  /// No description provided for @verifySubtitle.
  ///
  /// In mn, this message translates to:
  /// **'8 оронтой OTP кодыг оруулна уу'**
  String get verifySubtitle;

  /// No description provided for @verifyButton.
  ///
  /// In mn, this message translates to:
  /// **'Баталгаажуулах'**
  String get verifyButton;

  /// No description provided for @verifyBack.
  ///
  /// In mn, this message translates to:
  /// **'Буцах'**
  String get verifyBack;

  /// No description provided for @otpSentAgain.
  ///
  /// In mn, this message translates to:
  /// **'OTP дахин илгээлээ'**
  String get otpSentAgain;

  /// No description provided for @pendingApprovalTitle.
  ///
  /// In mn, this message translates to:
  /// **'Хүлээгдэж байна'**
  String get pendingApprovalTitle;

  /// No description provided for @pendingApprovalMessage.
  ///
  /// In mn, this message translates to:
  /// **'Та бүртгэлийн хүсэлт илгээсэн байна. Администратор шалгаж баталгаажуулна.'**
  String get pendingApprovalMessage;

  /// No description provided for @pendingApprovalNote.
  ///
  /// In mn, this message translates to:
  /// **'Баталгаажсаны дараа та нэвтрэх боломжтой болно.'**
  String get pendingApprovalNote;

  /// No description provided for @welcomeGreeting.
  ///
  /// In mn, this message translates to:
  /// **'Сайн байна уу 👋'**
  String get welcomeGreeting;

  /// No description provided for @quickAccess.
  ///
  /// In mn, this message translates to:
  /// **'Товч хандах'**
  String get quickAccess;

  /// No description provided for @nextSession.
  ///
  /// In mn, this message translates to:
  /// **'Дараагийн хичээл'**
  String get nextSession;

  /// No description provided for @eventCountdown.
  ///
  /// In mn, this message translates to:
  /// **'Арга хэмжаа хүртэл'**
  String get eventCountdown;

  /// No description provided for @countdownDays.
  ///
  /// In mn, this message translates to:
  /// **'өдөр'**
  String get countdownDays;

  /// No description provided for @countdownHours.
  ///
  /// In mn, this message translates to:
  /// **'цаг'**
  String get countdownHours;

  /// No description provided for @countdownMins.
  ///
  /// In mn, this message translates to:
  /// **'мин'**
  String get countdownMins;

  /// No description provided for @openingCeremony.
  ///
  /// In mn, this message translates to:
  /// **'Нээлтийн ёслол'**
  String get openingCeremony;

  /// No description provided for @navHome.
  ///
  /// In mn, this message translates to:
  /// **'Нүүр'**
  String get navHome;

  /// No description provided for @navProgramme.
  ///
  /// In mn, this message translates to:
  /// **'Хөтөлбөр'**
  String get navProgramme;

  /// No description provided for @navMap.
  ///
  /// In mn, this message translates to:
  /// **'Газрын зураг'**
  String get navMap;

  /// No description provided for @navServices.
  ///
  /// In mn, this message translates to:
  /// **'Үйлчилгээ'**
  String get navServices;

  /// No description provided for @navProfile.
  ///
  /// In mn, this message translates to:
  /// **'Профайл'**
  String get navProfile;

  /// No description provided for @profileSettings.
  ///
  /// In mn, this message translates to:
  /// **'Тохиргоо'**
  String get profileSettings;

  /// No description provided for @profileNotifications.
  ///
  /// In mn, this message translates to:
  /// **'Мэдэгдлүүд'**
  String get profileNotifications;

  /// No description provided for @profileLanguage.
  ///
  /// In mn, this message translates to:
  /// **'Хэл солих'**
  String get profileLanguage;

  /// No description provided for @profileSignOut.
  ///
  /// In mn, this message translates to:
  /// **'Гарах'**
  String get profileSignOut;

  /// No description provided for @profileSessions.
  ///
  /// In mn, this message translates to:
  /// **'Хичээл'**
  String get profileSessions;

  /// No description provided for @profileBadges.
  ///
  /// In mn, this message translates to:
  /// **'Медал'**
  String get profileBadges;

  /// No description provided for @profileSteps.
  ///
  /// In mn, this message translates to:
  /// **'Алхам'**
  String get profileSteps;

  /// No description provided for @roleSuperAdmin.
  ///
  /// In mn, this message translates to:
  /// **'Супер Админ'**
  String get roleSuperAdmin;

  /// No description provided for @roleSpecialist.
  ///
  /// In mn, this message translates to:
  /// **'Мэргэжилтэн'**
  String get roleSpecialist;

  /// No description provided for @roleVip.
  ///
  /// In mn, this message translates to:
  /// **'VIP'**
  String get roleVip;

  /// No description provided for @roleParticipant.
  ///
  /// In mn, this message translates to:
  /// **'Оролцогч'**
  String get roleParticipant;

  /// No description provided for @languageMongolian.
  ///
  /// In mn, this message translates to:
  /// **'Монгол'**
  String get languageMongolian;

  /// No description provided for @languageEnglish.
  ///
  /// In mn, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @selectLanguage.
  ///
  /// In mn, this message translates to:
  /// **'Хэл сонгох'**
  String get selectLanguage;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'mn'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'mn':
      return AppLocalizationsMn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}

import Foundation
import UserNotifications
import ComposeApp

/// Schedules booking-reminder local notifications for Kotlin (`BookingReminderHost`).
enum BookingReminderBridge {
    private static let idPrefix = "booking-reminder-"
    private static let idToday = "booking-reminder-today"
    private static let prefsKey = "booking_reminder_notification_ids"
    private static let notifyHour = 9
    private static let notifyMinute = 0

    static func install() {
        BookingReminderHost.shared.scheduler = Scheduler()
    }

    private final class Scheduler: BookingReminderScheduler {
        func ensurePermission() {
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
        }

        func clear() {
            let center = UNUserNotificationCenter.current()
            var ids = (UserDefaults.standard.array(forKey: BookingReminderBridge.prefsKey) as? [String]) ?? []
            if !ids.contains(BookingReminderBridge.idToday) {
                ids.append(BookingReminderBridge.idToday)
            }
            if !ids.isEmpty {
                center.removePendingNotificationRequests(withIdentifiers: ids)
                center.removeDeliveredNotifications(withIdentifiers: ids)
            }
            UserDefaults.standard.removeObject(forKey: BookingReminderBridge.prefsKey)
        }

        func schedule(startDateIso: String, endDateIso: String, title: String, message: String) {
            ensurePermission()
            clear()

            let days = Self.eachInclusiveDay(start: startDateIso.trimmingCharacters(in: .whitespaces),
                                             end: endDateIso.trimmingCharacters(in: .whitespaces))
            guard !days.isEmpty else { return }

            let today = Self.todayIso()
            let center = UNUserNotificationCenter.current()
            var scheduledIds: [String] = []

            for dayIso in days {
                if dayIso < today { continue }

                if dayIso == today {
                    let content = UNMutableNotificationContent()
                    content.title = title
                    content.body = message
                    content.sound = .default
                    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 2, repeats: false)
                    let request = UNNotificationRequest(
                        identifier: BookingReminderBridge.idToday,
                        content: content,
                        trigger: trigger
                    )
                    center.add(request)
                    scheduledIds.append(BookingReminderBridge.idToday)
                    continue
                }

                guard let comps = Self.dateComponents(from: dayIso) else { continue }
                var fire = DateComponents()
                fire.year = comps.year
                fire.month = comps.month
                fire.day = comps.day
                fire.hour = BookingReminderBridge.notifyHour
                fire.minute = BookingReminderBridge.notifyMinute
                fire.second = 0

                let content = UNMutableNotificationContent()
                content.title = title
                content.body = message
                content.sound = .default
                let trigger = UNCalendarNotificationTrigger(dateMatching: fire, repeats: false)
                let id = BookingReminderBridge.idPrefix + dayIso
                let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
                center.add(request)
                scheduledIds.append(id)
            }

            if !scheduledIds.isEmpty {
                UserDefaults.standard.set(scheduledIds, forKey: BookingReminderBridge.prefsKey)
            }
        }

        private static func todayIso() -> String {
            let f = DateFormatter()
            f.calendar = Calendar.current
            f.locale = Locale(identifier: "en_US_POSIX")
            f.timeZone = TimeZone.current
            f.dateFormat = "yyyy-MM-dd"
            return f.string(from: Date())
        }

        private static func dateComponents(from iso: String) -> DateComponents? {
            let parts = iso.split(separator: "-").compactMap { Int($0) }
            guard parts.count == 3 else { return nil }
            var c = DateComponents()
            c.year = parts[0]
            c.month = parts[1]
            c.day = parts[2]
            return c
        }

        private static func eachInclusiveDay(start: String, end: String) -> [String] {
            guard let startComps = dateComponents(from: start),
                  let endComps = dateComponents(from: end) else { return [] }
            var startDay = startComps
            startDay.hour = 12
            var endDay = endComps
            endDay.hour = 12
            let cal = Calendar.current
            guard let startDate = cal.date(from: startDay),
                  let endDate = cal.date(from: endDay),
                  startDate <= endDate else { return [] }

            let f = DateFormatter()
            f.calendar = cal
            f.locale = Locale(identifier: "en_US_POSIX")
            f.timeZone = cal.timeZone
            f.dateFormat = "yyyy-MM-dd"

            var out: [String] = []
            var cursor = startDate
            var guardCount = 0
            while cursor <= endDate && guardCount < 14 {
                out.append(f.string(from: cursor))
                guard let next = cal.date(byAdding: .day, value: 1, to: cursor) else { break }
                cursor = next
                guardCount += 1
            }
            return out
        }
    }
}

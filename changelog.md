# Changelog
All notable changes to this project will be documented in this file.

## v[3.1.3]
### Added
- Add layout compact challenge

## v[3.1.2]
### Improved
- Improve challenge card to show solved count, and maintenance status.
- Improve challenge filter bar to not reset event selection when applying other filters, and only mark filters as dirty based on challenge filters (status, category, difficulty, search), not event selection.

## v[3.1.1]
### Added
- Add solved count on challenge card.

## v[3.1.0]
### Improved
- Improve Notification ui navbar.
- Improve localstorage with setting.ts, and userState.ts for better state management.
- Imrpove event filter challenge.

## v[3.0.0]
### Added
- Add Admin Event for managing events, including add, edit, delte, view flag challenge in event you manage.

## v[2.7.3]
### Fixed
- Fixed profile image data rendering issue.

## v[2.7.2]
### Added
- Added EventContext for global event data access.

## v[2.7.1]
### Fixed
- Fixed Bug login.

### Added
- Added Preview page for unauthenticated user.

## v[2.7.0]
### Added
- add ligthweight challenge fetching
- Improve logs handling and fetching.

## v[2.6.3]
### Added
- Improve ui for team page.
- add event selector in teams page.
- Add back button in teams page.

### Fixed
- filter event not started summary and stats
- Fixed form challenge dialog cant update to default event, or null event id.

## v[2.6.2]
### Improved
- Improve Challenge Event filter in some pages.

## v[2.6.1]
### Fixed
- Fixed issue Challenge Event filter not working properly in some pages.
- Added default event label if not set in config.

## v[2.6.0]
### Added
- Add Security Policy get challenge inactive, and event started/ended.
- Improve Challenge Event filter.
- Markdown Rendered Comments `$!` syntax for hidden comments.

## v[2.5.6]
### Fixed
- Fixed issue Chart team scoreboard.

### Added
- Add Live2D maskot in pages.

## v[2.5.5]
### Added
- Add icon for navbar, scoreboard, profile, stats, and logs page.
- Improve UI for docs page.

## v[2.5.4]
### Added
- Added tab for profile page to filter by event.
- Added tab for stats page to filter by event.

### Fixed
- Fixed Submit challenges when event is not active.

## v[2.5.3]
### Added
- Added tab for logs page to filter by event.
- Added tab for scoreboard team page to filter by event.

### Improve
- Improve tab logs page.
- Improve tab in scoreboard team page.

## v[2.5.2]
### Added
- add tab scoreboard event filter.
- improve event filter in scoreboard page.
- improve event filter in scoreboard all page.
- add parameter event_id in scoreboard page for filtering.
- hide user with 0 score in scoreboard.

## v[2.5.1]
### Added
- add UserStats component to show user stats in profile page.
- add tab for userprofile to show profile or stats.

### Fixed
- hidden the notif icon, and logs icon in navbar when not logged in.

## v[2.5.0]
### Added
- Add Captcha support in register and login page.
- Add configuration for enabling/disabling captcha in config file.

## v[2.4.5]
### Added
- improve event card display in event page.
- add image zoom support in markdown renderer.

## v[2.4.4]
### Added
- add event image url support.
- improve event card image display.
- add event tab in challenge page.
- improve navbar.

## v[2.4.3]
### Added
- Add tag event in challenge detail.

## v[2.4.2]
### Added
- improve filter intro challenge only in main event.
- improve order event in challenge filter.

## v[2.4.1]
### Fixed
- fixed scoreboard point.

## v[2.4.0]
### Added
- add fitur event management
- add event admin page

## v[2.3.3]
### Fixed
- fixed notif kaga tampil.

### Update
- improve team solves show all challenges.
- add the setting for hide maintenance, and team solves challenges in challenge filter bar.
- improve markdown ul, ol, img rendering.

## v[2.3.2]
### Update
- improve team management UI and UX
- improve team scoreboard UI and UX

## [V.2.3.1]
- update team management features, including team renaming and user team details

## [v2.3.0]
### Added
- New Feature Teams
  - Teams Scoreboard Page
  - Teams Management Page

## [v2.2.2]
### Fixed Bug
- fix create profile in supabase

## [v2.2.1]
### Changed
- added toast for real-time notification
- added sound for real-time notification

## [v2.2.0]
### Changed
- Refactor notifications to logs:
	- Removed NotificationPage and NotificationsContext, replacing with LogsPage and LogsContext.
	- Updated Navbar to handle logs instead of notifications, including real-time updates and unread counts.
	- Created LogsList component to display logs with filtering options for challenges and solves.
	- Adjusted API calls in challenges.ts to fetch logs instead of notifications.
	- Updated sitemap to reflect changes from notifications to logs.

---

## [v2.1.2]
### Changed
- Menampilkan tanggal pembuatan akun dan login terakhir di profile

---

## [v2.1.1]
### Added
- New FGTE icon
- Fitur edit foto profil
- Toggle maintenance untuk challenge
- Fitur search solve berdasarkan challenge
### Changed
- UI icon lebih clean
- Icon badge diperbarui
- Improvement dan bug fixes lainnya

---

## [v2.0.3]
### Added
- Challenge tour
- Notification solves
### Changed
- Layout Scoreboard tab

---

## [v2.0.1]
### Added
- First blood leaderboard
- Notification solves
### Changed
- Enhances UI/UX
- Improves markdown rendering, dialog consistency, and code block usability
- Refactors floating toolbar and chat panel for better layout and responsiveness
- Updates contributor avatars, scoreboard table animation, and disables verbose logging

---

## [v1.9.4]
### Changed
- Refactor ChallengeTutorial component
### Added
- ChatToggle for AI Bot

## [V.1.9.1]
### Changed
- Minor updates and maintenance fixes
- navbar ui improvements
- add info page

---

## [v1.9.0]
### Added
- AuthProviders component for managing authentication methods

---

## [v1.8.6]
### Changed
- Refactor AdminSolversPage to simplify solver rendering
- Improve ScrollToggle visibility by adjusting z-index
- Enhance scrollbar styles for better UI aesthetics

---

## [v1.8.5]
### Changed
- Refactor navigation links to use Next.js `Link` component for better routing and performance
- Simplify RulesPage by removing unnecessary loading state

---

## [v1.8.4]
### Added
- Bio and social media fields in user profile
### Changed
- Update related profile components to support new fields

---

## [v1.8.3]
### Changed
- Refactor dialog components using centralized styling classes for better consistency

---

## [v1.8.2]
### Changed
- Improve audit log display to show username correctly

---

## [v1.8.1]
### Added
- Difficulty totals calculation and integration into user profile

---

## [v1.8.0]
### Added
- Maintenance mode with configuration support and middleware handling

---

## [v1.7.0]
### Added
- Challenge Tutorial component
- Tutorial PDF support

---

## [v1.6.4]
### Added
- Audit log functionality
### Changed
- Update related components for audit logging

---

## [v1.6.3]
### Added
- Show-all scoreboard feature

---

## [v1.6.2]
### Changed
- Update confetti animation behavior

---

## [v1.6.1]
### Added
- Challenge sorting feature

---

## [v1.6.0]
### Added
- Rules page
- Difficulty badges
### Changed
- Enhanced navbar and footer UI

---

## [v1.5.5]
### Changed
- Improve challenge categories handling
- UI consistency improvements across admin pages

---

## [v1.5.4]
### Added
- Flag handling on admin page
- Toast notifications
### Changed
- Improve challenge form dialog and detail dialog UI

---

## [v1.5.3]
### Changed
- Update labels

---

## [v1.5.2]
### Added
- New challenge label support

---

## [v1.5.1]
### Added
- RPC function to retrieve user's first blood challenges

---

## [v1.5.0]
### Added
- Enhanced leaderboard with summary and progress tracking
### Changed
- Optimized data handling for performance

---

## [v4.0.3]
### Added
- Application configuration support for dynamic metadata
### Changed
- Navbar updates based on app configuration

---

## [v4.0.2]
### Added
- Admin overview page with statistics and charts
- Chart.js integration for data visualization

---

## [v4.0.1]
### Added
- Notifications context
- Navbar notification integration

---

## [v1.4.0]
### Changed
- Replace date formatting logic with `formatRelativeDate` utility

---

## [v1.3.3]
### Changed
- Update admin view

---

## [v1.3.2]
### Changed
- Rename `challanges` to `challenges`
- Update landing page

---

## [v1.3.1]
### Added
- SQL support for dynamic scoring

---

## [v1.3.0]
### Added
- Dynamic score feature

---

## [v1.2.3]
### Fixed
- User profile link bug

---

## [v1.2.2]
### Fixed
- Color rendering issues
- Markdown rendering bug

---

## [v1.2.1]
### Added
- Solver challenges feature

---

## [v1.2.0]
### Changed
- Improve loading behavior
- Fix redirect issues on login & registration

---

## [v1.1.1]
### Changed
- Improve markdown rendering

---

## [v1.1.0]
### Fixed
- Authentication bugs
### Changed
- Layout improvements

---

## [v1.0.0]
### Added
- Initial stable release
- Authentication system
- Challenge & admin layout

---

🔔 CTFS Initial Release

#### [v1.0.0]

**Added**

* Initial stable release
* Authentication system
* Challenge system & admin layout
* Basic scoreboard & profile

---

🔔 CTFS Core Feature Expansion

#### [v1.5.0]

**Added**

* Enhanced leaderboard with progress & summary
* First blood tracking
* Dynamic scoring (SQL-based)
* New challenge labels & difficulty badges

**Improved**

* Challenge management & admin UI
* Performance & data handling

---

🔔 CTFS UX & System Improvement

#### [v1.8.0]

**Added**

* Maintenance mode (config + middleware)
* Audit log system
* Rules page & challenge tutorial
* Bio & social media on profile

**Improved**

* Navbar & footer UI
* Dialog, scrollbar, markdown rendering
* Admin & scoreboard usability

---

🔔 CTFS Notifications → Logs System

#### [v2.2.0]

**Changed**

* Notifications refactored into Logs system
* New Logs page with filters
* Real-time logs updates + unread counter
* Toast & sound notification support

**Improved**

* Challenge solve visibility
* Profile info (join date & last login)

---

🔔 CTFS Teams Feature Release

#### [v2.3.0 – v2.3.3]

**Added**

* Teams system
* Team scoreboard
* Team management (rename, member detail)
* Team solves & filters

**Improved**

* Team UI & UX
* Challenge filter bar (hide maintenance & team solves)
* Markdown rendering (ul, ol, img)

**Fixed**

* Notification not showing issue

---

🔔 CTFS Event Management Feature

#### [v2.4.0 – v2.4.1]
**Added**
- Event management feature

**Fixed**
- Fixed scoreboard point calculation issue

---

🔔 **CTFS Update - UserStat, Event & Scoreboard Enhancement**
#### **[v2.5.0 – v2.5.2]**
**Added**
* Captcha support untuk **login & register**
* **UserStats component** di profile page
* Tab profile untuk switch **Profile / Stats**
* Event image URL & image zoom support di markdown
* Event tab di challenge page, Tag event di challenge detail
* Event management & admin event page
* Tab scoreboard untuk event, Parameter `event_id` pada scoreboard untuk filtering
* Filter event yang lebih lengkap di scoreboard & scoreboard all

**Improved**
* Tampilan event card di event page
* Tampilan gambar event
* Navbar improvement
* Event filter & ordering di challenge
* Filter intro challenge khusus main event

**Fixed**
* Perhitungan point scoreboard
* Notif & log icon disembunyikan saat user belum login
* Scoreboard hanya menampilkan user dengan score > 0

---

🔔 **CTFS Update – Event & Scoreboard Enhancement**
#### **[v2.5.0 – v2.5.4]**
**Added**
* Event filter di **scoreboard, logs, profile, dan stats**
* UserStats di profile page
* Captcha untuk login & register

**Improved**
* Event & scoreboard UI/UX
* Challenge event filtering & ordering
* Navbar & event card display

**Fixed**
* Perhitungan skor scoreboard
* Submit challenge saat event tidak aktif
* Scoreboard hanya menampilkan user dengan score > 0

---

🔔 **CTFS Update – Security, Event Filter & Logs Optimization**

#### **[v2.6.0 – v2.7.0]**
### **Added**
* Security policy:
  * Restrict access to inactive challenges
  * Restrict access when event not started / already ended
* Markdown hidden comment syntax using `$!`
* Default event label configuration fallback
* Event selector in Teams page
* Back button in Teams page
* Lightweight challenge fetching (performance improvement)
* Improved logs fetching system
* UI improvements for Teams page

### **Improved**
* Challenge Event filter consistency across pages
* Event filter logic in summary & stats
* Overall logs handling & performance
* Teams page UI/UX refinement

### **Fixed**
* Challenge Event filter not working properly in some pages
* Event filter summary showing not-started events
* Challenge form dialog unable to update to default / null event
* Minor filtering & edge-case issues related to events

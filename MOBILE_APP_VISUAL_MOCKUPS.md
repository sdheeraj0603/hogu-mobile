# HOG-U Mobile App - Visual Mockups & Wireframes

## 🎨 Color Palette Reference

```
┌─────────────────────────────────────────┐
│ PRIMARY (#1a7f63)                       │
│ Used for: Main buttons, active states   │
│ RGB: 26, 127, 99                        │
│ Hex: #1a7f63                            │
│ Example: Sync button, primary CTA       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECONDARY (#4ade80)                     │
│ Used for: Highlights, success states    │
│ RGB: 74, 222, 128                       │
│ Hex: #4ade80                            │
│ Example: Badge text, achievements       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BACKGROUND (#0a0a0a)                    │
│ Used for: Main screen background        │
│ RGB: 10, 10, 10                         │
│ Hex: #0a0a0a                            │
│ Example: Screen container               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DANGER (#ef4444)                        │
│ Used for: Critical status, errors       │
│ RGB: 239, 68, 68                        │
│ Hex: #ef4444                            │
│ Example: CRITICAL sweat status          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WARNING (#f59e0b)                       │
│ Used for: Warning messages              │
│ RGB: 245, 158, 11                       │
│ Hex: #f59e0b                            │
│ Example: Moderate intensity             │
└─────────────────────────────────────────┘
```

---

## 📱 Screen 1: Login Screen

```
┌─────────────────────────────┐
│                             │
│       HOG-U 🏃             │ [28px Bold, Primary Color]
│   Performance Nutrition    │ [14px Gray]
│                             │
│ (60px spacing)              │
│                             │
│  Create Account    [Tab]    │ [Header - 24px Bold]
│                             │
│ ┌─────────────────────────┐
│ │ Full Name               │ [14px text input]
│ │ John Doe                │
│ └─────────────────────────┘
│                             │
│ ┌─────────────────────────┐
│ │ Email                   │
│ │ john@example.com        │
│ └─────────────────────────┘
│                             │
│ ┌─────────────────────────┐
│ │ Password           👁️  │ [Toggle visible]
│ │ ••••••••                │
│ └─────────────────────────┘
│                             │
│  ⚠️ Please fill all fields  │ [Error box if needed]
│                             │
│ ┌─────────────────────────┐
│ │   Create Account       │ [Primary Green Button]
│ └─────────────────────────┘
│                             │
│ Already have account? Login │ [Link]
│                             │
│  🏃 Powered by Strava      │ [Footer]
│                             │
└─────────────────────────────┘
```

---

## 📱 Screen 2: Dashboard - Activity Feed

```
┌─────────────────────────────┐
│ Hello, Runner! 👟  🟢       │ [Header - greeting + status]
│ 📍 Bangalore, India  Connected
├─────────────────────────────┤
│ ┌──────────────┬──────────┐ │
│ │ ⟳ Sync       │ ↓ Export │ │ [Control buttons - full width]
│ └──────────────┴──────────┘ │
│ Last sync: 14:32:20          │ [Caption - 10px Gray]
├─────────────────────────────┤
│                             │
│ ┌────────────────────────┐ │
│ │ Run    📍 Lalbagh      │ │ [Activity Card]
│ │ Test run               │ │
│ │                        │ │
│ │ ┌──────┬──────┬──────┐ │
│ │ │ 10.8 │  68  │ 6.3  │ │ [Metrics grid]
│ │ │ km   │  m   │ idx  │ │
│ │ └──────┴──────┴──────┘ │
│ │                        │ │
│ │ 🌡️ 21.8°C 💧 97% ⚠️ CRIT │ [Weather row]
│ │                        │ │
│ │ ┌──────────────────┐  │ │
│ │ │ 🍽️ Recommended   │  │ │ [Meal section]
│ │ │ Poha             │  │ │
│ │ │ Level 1: Morning │  │ │
│ │ │ [Order Zomato →] │  │ │
│ │ └──────────────────┘  │ │
│ │ 06:33 AM               │ │
│ └────────────────────────┘ │
│                             │
│ ┌────────────────────────┐ │
│ │ Ride    📍 Cubbon Park │ │ [Activity Card 2]
│ │ Evening Ride           │ │
│ │ ... (same format)      │ │
│ └────────────────────────┘ │
│                             │
│ [Pull down to refresh]      │
│                             │
└─────────────────────────────┘
```

---

## 📱 Screen 3: Activity Detail Modal

```
┌──────────────────────────────┐
│ ✕     Activity Details   ↗️  │ [Header with close & share]
├──────────────────────────────┤
│                              │
│ Run          📍 Lalbagh      │ [Activity header]
│ Test run                     │
│                              │
│ ┌──────────┬────────┬───────┐
│ │  10.82   │ 68.0   │ 6.29  │ [Stats grid - 3 cols]
│ │ Distance │Elevation│Intensy
│ │   (km)   │  (m)   │       │
│ └──────────┴────────┴───────┘
│                              │
│ Time             06:33 AM    │ [Info rows]
│ Temperature      21.8°C      │
│ Humidity         97%         │
│ Hydration Status CRITICAL    │
│                              │
├──────────────────────────────┤
│ 🍽️ Nutrition Recommendation  │
│                              │
│ Morning Tiffin      Level 1  │ [Meal header]
│ Poha                         │ [Meal name - 20px Bold]
│                              │
│ Level 1: Morning Tiffin...   │ [Full description]
│ [with proper recovery...]    │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🍔 Order on Zomato       │ │ [Large button]
│ └──────────────────────────┘ │
│                              │
├──────────────────────────────┤
│ 💡 Performance Tips          │
│                              │
│ ┌──────────────────────────┐ │
│ │ 💧 Hydration             │ │ [Tip card]
│ │ With 97% humidity,       │ │
│ │ maintain consistent...   │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ ⏱️ Nutrition Timing      │ │
│ │ Post-workout meal...     │ │
│ └──────────────────────────┘ │
│                              │
│ [📥 Export Activity Data]    │
│                              │
└──────────────────────────────┘
```

---

## 📱 Screen 4: Trackers Management

```
┌──────────────────────────────┐
│ Connected Trackers           │ [Header]
│ 2 trackers connected         │ [Subheader]
├──────────────────────────────┤
│                              │
│ ┌──────────────────────────┐ │
│ │ 🏃 Strava                │ │ [Connected tracker card]
│ │ ✅ Connected since Jan 1 │ │
│ │ 127 activities           │ │
│ │                      ✕ 36│ │ [Disconnect button]
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ ⌚ Fitbit                 │ │
│ │ ✅ Connected since Mar 15│ │
│ │ 89 activities            │ │
│ │                      ✕ 36│ │
│ └──────────────────────────┘ │
│                              │
├──────────────────────────────┤
│ Available Trackers           │
│                              │
│ ┌─────────────┐ ┌──────────┐
│ │🏥 Google Fit│ │❤️ Apple  │ │ [Available trackers grid]
│ │             │ │  Health  │ │
│ │ + Connect   │ │+ Connect │ │
│ └─────────────┴─┴──────────┘ │
│                              │
└──────────────────────────────┘
```

---

## 📱 Screen 5: Settings Profile

```
┌──────────────────────────────┐
│ Settings                     │ [Header]
├──────────────────────────────┤
│ PROFILE                      │ [Section title]
│                              │
│ ┌──────────────────────────┐ │
│ │ 👤 John Doe              │ │ [Profile card]
│ │ john@example.com         │ │
│ │ Member since 2026-01-15  │ │
│ └──────────────────────────┘ │
│                              │
│ 🔐 Change Password        ›  │ [Setting rows]
│ 📋 Edit Profile           ›  │
├──────────────────────────────┤
│ PREFERENCES                  │
│                              │
│ 🔔 Notifications         [ON] │ [Toggle switches]
│ 🌙 Dark Mode            [ON] │
│ ⚡ Auto-Sync            [ON] │
├──────────────────────────────┤
│ DATA                         │
│                              │
│ 📥 Export All Data        ›  │
│ 🗑️ Clear Cache            ›  │
│                              │
│ Storage Used:                │
│ [████░░░░░] 4.5 MB / 50 MB  │ [Progress bar]
├──────────────────────────────┤
│ SUPPORT                      │
│                              │
│ ❓ Help & FAQ             ›  │
│ 📧 Contact Support        ›  │
│ 📄 Terms & Privacy        ›  │
│ ℹ️ App Version      1.0.0    │
├──────────────────────────────┤
│                              │
│ ┌──────────────────────────┐ │
│ │ 🚪 Logout                │ │ [Danger buttons]
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ ⚠️ Delete Account        │ │ [Less prominent]
│ └──────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

---

## 🧭 Bottom Tab Navigation

```
┌─────────────────────────────┐
│                             │
│      [Content Area]         │
│                             │
├─────────────────────────────┤
│ 🏃           ⌚           ⚙️ │ [Active: Activities]
│ Activities   Trackers   Settings
│ (Green)      (Gray)     (Gray)
└─────────────────────────────┘
```

---

## 🎨 Activity Card Detailed Design

```
┌────────────────────────────────┐
│ Run          📍 Lalbagh        │ [Activity Type | Location]
│                                │
│ Test run                       │ [Activity name - 20px Bold]
│                                │
│ ┌─────────────────────────────┐
│ │ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ │ 10.8 │ │ 68   │ │ 6.3  │ │ [Metrics - centered text]
│ │ │ km   │ │ m    │ │ idx  │ │
│ │ └──────┘ └──────┘ └──────┘ │
│ │        (Dark background)     │
│ └─────────────────────────────┘
│                                │
│ 🌡️ 21.8°C   💧 97%   ⚠️ CRITICAL
│    (Gray)  (Gray)  (Red text)  │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🍽️ Recommended Meal        │ │ [Meal section - Green bg]
│ │ Poha                        │ │
│ │ Level 1: Morning Tiffin ... │ │ [Smaller text - Gray]
│ │                             │ │
│ │ [Order on Zomato →]         │ │ [Button - Green bg, border]
│ └────────────────────────────┘ │
│                                │
│ 06:33 AM                       │ [Timestamp - 10px Gray]
│                                │ [3px Green top border]
└────────────────────────────────┘
```

---

## 📐 Typography Hierarchy

```
H1: HOG-U (28px, Bold, #1a7f63)
    └─ App logo/title

H2: Hello, Runner! (24px, Bold, #ffffff)
    └─ Screen titles, major headers

H3: Test run (20px, Semi-bold, #ffffff)
    └─ Activity names, section headers

H4: Run (18px, Semi-bold, #ffffff)
    └─ Card titles, secondary headers

Body: Regular text (14px, Regular, #ffffff)
      └─ Normal content, descriptions

Body Bold: Important text (14px, Semi-bold, #ffffff)
           └─ Emphasis within body

Small: Secondary text (12px, Regular, #aaaaaa)
       └─ Hints, labels, timestamps

Small Bold: Emphasized small (12px, Semi-bold, #ffffff)
            └─ Important small text

Tiny: Micro text (10px, Regular, #666666)
      └─ Captions, very small labels
```

---

## 🎯 Button States

```
PRIMARY BUTTON (#1a7f63)
┌──────────────────────┐
│   Sync Workouts      │ [Default]
└──────────────────────┘

┌──────────────────────┐
│   Sync Workouts      │ [Pressed - slightly darker]
└──────────────────────┘

┌──────────────────────┐
│   Sync Workouts      │ [Disabled - opacity 60%]
└──────────────────────┘

SECONDARY BUTTON (Border)
┌──────────────────────┐
│  ↓ Export Data       │ [Default - border]
└──────────────────────┘

DANGER BUTTON (#ef4444)
┌──────────────────────┐
│   Delete Account     │ [Red bg]
└──────────────────────┘
```

---

## 💫 Animation Reference

```
FADE IN
0ms:   Opacity 0%
300ms: Opacity 100%
Curve: Ease-out

SLIDE UP (Modal)
0ms:   Y position: 300px
250ms: Y position: 0px
Curve: Ease-out

SCALE (Card Hover)
0ms:   Scale 1.0
200ms: Scale 1.02
Curve: Ease-out

REFRESH SPINNER
0ms - 1000ms: Rotate 0deg to 360deg
Repeat infinitely
Curve: Linear
```

---

## 🔒 State Indicators

```
🟢 CONNECTED      [Green circle + text]
🔴 DISCONNECTED   [Red circle + text]
⚠️ WARNING        [Yellow triangle]
⚡ CRITICAL       [Red exclamation]
💧 MODERATE       [Blue water drop]
✅ SUCCESS        [Green checkmark]
❌ ERROR          [Red X]
⏳ LOADING        [Spinner animation]
```

---

## 📐 Spacing Grid

```
Default padding: 16px (md)
Card padding: 24px (lg)
Header padding: 24px (lg) + bottom border
Section gap: 24px (lg)
List item padding: 12px vertical (sm) + 16px horizontal

Margins:
- Between sections: 24px (lg)
- Between items: 8px (sm) - 12px
- Top/bottom: 32px (xl) on major sections

Border:
- All dividers: 1px solid rgba(255,255,255,0.1)
- Card border: 1px solid rgba(255,255,255,0.1)
- Top accent: 3px solid #1a7f63 (primary)
```

---

## 🎯 Touch Target Sizing

```
All interactive elements: 44x44 minimum
  ├─ Buttons: 44x56 (height-optimized)
  ├─ Tab buttons: 64 width minimum
  ├─ Card areas: Full tap
  └─ Icon buttons: 44x44 circle

Text links: 44px touch height (padding)
Form inputs: 48px height
Toggle switches: 40x24 (iOS standard)
```

---

## ✨ Visual Accent Examples

```
Activity Type Badges:
Run     → Red background (#ef4444 at 20% opacity)
Ride    → Blue background (#3b82f6 at 20% opacity)
Walk    → Orange background (#f59e0b at 20% opacity)
Swim    → Cyan background (#06b6d4 at 20% opacity)

Intensity Levels:
1-2     → Green (#4ade80)
3-4     → Yellow (#f59e0b)
5-6     → Orange (#f59e0b)
7+      → Red (#ef4444)

Hydration Status:
CRITICAL → Red text + warning icon
HIGH     → Orange text + caution
MODERATE → Blue text + info
LOW      → Green text + checkmark
```

---

**Last Updated**: May 8, 2026
**Design System Version**: 1.0
**Component Count**: 5 screens + 2 components
**Total Lines of Code**: 1,970

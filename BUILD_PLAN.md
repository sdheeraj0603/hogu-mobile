# HOG-U Multi-Tracker Architecture - Build Plan

## Project Goal
Email-based, multi-tracker fitness platform where users login, auto-detect all connected fitness apps, fetch unified activity data, and receive personalized meal recommendations.

## Architecture Overview
- **Backend**: Python Flask + SQLAlchemy + PostgreSQL/SQLite
- **Frontend**: Web dashboard + Mobile app (React Native/Flutter)
- **External APIs**: Strava, Fitbit, Google Fit, Apple Health, Open-Meteo, Zomato
- **Authentication**: Email/password login + OAuth for fitness trackers
- **Timeline**: 3-4 weeks (4 phases)

---

## Phase 1: User Authentication + Database (Week 1)
**Deliverables:**
- User registration (email/password)
- Email login system
- Password hashing + security
- User profile management
- Session/JWT token handling
- SQLAlchemy ORM setup

**Database Schema:**
```
Users Table:
- id (PK)
- email (unique)
- password_hash
- name
- created_at
- updated_at

UserTrackers Table:
- id (PK)
- user_id (FK)
- tracker_type (strava, fitbit, google_fit, apple_health)
- access_token
- refresh_token
- expires_at
- created_at

Activities Table:
- id (PK)
- user_id (FK)
- tracker_type
- activity_name
- activity_type
- distance_km
- elevation_gain
- intensity_index
- location
- temperature
- humidity
- sweat_status
- meal_recommendation
- start_time
- created_at
```

**API Endpoints:**
- `POST /auth/register` - Email signup
- `POST /auth/login` - Email login
- `POST /auth/logout` - Logout
- `GET /user/profile` - Get user info
- `PUT /user/profile` - Update profile
- `GET /user/trackers` - List connected trackers

**Estimated Effort:** 1 week (40-50 hours)

---

## Phase 2: Tracker Connection Management (Week 2)
**Deliverables:**
- OAuth handlers for each tracker
- Token storage + refresh mechanism
- Tracker connection UI
- Tracker disconnection endpoint
- Multi-tracker adapter framework

**OAuth Flows to Implement:**
1. **Strava OAuth** - Already done, need to refactor for multi-user
2. **Fitbit OAuth** - 3-4 hours
3. **Google Fit OAuth** - 3-4 hours
4. **Apple Health** - 4-5 hours (iOS integration)

**API Endpoints:**
- `GET /trackers/strava/auth` - Strava OAuth redirect
- `GET /trackers/strava/callback` - Strava OAuth callback
- `GET /trackers/fitbit/auth` - Fitbit OAuth redirect
- `GET /trackers/fitbit/callback` - Fitbit OAuth callback
- `POST /trackers/{tracker_id}/disconnect` - Disconnect tracker
- `GET /trackers/status` - Check all connected trackers

**Estimated Effort:** 1 week (40-50 hours)

---

## Phase 3: Multi-Tracker Activity Fetching (Week 3)
**Deliverables:**
- Unified activity processor
- Adapter pattern implementation
- Background sync job
- Activity enrichment (weather, location, meals)
- Real-time activity merging

**Adapter Structure:**
```python
class TrackerAdapter:
    def get_activities(token, limit)
    def transform_to_standard_format(activity)
    def refresh_token(refresh_token)

# One adapter per tracker:
StravaAdapter
FitbitAdapter
GoogleFitAdapter
AppleHealthAdapter
```

**API Endpoints:**
- `POST /activities/sync` - Trigger sync from all trackers
- `GET /activities` - Get all activities (unified feed)
- `GET /activities?tracker=strava` - Filter by tracker
- `GET /activities?date_from=2026-01-01&date_to=2026-05-08` - Date range

**Background Job:**
- Auto-sync every 6 hours
- Check token expiry
- Refresh tokens automatically

**Estimated Effort:** 1 week (40-50 hours)

---

## Phase 4: Dashboard + Mobile App (Week 4)
**Deliverables:**
- Updated web dashboard (multi-user, multi-tracker)
- Mobile app (iOS + Android via React Native/Flutter)
- Real-time notifications
- Production deployment

**Web Dashboard Features:**
- User login screen
- Multi-tracker activity feed
- Tracker management UI
- Settings page
- Activity filtering
- Export functionality

**Mobile App Features (React Native):**
- Native iOS + Android
- User login
- Activity feed
- Push notifications
- Offline support
- Quick sync button
- Meal ordering integration

**Deployment:**
- Backend: Heroku/AWS/DigitalOcean
- Database: PostgreSQL on managed service
- Mobile: App Store + Google Play

**Estimated Effort:** 1 week (40-50 hours)

---

## Current Status
✅ **Completed:**
- Strava integration (single-user)
- Activity auto-fetch
- Location mapping
- Meal recommendations
- Web dashboard (Strava only)
- API endpoints

❌ **Not Started:**
- User authentication system
- Database schema
- Multi-tracker support
- Mobile app
- Production deployment

---

## Tech Stack Summary
| Component | Technology |
|-----------|-----------|
| Backend | Python 3.9 + Flask |
| ORM | SQLAlchemy |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Authentication | Flask-Login + JWT + bcrypt |
| Mobile | React Native (iOS + Android) |
| Frontend | HTML/CSS/JavaScript (existing) |
| APIs | Strava, Fitbit, Google Fit, Apple Health |
| Deployment | Docker + Heroku/AWS |

---

## Next Steps
1. ✅ Save this plan (DONE)
2. ⏳ Start Phase 1: User authentication + database setup
3. ⏳ Refactor existing Strava code for multi-user
4. ⏳ Build OAuth handlers for Fitbit, Google Fit, Apple Health
5. ⏳ Create mobile app with React Native
6. ⏳ Deploy to production

---

**Last Updated:** May 8, 2026
**Status:** Ready to start Phase 1

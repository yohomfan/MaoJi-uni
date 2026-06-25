# 毛叽 Maoji — 宠物健康管家

> 毛叽一声，健康同行

WeChat Mini Program for pet health management, built with uni-app (Vue 3 + TypeScript).

## 项目概述

毛叽 Maoji is a comprehensive pet health management WeChat Mini Program targeting urban pet owners (25-40 years old). The core value proposition is the **健康主线 (health backbone)**: pet archives, vaccination/deworming/medical/weight records, unified health calendar, automated subscription message reminders, knowledge library, and VIP health membership tier.

**Version:** V1.0 (MVP)
**Target:** WeChat Mini Program (mp-weixin)
**Verification:** H5 build for automated testing

### Key Features (V1.0)

✅ **Pet Archive** - Multi-pet management with complete profiles
✅ **Health Management** - Vaccination, deworming, medical exams, medications, weight tracking
✅ **Health Calendar** - Unified view of all health tasks across pets with smart reminders
✅ **Knowledge Library** - 20+ articles on pet health, 40+ breed encyclopedia entries
✅ **VIP Membership** - Premium health features and benefits
✅ **WeChat Integration** - Login, subscribe messages, cloud storage

🚫 **Out of Scope (V1.0)**: AI portrait generation (deferred to V2)

## Technology Stack

### Frontend
- **Framework:** uni-app with Vue 3 (Composition API) + Vite + TypeScript
- **UI Library:** uView Plus (uni-app mobile components)
- **State:** Pinia with uni.setStorageSync persistence
- **Routing:** pages.json (uni-app native, NO vue-router)
- **Styling:** SCSS with rpx units (mini-program responsive)
- **Charts:** uCharts / qiun-data-charts (canvas-based, cross-platform)

### Backend
- **微信云开发 (WeChat Cloud Development)**
  - Cloud functions (Node.js)
  - Cloud database
  - Cloud storage
  - **H5 Mock:** Platform adapter with IndexedDB + demo data

### Build Targets

1. **H5** (`npm run dev:h5`) - Development & verification at http://localhost:5173
2. **mp-weixin** (`npm run build:mp-weixin`) - Production WeChat Mini Program

## Critical Architecture: Dual Build Target

The ship target is WeChat Mini Program, but the autonomous harness verifies every feature with headless Chrome screenshots. **Solution:** ONE codebase compiles to BOTH targets.

- **DEV/VERIFY:** `npm run dev:h5` → served on :5173 → Puppeteer screenshots → features marked `passes: true`
- **SHIP:** `npm run build:mp-weixin` → dist/build/mp-weixin → WeChat DevTools

### Platform Adapter Layer

**Location:** `src/platform/*`

All WeChat-specific capabilities are abstracted through a unified interface with dual implementations:

- **data.ts** - CRUD operations (wx.cloud ↔ IndexedDB mock)
- **auth.ts** - Login (uni.login ↔ demo openid)
- **subscribeMessage.ts** - Health reminders (real ↔ mock toast)
- **pay.ts** - VIP purchase (WeChat Pay ↔ mock flow)
- **storage.ts** - Image/PDF upload (cloud ↔ IndexedDB blob)

**RULE:** Components/stores NEVER call `wx.*` or `localStorage` directly — always use platform adapter.

## Project Structure

```
maoji-uni/
├── src/
│   ├── pages/                         # Main package
│   │   ├── index/index.vue            # Home: calendar + pet cards + todos
│   │   ├── pet/
│   │   │   ├── list.vue               # Pet archive list
│   │   │   ├── detail.vue             # Pet profile detail
│   │   │   └── edit.vue               # Pet create/edit form
│   │   ├── health/
│   │   │   ├── vaccine.vue            # Vaccination management
│   │   │   ├── deworm.vue             # Deworming records
│   │   │   ├── medical.vue            # Physical exam records
│   │   │   ├── medicine.vue           # Medication tracking
│   │   │   ├── weight.vue             # Weight timeline & chart
│   │   │   └── calendar.vue           # Unified health calendar
│   │   ├── knowledge/
│   │   │   ├── list.vue               # Knowledge library
│   │   │   └── detail.vue             # Article detail
│   │   └── user/
│   │       ├── profile.vue            # User center
│   │       ├── vip.vue                # VIP membership
│   │       └── orders.vue             # Order history
│   ├── pages-ai/
│   │   └── placeholder.vue            # "Coming Soon" for AI features (V2)
│   ├── components/
│   │   ├── PetCard.vue
│   │   ├── HealthTodoCard.vue
│   │   ├── HealthCalendar.vue
│   │   ├── TimelineItem.vue
│   │   └── EmptyState.vue
│   ├── stores/
│   │   ├── user.ts                    # User state (Pinia)
│   │   ├── pet.ts                     # Pet state
│   │   └── health.ts                  # Health records state
│   ├── platform/                      # ⚠️ Platform abstraction layer
│   │   ├── data.ts
│   │   ├── auth.ts
│   │   ├── subscribeMessage.ts
│   │   ├── pay.ts
│   │   └── storage.ts
│   ├── api/
│   │   ├── pet.ts
│   │   ├── health.ts
│   │   └── pay.ts
│   ├── utils/
│   │   ├── healthCycle.ts             # Next-date computation (unit tested)
│   │   ├── format.ts
│   │   ├── request.ts
│   │   └── upload.ts
│   ├── static/                        # Seed data + images
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json                  # uni-app manifest
│   ├── pages.json                     # Routing + tabBar
│   └── uni.scss
├── cloudfunctions/                    # WeChat cloud functions
│   ├── pet-crud/
│   ├── health-crud/
│   ├── health-cron/                   # Daily reminder scan
│   ├── pay-order/
│   ├── pay-notify/
│   └── user-init/
├── feature_list.json                  # 94 test cases (single source of truth)
├── init.sh                            # Environment setup script
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v16+ 
- npm or pnpm

### Quick Start

```bash
# Run initialization script (installs deps + starts H5 server)
./init.sh

# Or manually:
npm install
npm run dev:h5
```

The H5 app will be available at **http://localhost:5173**

### Build for Production

```bash
# Build WeChat Mini Program
npm run build:mp-weixin

# Output: dist/build/mp-weixin/
# Open in WeChat DevTools for testing/upload
```

## Verification Protocol

This project uses an autonomous verification harness:

1. **H5 Build** serves on :5173 for Puppeteer navigation + screenshots
2. **Features** marked `passes: true` in `feature_list.json` ONLY after screenshot evidence
3. **Unit Tests** verify pure logic (healthCycle, date utils) via Vitest
4. **mp-weixin Build** must compile successfully (verified at least once per session)

### Evidence Requirements

- Screenshot of running feature in H5 build, OR
- Console log / test output showing success, OR  
- Build log confirming mp-weixin compilation

**NEVER** mark a feature as passing without reading evidence first.

## Key Algorithms

### Health Cycle Computation

**File:** `src/utils/healthCycle.ts`

**Function:** `computeNextDate(type, preset, fromDate, petAge)`

- **狂犬疫苗 (Rabies):** 365-day cycle
- **三联/四联 (Combo):** First-year 3-shot sequence (21-day intervals) → then 365-day annual
- **体内驱虫 (Internal deworm):** 90-day cycle
- **体外驱虫 (External deworm):** 30-day cycle
- **体检 (Medical exam):** 365-day (180-day if pet age ≥ 7 years)

**Testing:** Fully unit-tested (pure function, no browser required)

### Reminder Pipeline

**Cloud function:** `health-cron` (mp-weixin only)
- Daily 09:00 scan health_records where nextDate in 7/3/1-day window
- Send 订阅消息 (subscribe message)
- Tap message → open 健康日历 → 完成/推迟

**H5 Simulation:** Client-side computes same 待办 set, renders on calendar

## Data Model

### Collections (Cloud Database)

- **users** - `_openid, nickname, avatar, vipExpireAt, subscribeMsg{}, createTime`
- **pets** - `_openid, name, species, breed, gender, birthday, avatar, weight, isNeutered, chipNo, createTime, deletedAt`
- **health_records** - `petId, type[vaccine|deworm|medical|medicine|weight], date, nextDate, name, hospital, note, attachments[], remindStatus`
- **health_knowledge** - `title, category, cover, content, sort, enabled`
- **orders** - `_openid, type[vip], amount, status, payTime, outTradeNo`

**Indexes:** `health_records(petId, nextDate)`, `pets(_openid)`

## Design System

- **Brand Color:** `#FF8A65` (warm coral) for primary actions
- **Units:** rpx (mini-program responsive), NOT px
- **Cards:** Rounded corners, soft shadows, generous spacing
- **Touch Targets:** ≥ 44px (~88rpx) for mobile optimization
- **Microcopy:** Friendly, conversational Chinese for pet owners
- **Empty States:** Encouraging illustrations + clear CTAs

## Testing Strategy

### Automated E2E Tests (94 test cases)

**File:** `feature_list.json`

Categories:
- Project structure (uni-app requirements) 
- Build verification (H5 + mp-weixin)
- Pet archive CRUD
- Health management (vaccine, deworm, medical, medicine, weight)
- Health calendar & reminders
- Knowledge library
- User system (auth, VIP, privacy, orders)
- Platform adapter verification
- UI/UX requirements
- Comprehensive flows

### Unit Tests

**Framework:** Vitest

**Coverage:**
- `healthCycle.ts` - Next-date computation for all health types
- Date utilities
- Data formatters

## Feature Completion Rules

⚠️ **CRITICAL:** Features in `feature_list.json` are immutable:

- ✅ **Allowed:** Change `"passes": false` → `"passes": true` (with evidence)
- ❌ **Forbidden:** Remove features, edit descriptions, modify steps

**Evidence-First:** A verify-gate hook blocks `feature_list.json` writes unless evidence (screenshot/log) has been Read first.

## Navigation Structure

**Bottom Tab Bar (4 tabs):**

1. **首页** (Home) - Health calendar + pet cards + today's todos
2. **档案** (Archive) - Pet list & profiles  
3. **玩法** (Fun) - "Coming Soon" placeholder (AI features in V2)
4. **我的** (Mine) - User profile, VIP, settings

## Known Constraints

### V1.0 Scope

- ✅ Health management (core differentiator)
- ✅ Pet archives (multi-pet)
- ✅ Knowledge library
- ✅ VIP membership
- ❌ AI portrait generation (V2)
- ❌ Social/UGC feed (future)
- ❌ Pet hospital marketplace (future)

### Platform Requirements

- **NO vue-router** (use pages.json)
- **NO web-only UI libraries** (Vant, Element Plus, etc.)
- **NO direct wx.* calls** outside platform adapter
- **NO localStorage** outside platform adapter  
- **NO px units** (use rpx for mini-program)
- **NO DOM-based charts** (use canvas uCharts)

## Development Workflow

1. **Pick Feature** - Select next `"passes": false` from `feature_list.json`
2. **Implement** - Build feature following uni-app requirements
3. **Verify H5** - Test in browser at :5173, take screenshot
4. **Verify Build** - Ensure `npm run build:mp-weixin` succeeds
5. **Capture Evidence** - Screenshot or log output
6. **Read Evidence** - Use Read tool on evidence file
7. **Update Status** - Change `"passes": false` → `true`
8. **Commit** - Git commit with descriptive message

## Contributing

This is an autonomous development project. Future agents should:

- Read `feature_list.json` to understand current progress
- Read `claude-progress.txt` for session summary
- Work on ONE feature at a time
- Always capture evidence before marking features complete
- Keep git history clean with descriptive commits

## License

Internal project - All rights reserved

---

**品牌口号:** 毛叽一声，健康同行 🐾

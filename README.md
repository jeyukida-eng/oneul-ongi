# 오늘의 온기 v10 — 모바일 디자인 통합 개편

기존 기록과 콘텐츠는 유지하면서 홈과 상세 페이지의 UI를 한 가지 서비스 디자인으로 통일했습니다.

- 상단 텍스트 전용 앱 이름(기존 ‘온’ 마크 제거)
- 새로운 보라색 미소 아이콘(180/192/512 PNG, SVG)
- 홈/실천/이야기/기록/성취 요약/공유 카드 통일된 카드형 디자인
- 실천 완료 시 온기 +1, 감정 선택 +1, 기록 작성 +1, 미션 개별 완료마다 +1
- 인스타그램 스토리·피드 이미지 저장 및 휴대전화 공유 기능
- 기존 콘텐츠와 로컬 기록 저장 키 `oneul-ongi-mvp-v1` 유지

앱의 일기·감정·실천 기록은 사용자의 기기에만 저장됩니다. 기기 교체 전에 백업하세요.
GitHub Pages 저장소 루트에 index.html, CSS·JS 파일, manifest, sw.js, icons/ 폴더를 배포합니다.


## v12 PLUS (preview only)

Bottom 온기 navigation opens a four-screen premium preview: personalized mission, 7/30-day growth report, 7/21/30-day challenge and printable 7/30/100-day record booklet. All data is stored on-device. Monthly ₩2,900 is an intended price; billing, subscriptions and server sync are not connected.


## v15 personalized preview

Goal, minutes and self-selected energy are used with recent completion and difficulty feedback to recommend daily tasks. Six goals, rule-based adaptive difficulty, 7/30-day report, goal-aligned 7/21/30-day challenge and optional private print-to-PDF booklet are available. Mobile screens do not require scrolling at tested sizes. Records remain on this device. Monthly 2,900 KRW is only a planned price: billing, paid access control, server sync and a real AI advisor are not implemented.


## v16 PLUS — guided personal workbook (preview; no payment)

The daily premium mission now provides goal-specific guidance (six selectable goals), reasons for the recommendation, a two-step workbook for a two-minute preference or a three-step workbook for longer sessions, an optional extra task, and a seven-day activity map. A user writes about their actual actions before receiving the core on-device 온기 credit; the same task cannot be credited again that day. Their own saved reflections appear in the weekly/monthly report's private growth notebook. Explicit difficulty feedback affects subsequent local rule-based recommendations. Records stay on the current device. Subscription billing, account sync, professional coaching, and AI-generated personalization have not been implemented; the displayed ₩2,900 is a planned price only.


## v17: Four-question PLUS daily plan

The PLUS mission screen now displays four tappable cards: why this goal-based mission was recommended (only chosen settings and real 7-day completion data); how to execute it using a two-/three-step on-device workbook; yesterday versus today's accumulated On-gi from actual local records (honestly indicating missing prior records and partial current-day data); and an optional suggested practice for tomorrow, explicitly subject to tomorrow's energy, time and feedback. The previous optional bonus and seven-day routine are accessible via a dedicated plan screen. Difficulty recommendations use prior days so today's incomplete tasks do not shift its level while in progress. On-device completion/reflection/feedback remain private. ₩2,900 remains a preview price; billing and server sync are not connected.

# clay-hero — 찰흙 인물 배경 + 타자기 제목 히어로 (Claude Code 스킬)

웹사이트 첫 화면을 **"찰흙(클레이 스톱모션) 인물이 배경을 채우고, 왼쪽에서 제목이 타자 치듯 나타나는 장면"** 으로 만든다.
제목은 고객의 순간·고민 한 문장, 배경의 인물들이 그 문장을 이야기로 증명한다 (꽃집 = 입학→졸업→결혼, 요양 = 혼자(흑백)→함께(컬러)).

- 배경 A: 같은 인물·같은 벽의 찰흙 스틸 3장 교차 페이드 — 무료 이미지 생성기로 충분 (기본값)
- 배경 B: 6~8초 찰흙 영상 1컷 — 이야기가 "전→후 변화"일 때만
- 유리 네비 알약 · 한글 라벨 칩 · 제목 타자기(110ms/글자) · 부제·CTA 순차 페이드 · 우하단 전화/상담 플로팅
- 폰에선 카피 아래·인물 위, reduced-motion 즉시 완성, 자동재생 실패 시 poster
- 검증 스크립트(playwright)와 에셋 변환 스크립트(ffmpeg) 포함

## 설치
```bash
curl -fsSL https://raw.githubusercontent.com/manabout-town/clay-hero-skill/main/install.sh | bash
# → ~/.claude/skills/clay-hero
```
자매 스킬: 상품을 직접 만지는 인트로 [signature-hero](https://github.com/manabout-town/signature-hero-skill), 빛·분위기 배경 [breathing-light](https://github.com/manabout-town/breathing-light-skill).

## 구성
```
skill/clay-hero/
├── SKILL.md                         문장→이야기 → 에셋 만들기 → 조립 → 검증
├── assets/hero/                     markup.html · clay-hero.css · clay-hero.js (스틸/비디오 겸용)
├── assets/demo/                     꽃집 데모 + Gemini로 뽑은 스틸 3장
├── assets/reference/                레퍼런스 영상 프레임 격자 2장
├── references/
│   ├── reference-analysis.md        레이아웃 수치 · 등장 타이밍 · 배경 방식 비교
│   ├── prompts.md                   공통 프롬프트 블록 · 업종별 순간 표 · 영상 프롬프트
│   └── pitfalls.md                  실제로 밟은 함정 17개
└── scripts/
    ├── make-assets.sh               스틸 jpg 변환+워터마크 제거 / 비디오 mp4·webm·poster
    └── verify.mjs                   폭별 타이핑·완료 컷, 배경 움직임, 넘침, reduced-motion 검사
```

## 데모
`skill/clay-hero/assets/demo/index.html`을 브라우저로 열면 된다 (file:// 로도 동작).

## 라이선스
MIT. 데모 이미지는 Gemini(Nano Banana 2)로 생성했다.

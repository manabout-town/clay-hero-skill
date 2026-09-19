# 찰흙 배경 만들기 — 프롬프트 레시피

원칙: **인물 고정문은 글자 그대로 반복하고, 바뀌는 줄만 교체한다.** 같은 채팅에서 "아까처럼"으로 이어 달라고 하면 직전 이미지가 그대로 나온다(Gemini 실측). 장마다 새 채팅(`/image` 재진입)에 전체 프롬프트를 다시 보낸다.

## 0. 어디서 만드나 (2026-09 기준)

| 도구 | 무엇 | 비용 | 메모 |
|---|---|---|---|
| Gemini 웹 `gemini.google.com/image` | 스틸 | 무료 ~20장/일 | Nano Banana 2. 비율 선택기에서 16:9. 다운로드는 hover→우상단 아이콘 좌표 클릭. 우하단 ✦ 워터마크 → `make-assets.sh`가 지움 |
| Google Flow `flow.google.com` | 스틸 여러 장 한 번에·**영상(Veo)** | 구독 | 에이전트 패널에 프롬프트 전부 넣고 "각 프롬프트 글자 그대로" 요청. 영상은 참조 이미지(첫 프레임) + 동작문 |
| Higgsfield MCP `generate_image`(nano_banana_pro) / `generate_video`(kling3_0·seedance) | 스틸·영상 | 크레딧 | 크레딧 0이면 위 둘 |

## 1. 스틸 세트 (기본값) — 공통 블록

```
Stop-motion claymation still frame, 16:9. Handmade polymer clay figures with soft
fingerprints and slightly uneven matte surfaces, knitted yarn and felt textures on
clothing, big round black bead eyes, small painted smiles.
Background: a flat matte plaster wall in {벽색: dusty rose pink / warm grey / sage green},
lightly textured, no props, no floor visible.
Camera locked at chest height, straight on, figures framed from the knees up and placed
in the right two-thirds of the frame, leaving the left third as empty wall.
Soft studio light from upper left, gentle shadows, shallow depth of field.
{인물 고정문 — 아래}
{이 장면에서 바뀌는 것 — 옷·소품·표정 한두 문장}
No text, no letters, no logo, no watermark.
```

- **왼쪽 1/3 비우기**가 핵심이다. 카피가 거기 들어간다. 폰에선 `--ch-pos-m`으로 인물을 위로 올린다.
- 인물 고정문은 머리(모양·색)·안경·옷 소재·색을 구체 명사로. 3명 이하. 예:
  `LEFT a mother with chin-length wavy brown clay hair, cream cable-knit sweater; CENTER a teenage son with short black tousled clay hair; RIGHT a father with round black glasses, short black hair, brown knit cardigan.`
- 장면 줄 예(꽃집): ①`The son wears a navy school blazer and holds pink carnations wrapped in kraft paper.` ②`The son wears a black graduation gown and mortarboard, holding white roses.` ③`The son is now a groom in a black tuxedo beside a bride in a white dress, both holding bouquets.` ④`All three wear black mourning clothes, the son holding white chrysanthemums, eyes gently closed.`
- 3장이면 충분하다. 4장째부터 체감이 안 늘고 용량만 는다.

## 2. 업종별 "순간" 표 (스틸 세트용)

| 업종 | 인물 | 3~4 순간 | 벽색 |
|---|---|---|---|
| 꽃집 | 가족 3인 | 입학·졸업·결혼·추모 | 더스티 로즈 |
| 사진관·스냅 | 커플 | 첫 데이트·프러포즈·웨딩·돌잔치 | 크림 |
| 학원·과외 | 학생+선생 | 첫 수업·시험 전날·합격 통지·졸업 | 세이지 |
| 치과·병원 | 아이+부모 | 첫 방문 긴장·치료 중·스티커 받음·환한 웃음 | 민트 그레이 |
| 카페·베이커리 | 사장 | 새벽 반죽·오픈 준비·손님 맞이·마감 | 오트밀 |
| 반려동물 | 사람+개 | 입양 첫날·산책·미용·노견과 포옹 | 웜 그레이 |
| 이사·인테리어 | 부부 | 빈 집·공사 중·가구 들어옴·집들이 | 라이트 그레이 |

## 3. 영상 1컷 (이야기가 "전→후 변화"일 때만)

Flow(Veo) 또는 Higgsfield `generate_video`. **먼저 첫 프레임 스틸을 1절 방식으로 만들고, 그걸 참조 이미지로 넣는다.** 텍스트만으로는 인물이 매번 달라진다.

```
Stop-motion claymation, 16:9, 7 seconds, locked camera, no cuts.
Start: {전 상태 — 예: an elderly clay woman seen from behind, alone, the whole frame desaturated grey}.
Then: {변화 동작 — 예: a caregiver in a lavender uniform walks in from the right, the woman turns, they hold hands}.
End: {후 상태 — 예: colour spreads outward from their joined hands until the frame is fully in colour, small clay flowers rise at the bottom}.
Plaster wall background, soft studio light, gentle stop-motion frame stutter, no text, no logo.
```

- 길이 6~8초, 루프 재생. 끝과 처음이 안 이어져도 된다(루프 지점은 배경 페이드가 아니라 첫 프레임 poster로 가린다).
- 변환·용량·poster는 `scripts/make-assets.sh video in.mp4`.
- 무음. 소리 있는 영상은 autoplay가 막힌다.

## 4. 흔한 실패

- 인물이 실사로 나옴 → 첫 문장에 `Stop-motion claymation`을 두고 `photo`·`realistic` 같은 단어를 빼라. `polymer clay`, `fingerprints`, `felt` 세 단어가 질감을 잡는다.
- 배경에 선반·꽃병 같은 소품이 생김 → `no props, no floor visible` 유지. 소품은 인물 손에만.
- 인물이 화면 가운데로 옴 → `right two-thirds ... left third empty wall` 문장을 빼먹었을 때. 그래도 오면 CSS `--ch-pos`로 밀되, 카피 뒤에 인물 얼굴이 오면 다시 만든다.
- 글자·간판이 생김 → `No text, no letters` 유지. 그래도 생기면 그 장은 버린다(지우는 것보다 다시 뽑는 게 빠르다).
- 장마다 인물이 달라짐 → 고정문을 한 글자도 안 바꿨는지 확인. 머리 모양·안경·옷 색이 빠지면 바뀐다.

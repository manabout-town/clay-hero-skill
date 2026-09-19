#!/usr/bin/env bash
# make-assets.sh — 생성물을 히어로용 자산으로 변환 (ffmpeg 필요)
#   스틸:  make-assets.sh still  in1.png [in2.png ...]  → clay-01.jpg … (긴 변 1600 이하, q≈82, 우하단 ✦ 워터마크 제거)
#   비디오: make-assets.sh video in.mp4                 → clay.mp4(h264 crf28) + clay.webm(vp9) + poster.jpg(첫 프레임)
# 결과 용량을 찍어준다. 스틸 250KB↑, 비디오 3MB↑면 더 줄인다(스틸 1400px / 비디오 crf 30·길이 6초).
# jpg를 쓰는 이유: homebrew ffmpeg에 webp 인코더가 없는 맥이 있고, sips도 webp 출력이 안 된다. cwebp가 있으면 바꿔도 된다.
set -euo pipefail
mode="${1:-}"; shift || true
case "$mode" in
  still)
    n=1
    for f in "$@"; do
      out="clay-$(printf %02d $n).jpg"
      w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}'); h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')
      # Gemini/Flow ✦ 워터마크: 우하단, 폭의 약 10.7% 안쪽에 폭의 약 4.5% 크기 (1024px: 109px 안쪽·46px / 1376px: 154·68). delogo는 정수 좌표만 받는다
      inset=$(( w * 107 / 1000 )); size=$(( w * 45 / 1000 ))
      ffmpeg -v error -y -i "$f" -vf "delogo=x=$(( w - inset )):y=$(( h - inset )):w=${size}:h=${size},scale='min(1600,iw)':-2" -q:v 4 "$out"
      printf '%s  %s\n' "$out" "$(du -h "$out" | cut -f1)"; n=$((n+1))
    done ;;
  video)
    f="$1"
    ffmpeg -v error -y -i "$f" -an -vf "scale='min(1600,iw)':-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart -pix_fmt yuv420p clay.mp4
    ffmpeg -v error -y -i "$f" -an -vf "scale='min(1600,iw)':-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 clay.webm
    ffmpeg -v error -y -i "$f" -frames:v 1 -q:v 3 poster.jpg
    du -h clay.mp4 clay.webm poster.jpg ;;
  *) echo "usage: make-assets.sh still <png...> | video <mp4>"; exit 1 ;;
esac

#!/usr/bin/env bash
# clay-hero 스킬 설치 → ~/.claude/skills/clay-hero
# 한 줄 설치:
#   curl -fsSL https://raw.githubusercontent.com/manabout-town/clay-hero-skill/main/install.sh | bash
set -euo pipefail

NAME=clay-hero
REPO=manabout-town/clay-hero-skill
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

here="$(cd "$(dirname "${BASH_SOURCE[0]:-.}")" 2>/dev/null && pwd || true)"
if [ -n "$here" ] && [ -d "$here/skill/$NAME" ]; then
  src="$here/skill/$NAME"                      # 레포를 clone 한 경우
else
  tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT  # curl | bash 로 실행한 경우
  curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/main" | tar xz -C "$tmp"
  src="$(echo "$tmp"/*/skill/"$NAME")"
  [ -d "$src" ] || { echo "내려받기 실패: $REPO" >&2; exit 1; }
fi

mkdir -p "$DEST"
rm -rf "$DEST/$NAME"
cp -R "$src" "$DEST/"
echo "✓ 설치 끝: $DEST/$NAME"
echo "  Claude Code를 새로 열고 스킬을 불러 쓰면 된다."

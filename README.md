# ThePour

와인·위스키 등 주류를 마실 때마다 이름, 평점, 시음 노트, 사진을 기록하고 검색·통계로 되돌아보는 공유 시음 기록 웹앱(PWA)입니다.

## 현재 범위 (MVP)

- 로그인 없이 닉네임만 입력해서 사용 (비밀번호 없음, 실제 로그인은 다음 단계에서 추가 예정)
- 같은 술은 하나의 "제품"으로 묶이고, 빈티지/평점/노트 등은 시음 기록마다 따로 저장
- Nose/Palate/Finish 태그 클릭 + 자유 서술 테이스팅 노트, Vivino 스타일 특성 슬라이더
- 구입일/구입처/구입가격 기록 + 제품별 구매 이력 그래프
- 통합 검색(작성자/주류명/생산지/테이스팅 노트), 가격대 필터
- 통계(총 기록 수, 평균 평점, 종류별 분포, 평점 추이, 자주 쓴 태그)
- PWA 설치 지원

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 프로젝트의 SQL Editor에서 `supabase/migrations/0001_init.sql` 내용을 실행합니다.
3. Project Settings → API에서 `Project URL`과 `anon public` 키를 확인합니다.

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 Supabase URL과 anon key를 채워 넣습니다.

### 3. 의존성 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

닉네임을 입력하고(`/welcome`) 첫 시음 기록을 남겨보세요.

## 기술 스택

- Next.js (App Router, TypeScript), Tailwind CSS + shadcn/ui
- Supabase (Postgres + Storage)
- recharts (통계/구매 이력 차트)
- `@ducanh2912/next-pwa` (PWA)

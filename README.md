[README_설치안내.md](https://github.com/user-attachments/files/34900951/README_.md)
# 지금 만나 - 대중교통 시간 조회 추가 버전

지도 마커 또는 후보 역을 클릭하면 각 참가자별 **대중교통 예상 소요시간**이 표시됩니다. 사용자별 소요시간, 환승 횟수, 요금(응답에 있는 경우), 최대/평균/시간차를 표시합니다.

## 준비물
- 현재 사용 중인 카카오 **JavaScript 키** (지도 표시용)
- 카카오 **REST API 키** (경로 조회용, 비밀로 보관)
- GitHub Pages 사이트: `https://affossoffa.github.io/jigeum-manna/`
- Cloudflare Workers 계정 (중계 서버)

## 1. Cloudflare Worker 배포
1. Cloudflare 대시보드 `Workers & Pages`에서 새 Worker를 생성합니다.
2. Worker 코드 편집기에서 `worker.js` 파일 내용을 붙여넣고 배포합니다.
3. 해당 Worker의 `Settings > Variables and Secrets`에서 `Add`를 누릅니다.
4. 타입은 **Secret**, 이름은 **KAKAO_REST_API_KEY**, 값은 카카오디벨로퍼스의 **REST API 키**로 지정한 후 배포합니다.
5. Worker 주소(예: `https://jigeum-manna-transit.사용자명.workers.dev`)를 복사합니다.

## 2. HTML 설정
1. `index.html`의 `YOUR_JS_KEY`에 기존 지도용 JavaScript 키를 넣습니다.
2. `index.html`의 `YOUR_WORKER_URL`에 위 Worker 주소를 넣습니다. **뒤에 `/transit`을 붙이지 마세요.**
3. GitHub 저장소 루트에 `index.html`과 `jigeum_manna_station_candidates_101.json`을 올립니다.
4. GitHub Pages 사이트를 열고 참가자들의 출발지를 지정한 다음, 검색한 역을 클릭합니다.

## 보안 및 제한
- **REST API 키는 GitHub HTML/자바스크립트에 절대 넣지 마세요.** Worker Secret에만 저장합니다.
- Worker의 Origin 검사는 브라우저 호출을 제한하기 위한 간단한 조치이며 강한 인증·호출량 제한이 아닙니다. 공개 서비스로 확장할 땐 Cloudflare Rate Limiting 또는 사용자 인증을 추가하세요.
- 카카오 REST API의 대중교통 결과는 저장/캐싱하지 않습니다. 좌표 검색 캐시와 다릅니다.
- 역 클릭마다 출발지 N개에 대해 N건 요청하므로 4명이 역 5개를 클릭하면 최대 20회 호출합니다.
- 본 패키지는 코드 템플릿이며, 실제 키/Worker 배포가 없어서 라이브 호출은 검증되지 않았습니다.

참고 문서:
- Kakao Maps REST API: https://developers.kakao.com/docs/ko/kakaomap/rest-api
- Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/

# 펴다 본문 이미지 저장소 분리 — 1단계

2026-10-03. 그림 삽입 기능을 유지한다. 이미지가 많아졌다는 이유로 기존 그림 열람이나 원고 수정을 막지 않는다. 현재 기본 설정에는 작가별·전체 저장량의 강제 차단 한도를 두지 않았다. 무료 제공량이 늘어나거나 초과할 경우 관리자가 비용·저장량을 확인하고 확장해야 한다. R2의 10GB 무료 제공량은 무제한 저장이 아니다.

## 확인한 실제 상태

- 저장소 main 기준 커밋: `577758892c91ea23d1765d4a8d87f81444a32f0d`.
- DB: 17,348,275 bytes (약 17.3MB, 16.5MiB). 무료 DB 한도의 약 3.5%.
- 회차: 148개. 본문에 Base64 이미지가 든 회차: 22개.
- body_html 전체: 3,595,058 bytes. 이 값은 이미지와 텍스트의 합이며 이미지 용량만 의미하지 않는다.
- Supabase Storage 표지: 8개, 2,237,969 bytes.
- 실제 데이터 이전·삭제는 하지 않았다.

## 구현 및 배포 상태

- 파일 메타데이터 테이블 `manuscript_assets`와 서버 전용 원자적 예약 함수 준비.
- Supabase Edge Function `manuscript-assets` 배포.
- PC·모바일·다운로드용 미리보기: 기존 Base64와 새 파일 ID를 함께 읽는 코드 준비.
- 서버 저장 시 그림 업로드를 먼저 완료하고, R2 HEAD로 크기와 SHA-256 메타데이터를 확인한 뒤 ID가 포함된 원고를 저장한다.
- 실패하면 원래 기기 원고와 DB 원고를 덮어쓰지 않는다. 이미지 업로드만 성공하고 회차 저장에 실패한 경우에는 동일 해시 재시도로 같은 파일 ID를 사용한다.
- 현재 프런트의 `r2ManuscriptAssets` 기본값은 false. 기존 저장 방식이 계속 작동한다.
- R2 자격 증명/버킷 연결, 실제 업로드·기기 간 읽기·실제 R2 이미지 PDF/EPUB 검증은 아직 완료되지 않았다. 연결 확인 전 전환을 켜지 않는다.
- R2 공개 표지 이전, 원본 PDF/EPUB 업로드는 다음 단계다. 기존 표지는 그대로 Supabase Storage에 둔다.

## 구조와 권한

이미지 파일은 비공개 R2, 텍스트·서식·파일 ID는 Supabase DB에 둔다. 브라우저에는 비밀 키를 제공하지 않는다.

읽기는 공개·회차 공개 여부, 구매 여부, 성인인증, 작가 소유권을 검사하는 서버 프록시를 통한다. 공유 가능한 서명 URL 대신, 요청마다 권한을 확인하고 이미지 바이트를 반환한다. 이는 인수인계의 서명 URL 방식에서 작은 본문 이미지에 맞게 선택한 구현 방식이다. 서버가 전달을 담당하므로 Edge Function 요청량·전송량도 모니터링해야 한다.

- 비공개 버킷에는 `r2.dev` 공개 접근이나 공개 도메인을 연결하지 않는다.
- 버킷 CORS 없이 프록시를 통해 읽고 업로드한다.
- 저장되는 `<img>`에는 고정된 작은 투명 PNG와 `data-pyeoda-asset="UUID"`를 넣는다. 실제 그림 데이터나 만료 URL을 저장하지 않는다.
- 화면에 표시한 이미지 데이터는 원고를 캡처할 때 다시 ID 형식으로 정규화한다.
- 내보내기는 권한을 확인해 이미지를 읽어 PDF/EPUB에 실제 파일로 포함한다.
- 기존 그림 최적화(최대 2000px 등)와 10MB 입력 제한을 유지한다. 입력 원본의 별도 R2 보존은 아직 구현하지 않았다.
- 읽기 API는 기존 `public-episodes`와 동일한 **테스트 구매** 권한을 사용한다. 실제 유료 판매를 시작하기 전에 두 API를 실제 구매 원장으로 함께 바꿔야 한다.
- `manuscript_assets`는 RLS를 켰다. 작가는 자신의 메타데이터만 조회하고 직접 쓰기·수정·예약은 할 수 없다. 예약 RPC는 service_role만 호출할 수 있다.
- 작품 삭제 시 파일 기록은 남겨서 보관량을 잃지 않으며, 독자는 고아 파일에 접근하지 못한다. 자동 파일 삭제는 아직 하지 않는다.

## 연결에 필요한 설정

Cloudflare에서 비공개 Standard 버킷 `pyeoda-private`을 만들고, 이 버킷에만 Object Read & Write 권한이 있는 R2 S3 자격 증명을 발급한다. 공개 표지용 `pyeoda-public`은 표지 전환 단계에서 만든다.

아래 값은 **Supabase Edge Function Secrets**에 입력한다. HTML, JS, Git, 채팅에 비밀 키를 붙여 넣지 않는다.

```text
PYEODA_R2_ACCOUNT_ID=<Cloudflare Account ID>
PYEODA_R2_ACCESS_KEY_ID=<R2 S3 Access Key ID>
PYEODA_R2_SECRET_ACCESS_KEY=<R2 S3 Secret Access Key>
PYEODA_R2_PRIVATE_BUCKET=pyeoda-private
PYEODA_R2_UPLOADS_ENABLED=false
```

계정 설정 상태: `GET /functions/v1/manuscript-assets?action=status`의 `configured`는 필수 값의 존재/형식만 검사한다. 실제 버킷 접근 성공을 보장하지 않는다.

연결 후 순서:

1. `PYEODA_R2_UPLOADS_ENABLED=true`로 설정하고, 본인 테스트 작품에서 작은 그림의 업로드·HEAD 확인·권한별 읽기를 확인한다.
2. 테스트 프런트에서 `r2ManuscriptAssets:true`를 적용해 원고 저장, 재접속, PC·모바일 이어쓰기, 그림책 단일/펼침 배치, PDF/EPUB를 검증한다.
3. 확인 후 운영 PC/모바일 설정 파일의 `r2ManuscriptAssets`를 true로 배포한다. 서버가 준비되지 않으면 켜지 않는다.
4. 기존 22개 이미지 회차는 원본 원고를 먼저 백업하고, 파일별 업로드·해시 검증 이후 원고를 갱신한다. 재시도 기록과 수정 충돌 검사를 마련한 뒤 실제 이전을 수행한다.
5. 이전이 완료되고 오래된 클라이언트 대응을 마련한 다음 DB의 신규 큰 Base64 저장을 서버에서 차단한다. 현 단계는 이전을 준비하는 호환 단계여서 DB에 Base64가 완전히 금지된 상태가 아니다.
6. 새 표지, 기존 표지, 판매·배포 파일을 순차 분리한다.

내부 운영상 강제 상한이 필요해지는 경우에만 다음 선택값을 설정한다. 미설정 시 업로드를 이 수치로 막지 않는다. 읽기와 기존 ID 원고 수정은 상한에 도달해도 유지된다. 이 수치는 R2의 공식 무료 한도가 아니라 앱의 선택적 제한이며, 이 테이블 밖의 다른 객체/요청 과금까지 차단하지 않는다.

```text
PYEODA_R2_TOTAL_LIMIT_BYTES=<전체 신규 파일 예약량 상한>
PYEODA_R2_OWNER_LIMIT_BYTES=<작가별 신규 파일 예약량 상한>
```

실패·미참조 파일도 확인 없이 예약량에서 제외하거나 지우지 않는다. 공개 작품에 필요한 파일을 잘못 정리하지 않는다. 운영 사용량 경고·관리 화면은 다음 단계다.

## 검증

- `node --test tests/r2-*.test.mjs`: 권한, 성인인증, 테스트 구매, 업로드 크기·형식, 미연결/비활성 상태, R2 실패, 검증 후 참조 발급, 재시도 중복 방지 등 14개 테스트.
- PC·모바일·미리보기 인라인 스크립트 문법 검사 및 diff 검사.
- 실제 DB에서 RLS·쓰기/예약 권한과 기존 회차 보존 확인.
- 브라우저 자동 검사 환경에는 실행 파일이 없어 로컬 런타임 검사 미완료. 운영 전환 전에 실제 계정으로 브라우저/R2 통합 검사를 반드시 완료한다.

공식 구현 참고:
- https://developers.cloudflare.com/r2/examples/aws/aws4fetch/
- https://developers.cloudflare.com/r2/pricing/
- https://supabase.com/docs/reference/javascript/auth-getuser

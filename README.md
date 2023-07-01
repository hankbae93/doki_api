# 도키도키망가부 api-server

## settings

db: mariaDB
tools: dbeaver, docker, erd-cloud

## 해야되는 목록들

- API마다 예외 케이스 처리
    - 유효성 검사 => class-validator, 이메일 형식인지, 
    - 이메일이 기본키여서 중복처리 해야됨
    - data가 없을 때 데이터를 조회한다던가 업데이트하는 예외케이스
    - 권한 체크 , 예를 들어 유저 삭제라던가
- API마다 response 처리
- update의 경우
    - password
    - nickname, description
    - 구분해서 개발하기





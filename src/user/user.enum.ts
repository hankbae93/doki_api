export type UserRankType = 'd' | 'c' | 'b' | 'a' | 's';

export enum UserRank {
  d = 'd',
  c = 'c',
  b = 'b',
  a = 'a',
  s = 's',
}

export enum UserRankName {
  d = '이세계 난민',
  c = '이세계 모험가',
  b = '이세계 NPC',
  a = '전생자',
  s = 'TEN DUCK',
}

export enum ReviewCountByUserRank {
  d = 2,
  c = 5,
  b = 8,
  a = 12,
  s = 20,
}

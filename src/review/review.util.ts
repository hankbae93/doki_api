import {
  ReviewCountByUserRank,
  UserRank,
  UserRankType,
} from '../user/user.enum';

export const getIsNextRank = (count: number, rank: UserRankType) => {
  const dataset = {
    1: 'd',
    2: 'c',
    3: 'b',
    4: 'a',
    5: 's',
  };

  const currentMaxCount = ReviewCountByUserRank[rank];
  let nextRank = rank;

  for (const key in dataset) {
    if (Number(key) > currentMaxCount && count >= Number(key)) {
      nextRank = dataset[key];
      break;
    }
  }

  return { nextRank, rank, currentMaxCount };
};

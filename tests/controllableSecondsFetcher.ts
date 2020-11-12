import Mock = jest.Mock;

export interface IControllableSecondsFetcher extends Mock<number> {
  (): number;

  advanceTime(amount: number): void;

  setTime(newTime: number): void;
}

export const getControllableSecondsFetcher = (): IControllableSecondsFetcher => {
  let time = 100;
  const fn = jest.fn(() => time) as IControllableSecondsFetcher;

  fn.advanceTime = (amount: number) => {
    time += amount;
  };

  fn.setTime = (newTime: number) => {
    time = newTime;
  };

  return fn;
};

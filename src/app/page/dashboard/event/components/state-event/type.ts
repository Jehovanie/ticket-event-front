export type ChartDoughnutType = {
  isLoading: boolean;
  title: string;
  isFilter: boolean;
  filterTime: Date | null;
  state: {
    [key: string]: {
      count: number;
      color: string;
    };
  }[];
};

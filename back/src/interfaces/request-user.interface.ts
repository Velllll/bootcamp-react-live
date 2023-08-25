export type RequestWithUser = Request & {
  user: {
    login: string;
    id: number;
  };
};

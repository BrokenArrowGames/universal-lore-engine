export const Condition = {
  PropEqualsCurrentUserId: (prop: string) => (ctx) => ({
    [prop]: { $eq: ctx.currentUser.id },
  }),
  PropEquals: (prop: string, value: any) => (_ctx) => ({
    [prop]: { $eq: value },
  }),
};

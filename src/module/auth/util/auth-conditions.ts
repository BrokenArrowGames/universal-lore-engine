export const Condition = {
  IsCurrentUser: (ctx) => ({ id: { $eq: ctx.currentUser.id } }),
  CreatedByCurrentUser: (ctx) => ({ "createdBy.id": { $eq: ctx.currentUser.id } }),
  IsPublic: (_ctx) => ({ private: { $eq: false } }),
  IsPrivate: (_ctx) => ({ private: { $eq: true } }),
};
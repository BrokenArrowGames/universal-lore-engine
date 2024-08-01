export const AllowGuestSessionKey = "Controller:AllowGuestSession";

export function AllowGuestSession() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AllowGuestSessionKey, true, target[propertyKey]);
    return descriptor;
  };
}

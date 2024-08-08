export function RandomIntInRange(min: number, max: number): number {
  if (min === max) return max;
  return Math.floor(min + Math.random() * (max - min));
}

export function RandomDateInRange(
  min: number,
  max: number,
  base?: number,
): Date {
  const now = base ?? Date.now();
  const offset = RandomIntInRange(min, max) * 1000 * 60 * 60 * 24;
  return new Date(now + offset);
}

export function RandomName(): string {
  const names = [
    "Olivia",
    "Liam",
    "Emma",
    "Noah",
    "Ava",
    "Elijah",
    "Sophia",
    "Oliver",
    "Isabella",
    "James",
    "Mia",
    "Benjamin",
    "Charlotte",
    "Lucas",
    "Amelia",
    "Henry",
    "Harper",
    "Alexander",
    "Evelyn",
    "Sebastian",
    "Abigail",
    "Jack",
    "Ella",
    "Aiden",
    "Aria",
    "Samuel",
    "Chloe",
    "Michael",
    "Luna",
    "Matthew",
    "Avery",
    "Daniel",
    "Sofia",
    "David",
    "Scarlett",
    "Joseph",
    "Grace",
    "Carter",
    "Zoey",
    "Owen",
    "Penelope",
    "Wyatt",
    "Riley",
    "John",
    "Layla",
    "Luke",
    "Lillian",
    "Gabriel",
    "Nora",
    "Anthony",
    "Addison",
    "Isaac",
    "Willow",
    "Dylan",
    "Ellie",
    "Lincoln",
    "Lily",
    "Nathan",
    "Hannah",
    "Ryan",
    "Mila",
    "Caleb",
    "Violet",
    "Hunter",
    "Aurora",
    "Joshua",
    "Savannah",
    "Asher",
    "Brooklyn",
    "Leo",
    "Bella",
    "Christopher",
    "Claire",
    "Andrew",
    "Skylar",
    "Theodore",
    "Lucy",
    "Thomas",
    "Paisley",
    "Charles",
    "Everly",
    "Christian",
    "Anna",
    "Jaxon",
    "Caroline",
    "Ezra",
    "Nova",
    "Elias",
    "Genesis",
    "Maverick",
    "Emilia",
    "Jameson",
    "Kennedy",
    "Ezekiel",
    "Madelyn",
    "Colton",
    "Cora",
    "Austin",
    "Aubrey",
    "Adrian",
    "Stella",
  ];
  return names[RandomIntInRange(0, names.length)];
}

export function RandomArray<T>(filler: () => T, min: number, max?: number) {
  const len = RandomIntInRange(min, max ?? min);
  if (len < 1) return [];
  return new Array(len + 1).fill(filler).map((fn) => fn());
}

export function RandomStringOfLength(
  min: number,
  max: number,
  chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
) {
  return RandomArray(
    () => chars[RandomIntInRange(0, chars.length)],
    min,
    max,
  ).join("");
}

export function RandomElement<T>(values: T[]): T {
  return values[RandomIntInRange(0, values.length)];
}

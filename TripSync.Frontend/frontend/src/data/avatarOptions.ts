export type AvatarKey =
  | "dog"
  | "cat"
  | "penguin"
  | "turtle"
  | "koala"
  | "cockatiel";

export interface AvatarOption {
  key: AvatarKey;
  label: string;
  role: string;
  src: string;
}

export const avatarOptions: AvatarOption[] = [
  {
    key: "dog",
    label: "Cachorro capitão",
    role: "Capitão da viagem",
    src: "/avatars/dog.webp",
  },
  {
    key: "cat",
    label: "Gato explorador",
    role: "Explorador",
    src: "/avatars/cat.webp",
  },
  {
    key: "penguin",
    label: "Pinguim navegador",
    role: "Navegador",
    src: "/avatars/penguin.webp",
  },
  {
    key: "turtle",
    label: "Tartaruga organizadora",
    role: "Organizadora",
    src: "/avatars/turtle.webp",
  },
  {
    key: "koala",
    label: "Coala documentarista",
    role: "Documentarista",
    src: "/avatars/koala.webp",
  },
  {
    key: "cockatiel",
    label: "Calopsita viajante",
    role: "Companheira de rota",
    src: "/avatars/cockatiel.webp",
  },
];

export function getAvatarByKey(
  key?: string | null
): AvatarOption | undefined {
  return avatarOptions.find((avatar) => avatar.key === key);
}
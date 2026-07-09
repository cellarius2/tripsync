import dogAvatar from "../assets/dog.png";
import catAvatar from "../assets/cat.png";
import penguinAvatar from "../assets/penguim.png";
import turtleAvatar from "../assets/turtle.png";
import koalaAvatar from "../assets/koala.png";
import cockatielAvatar from "../assets/cockatiel.png";

export type AvatarKey =
  | "dog"
  | "cat"
  | "penguin"
  | "turtle"
  | "koala"
  | "cockatiel";

export const avatarOptions: Array<{
  key: AvatarKey;
  label: string;
  role: string;
  src: string;
}> = [
  {
    key: "dog",
    label: "Cachorro capitão",
    role: "Capitão da viagem",
    src: dogAvatar,
  },
  {
    key: "cat",
    label: "Gato explorador",
    role: "Explorador",
    src: catAvatar,
  },
  {
    key: "penguin",
    label: "Pinguim navegador",
    role: "Navegador",
    src: penguinAvatar,
  },
  {
    key: "turtle",
    label: "Tartaruga organizadora",
    role: "Organizadora",
    src: turtleAvatar,
  },
  {
    key: "koala",
    label: "Coala documentarista",
    role: "Documentarista",
    src: koalaAvatar,
  },
  {
    key: "cockatiel",
    label: "Calopsita viajante",
    role: "Companheira de rota",
    src: cockatielAvatar,
  },
];

export function getAvatarByKey(key?: string | null) {
  return avatarOptions.find((avatar) => avatar.key === key);
}

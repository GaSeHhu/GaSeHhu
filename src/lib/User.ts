import { createContext, useContext } from "react";

export type UserId = string;

export interface User {
  readonly userId: UserId;
  nickname?: string;
}

export type UserContextValue = [
  User | null,
  (user: User | null) => void,
];

export const UserContext = createContext<UserContextValue>([null, () => {}]);

export const useUserContext = () => {
  return useContext(UserContext);
};

function generateRandomId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; ++i) {
    const charOffset = Math.floor(Math.random() * characters.length);
    result += characters.charAt(charOffset);
  }
  return result;
}

export class TemporaryUser implements User {
  readonly userId: UserId;
  nickname?: string;

  constructor(nickname?: string) {
    this.userId = generateRandomId(32);
    this.nickname = nickname;
  }
}

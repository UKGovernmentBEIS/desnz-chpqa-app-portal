import { Address } from "./address.model";

export type Organisation = Address & {
  id?: string;
  name?: string;
  registrationNumber?: string;
};

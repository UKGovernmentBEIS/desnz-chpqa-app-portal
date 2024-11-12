import { Organisation } from "./organisation.model";
import { RadioButtonOption } from "./radio-button-option.model";

export type ResponsiblePerson = {
  firstName: string;
  lastName: string;
  consultant: RadioButtonOption;
  jobTitle: string;
  telephone1: string;
  telephone2: string;
  organisation?: Organisation;
  isCompanyHouseRegistered: RadioButtonOption;
};

export type ResponsiblePersonForm = ResponsiblePerson & {
  companyName: string;
  companyRegistrationNumber: string;
};

export type User = {
  username?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type UserRequest = Omit<ResponsiblePerson, 'consultant'> & {
  consultant: boolean;
  userType: number;
} & User;

export type UserResponse = User & {};

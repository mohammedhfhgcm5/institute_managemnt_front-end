import { Relationship } from './common.types';

export interface Parent {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  relationship: Relationship;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentData {
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  relationship: Relationship;
}

export interface UpdateParentData extends Partial<CreateParentData> {}

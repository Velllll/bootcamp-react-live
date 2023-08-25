import {
  Work,
  Authorships,
  Biblio,
  Concept,
  OpenAccess,
  PrimaryLocation,
} from './entitys/work.entity';
import { Roles, User } from './entitys/user.entity';
import { UserWorkCollection } from './entitys/user-work-collection.entity';

const entities = [
  Work,
  Authorships,
  Biblio,
  Concept,
  OpenAccess,
  PrimaryLocation,
  User,
  Roles,
  UserWorkCollection,
];

export default entities;

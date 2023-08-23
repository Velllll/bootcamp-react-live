import {
  Work,
  Authorships,
  Biblio,
  Concept,
  OpenAccess,
  PrimaryLocation,
} from './entitys/events.entity';
import {
  FacultyList,
  JobList,
  ScienceCentreList,
} from './entitys/lists.entity';
import { Roles, User } from './entitys/user.entity';

const entities = [
  Work,
  Authorships,
  Biblio,
  Concept,
  OpenAccess,
  PrimaryLocation,
  User,
  Roles,
  FacultyList,
  JobList,
  ScienceCentreList,
];

export default entities;

export class EditAuthorDto {
  workid: number;
  authors: {
    authorid: number;
    authorName: string;
  }[];
}

export class FavoriteSns {

  public id: string;
  public contentsType: string;
  public contents: {
    contributorOfficeUserId: string;
    contributorLastName: string;
    contributorFirstName: string;
    contributorOfficeName: string;
    contributorDepartmentName: string;
    containerId: string;
    containerName: string;
    date: string;
    text: string;
    messageId?: string;
    articleId?: string;
    commentId?: string;
    fileIds?: string[]
  };

}

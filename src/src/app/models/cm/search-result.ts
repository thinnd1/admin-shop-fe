/**
 * 検索結果の種類別カウント
 */
export class SearchResultCountItem {
  public searchTarget: string;
  public count: number;
}

/**
 * 個別の検索結果
 */
export class SearchResultItem {
  public contentsId: string;
  public contentsSubId: string;
  public title: string;
  public body: string;
  public updateTime: string;
}

/**
 * 検索APIが返す検索結果
 */
export class SearchResult {
  public searchTarget: string;
  public resultCounts: [SearchResultCountItem];
  public results: [SearchResultItem];
  public page: number;
  public resultsPerPage: number;
}

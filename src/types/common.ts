export interface Repo {
  id: number;
  name: string;
  description: string;
  url: string;
  owner: {
    login: string;
  };
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  updated_at: string;
  license: {
    name: string;
  };
  open_issues_count: number;
}

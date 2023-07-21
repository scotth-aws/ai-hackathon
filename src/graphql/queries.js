/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getHackathonLectureSummary = /* GraphQL */ `
  query GetHackathonLectureSummary($id: String!) {
    getHackathonLectureSummary(id: $id) {
      id
      createdAt
      lectureSummaryS3Url
      lectureTitle
    }
  }
`;
export const listHackathonLectureSummaries = /* GraphQL */ `
  query ListHackathonLectureSummaries(
    $filter: TableHackathonLectureSummaryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHackathonLectureSummaries(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        createdAt
        lectureSummaryS3Url
        lectureTitle
      }
      nextToken
    }
  }
`;

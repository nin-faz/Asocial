import { graphql } from "../gql";

export const GET_BUBBLES = graphql(`
  query GetBubbles($limit: Int, $offset: Int) {
    getBubbles(limit: $limit, offset: $offset) {
      id
      title
      isAnonymous
      author {
        id
        username
        iconName
      }
      messages {
        id
        content
        isAnonymous
        author {
          id
          username
          iconName
        }
        dislikes
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`);

export const GET_BUBBLE_BY_ID = graphql(`
  query GetBubbleById($id: ID!) {
    getBubbleById(id: $id) {
      id
      title
      isAnonymous
      author {
        id
        username
        iconName
      }
      messages {
        id
        content
        isAnonymous
        author {
          id
          username
          iconName
        }
        dislikes
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`);

export const GET_BUBBLE_MESSAGES = graphql(`
  query GetBubbleMessages($bubbleId: ID!) {
    getBubbleMessages(bubbleId: $bubbleId) {
      id
      content
      isAnonymous
      author {
        id
        username
        iconName
      }
      dislikes
      createdAt
    }
  }
`);

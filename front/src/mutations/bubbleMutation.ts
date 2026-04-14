import { graphql } from "../gql";

export const CREATE_BUBBLE = graphql(`
  mutation CreateBubble($title: String!, $isAnonymous: Boolean) {
    createBubble(title: $title, isAnonymous: $isAnonymous) {
      code
      success
      message
      bubble {
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
  }
`);

export const ADD_MESSAGE_TO_BUBBLE = graphql(`
  mutation AddMessageToBubble($bubbleId: ID!, $content: String!, $isAnonymous: Boolean) {
    addMessageToBubble(bubbleId: $bubbleId, content: $content, isAnonymous: $isAnonymous) {
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

export const DELETE_BUBBLE = graphql(`
  mutation DeleteBubble($id: ID!) {
    deleteBubble(id: $id) {
      code
      success
      message
    }
  }
`);

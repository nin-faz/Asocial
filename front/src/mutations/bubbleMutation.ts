import { graphql } from "../gql";

export const CREATE_BUBBLE = graphql(`
  mutation CreateBubble($title: String!) {
    createBubble(title: $title) {
      code
      success
      message
      bubble {
        id
        title
        author {
          id
          username
          iconName
        }
        messages {
          id
          content
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
  mutation AddMessageToBubble($bubbleId: ID!, $content: String!) {
    addMessageToBubble(bubbleId: $bubbleId, content: $content) {
      id
      content
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

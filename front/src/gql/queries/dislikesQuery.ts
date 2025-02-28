import { gql } from '@apollo/client';

export const FIND_DISLIKES_BY_USER_ID = gql`
    query FindDislikesByArticleId($userId: ID!) {
        getDislikesByUserId(userId: $userId) {
            user {
                id
                username
            }
            article {
                id
                title
                content
                createdAt
                updatedAt
                author {
                    username
                    id
                }
            }
        }
    }
`;





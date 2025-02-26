import { hashPassword  } from "../../module/auth.js";
import { MutationResolvers } from "../../types.js";

export const createUser: NonNullable<MutationResolvers['createUser']> = async (_, {username, password}, {dataSources: {db}}) => {
  try {
    const existUser = await db.user.findFirstOrThrow({where: {username}});
    if(existUser) {
        return{
            code: 403,
            success: false,
            message: `user ${username} already exists`,
            user: null
        }
    }
    
    const createdUser = await db.user.create({
      data: {
        username,
        password: await hashPassword(password),
        bio: "Bienvenue sur mon profil !",
        createdAt: new Date()
      }
    })

    return {
      code: 201,
      success: true,
      message: `user ${username} has been created`,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        bio: createdUser.bio, 
        createdAt: createdUser.createdAt.toISOString() 
      }
    }
  } catch (error){
    return {
      code: 400,
      message: 'User has not been created : ' + error,
      success: false,
      user: null
    }
  }
}
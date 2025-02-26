import { comparePassword, createJWT  } from "../../module/auth.js";
import { MutationResolvers } from "../../types.js";

export const signIn: NonNullable<MutationResolvers['signIn']> = async (_, {username, password}, {dataSources : {db}}, __) => {
  try {
    const user = await db.user.findFirst({where: {username}});
    if(!user) {
        return {
            code: 401,
            message: 'user does not exist',
            success: false,
            token: null,
        }
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new Error('Invalid password')
    }

    const jwtToken = createJWT(user)

    return {
      code: 200,
      message: 'user connected',
      success: true,
      token: jwtToken 
    }

  } catch (e) {
    return {
      code: 401,
      message: (e as Error).message,
      success: false,
      token: null,
    }
  }
}
import { comparePassword, createJWT  } from "../../module/auth.js";
import { MutationResolvers } from "../../types.js";

export const signIn: NonNullable<MutationResolvers['signIn']> = async (_, {username, password}, {dataSources}, __) => {
  try {
    const user = await dataSources.db.user.findFirstOrThrow({where: {username}});
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
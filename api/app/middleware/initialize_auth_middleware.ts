import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { sessions, users } from '#database/schema'

export default class InitializeAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const authorizationHeader = ctx.request.header('Authorization', '')
    const sessionId = ctx.lucia.readBearerToken(authorizationHeader ?? '')
    const { user, session } = await ctx.lucia.validateSession(sessionId)
    if (user) {
      ctx.auth = {
        isAuthenticated: true,
        user,
        session,
      }
    } else {
      ctx.auth = {
        isAuthenticated: false,
        user,
        session,
      }
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
interface AuthContext {
  user?: typeof users.$inferSelect
  session?: typeof sessions.$inferSelect
  isAuthenticated: boolean
}
declare module '@adonisjs/core/http' {
  export interface HttpContext {
    auth: AuthContext
  }
}
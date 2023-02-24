import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Auth0Provider from   "next-auth/providers/auth0";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import { prisma } from "./db";
import { Scope } from "@prisma/client";
import { api } from "../utils/api";
/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/



declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      scopeId?: String;
    } & DefaultSession["user"];
  }
  interface User {
    scopeId?: String
  }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
/*
    callbacks: {
        async jwt({token, user, account, profile, isNewUser}) {
        if (account?.accessToken) {
            token.accessToken = account.accessToken
        }
        if (user?.scopes) {
            token.scopes = user.scopes
        }
        return token
        },
        async session({session, token}) {
        if (token?.roles) {
            session.user.scopes = token.scope
        }
        return session
        }
        */
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.scopeId = user.scopeId;
      }
      return session;
    },
    
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
        clientId: env.AUTH0_CLIENT_ID,
        clientSecret: env.AUTH0_CLIENT_SECRET,
        issuer: env.AUTH0_ISSUER_BASE_URL,
    })
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ]
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

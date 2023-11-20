"use client";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useUser } from "@clerk/nextjs";
import { DataContext } from "@/context/DataContext";
import { getUser } from "./http/requests";
import { useQuery } from "@tanstack/react-query";
import { UserInfo } from "@/types";

export const withAuth = <P extends { children: React.ReactNode }>(
  WrappedComponent: React.ComponentType<P>
) => {
  const Wrapper: React.FC<P> = (props) => {
    const { setUserInfo, userInfo, setGlobalLoading } = useContext(DataContext);
    // const userInfoQuery = useQuery({
    //   queryKey: ["userInfo"],
    //   queryFn: () => getUser(),
    //   enabled: Object.entries(userInfo).length === 0,
    // });
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded) {
        const isLoggedIn = !userId;
        // Avoid infinite redirection loop
        if (isLoggedIn && router.pathname !== "/auth") {
          router.push("/auth");
        }
      }
    }, [isLoaded, userId, user, router]);

    // React.useEffect(() => {
    //   // fetch user info if none exists and user is logged in
    //   setGlobalLoading(userInfoQuery.isLoading);
    //   if (userInfoQuery.data && Object.entries(userInfo).length === 0) {
    //     if (!userInfoQuery?.data?.errorStatus) {
    //       const reqData = userInfoQuery.data?.data as UserInfo;
    //       setUserInfo(reqData);
    //       setUserPlan(reqData.proj_plan);
    //     }
    //   }
    // }, [userInfoQuery.isLoading, userInfoQuery.data]);

    const wrappedComponent = React.createElement(WrappedComponent, props);
    return wrappedComponent;
  };

  return Wrapper;
};

export const withoutAuth = <P extends { children: React.ReactNode }>(
  WrappedComponent: React.ComponentType<P>
) => {
  const Wrapper: React.FC<P> = (props) => {
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded) {
        const isLoggedIn = userId;

        // Avoid infinite redirection loop
        if (isLoggedIn) {
          router.push("/dashboard");
        }
      }
    }, [isLoaded, userId, user, router]);

    const wrappedComponent = React.createElement(WrappedComponent, props);
    return wrappedComponent;
  };

  return Wrapper;
};

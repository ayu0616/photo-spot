"use client";

import { useEffect } from "react";

export const TripScroller = ({
  children,
  postId,
}: {
  children: React.ReactNode;
  postId?: string;
}) => {
  useEffect(() => {
    if (postId) {
      const element = document.getElementById(postId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [postId]);
  return children;
};

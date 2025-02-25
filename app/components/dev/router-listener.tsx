import { useEffect } from "react";
import { useMatches } from "@tanstack/react-router";

const parentOrigin = "http://localhost:3000";

function sendMessageToParent(message: any) {
  try {
    if (typeof window === "undefined") {
      return;
    }
    if (typeof window.parent === "undefined") {
      return;
    }
    if (window.parent === window) {
      return;
    }
    window.parent.postMessage(
      {
        type: "FROM_IFRAME",
        payload: message,
      },
      parentOrigin,
    );
  } catch (e) {
    console.error(e);
  }
}

export function RouterListener() {
  const matches = useMatches();
  useEffect(() => {
    console.log(matches);
    sendMessageToParent(JSON.stringify(matches));
  }, [matches]);
  return <div></div>;
}

import { linkOptions } from "@tanstack/react-router";
import { SquareTerminal } from "lucide-react";

export const navSections = [
  {
    title: "Playground",
    link: linkOptions({ to: "/" }),
    items: [
      {
        title: "Test",
        icon: SquareTerminal,
        link: linkOptions({ to: "/test" }),
        items: [
          {
            title: "Test 2",
            link: linkOptions({ to: "/dev/pages" }),
          },
        ],
      },
    ],
  },
];

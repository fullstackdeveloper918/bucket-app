import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect } from "react";
import posthog from "posthog-js";

export default function App() {
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     posthog.init("phc_B8Z8cU1pK6TGLc9rMOz2jwv51cfKAatWEivQamURyG6", {
  //       api_host: "https://us.i.posthog.com", // or your self-hosted URL
  //       capture_pageview: true,
  //       session_recording: {
  //         captureFullscreen: true,
  //         maskAllInputs: false,
  //       },
  //     });

  //     // Optional: identify the user
  //     // posthog.identify("user_id", { email: "email@example.com" });
  //   }
  // }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">

        <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

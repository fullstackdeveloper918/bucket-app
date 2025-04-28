import React, { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client"; // Import hydrateRoot
import { RemixBrowser } from "@remix-run/react";
import posthog from "posthog-js";

// PostHogInit component for initializing PostHog only on the client-side
function PosthogInit() {
  const [sessionUrl, setSessionUrl] = useState(null); // Use null for no initial value
  const [fullUrl, setFullUrl] = useState(""); // State to hold the full URL

  useEffect(() => {
    // Ensure this code runs only on the client side
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Get the current page URL using window.location
      const url = window.location.href; // This will give you the full URL
      setFullUrl(url); // Save the full URL to the state
      console.log("Current URL:", url);

      posthog.init("phc_B8Z8cU1pK6TGLc9rMOz2jwv51cfKAatWEivQamURyG6", {
        api_host: "https://us.i.posthog.com", // Your PostHog API host
        capture_pageview: true,
        session_recording: {
          captureFullscreen: true,
          maskAllInputs: false,
        },
        person_profiles: "identified_only", // Track only identified person profiles
      });

      // Capture the session replay URL after 10 seconds
      const timer = setTimeout(() => {
        const url = posthog.get_session_replay_url?.();
        if (url) {
          setSessionUrl(url); // Save the session replay URL to state
          console.log("🎥 PostHog Session Replay URL:", url);
        }
      }, 10000); // 10 seconds for demo (adjust as necessary)

      // Cleanup timer on component unmount
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReplayClick = () => {
    // Open the session replay URL in a new tab
    if (sessionUrl) {
      window.open(sessionUrl, "_blank");
    }
  };

  return (
    <div>
      <h2>Current Page URL</h2>
      <p>{fullUrl}</p>

      {sessionUrl ? (
        <div>
          <h2>Session Replay</h2>
          <button onClick={handleReplayClick}>View Session Replay</button>
        </div>
      ) : (
        <p>Loading session replay...</p>
      )}
    </div>
  );
}

// Hydrate the Remix app and initialize PostHog (only on the client-side)
if (typeof window !== "undefined" && typeof document !== "undefined") {
  hydrateRoot(
    document.getElementById("root"), // Ensure the element with ID 'root' is available
    <React.StrictMode>
      <RemixBrowser />
      <PosthogInit />
    </React.StrictMode>
  );
}

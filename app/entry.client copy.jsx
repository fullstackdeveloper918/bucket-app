import { Form, json, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import posthog from "posthog-js";

// === SERVER-SIDE function ===
export const loader = async ({ request }) => {
  const { fullUrl, hostName } = getWebsiteInfo(request);

  console.log("Full URL:", fullUrl); // https://yourwebsite.com
  console.log("Host Name:", hostName); // yourwebsite.com

  return json({ fullUrl, hostName });
};

// === Function to get Website Info (works server-side only) ===
function getWebsiteInfo(request) {
  if (!request || !request.url) {
    return {
      fullUrl: "",
      hostName: "",
    };
  }

  const url = new URL(request.url);

  return {
    fullUrl: url.origin,  // Capture the origin URL (scheme + host)
    hostName: url.hostname,  // Capture the hostname (e.g., yourwebsite.com)
  };
}

// === CLIENT-SIDE PostHog Initialization Component ===
export function PosthogInit() {
  // Use `useLoaderData` to access data returned by the loader
  const { fullUrl, hostName } = useLoaderData();

  const [sessionUrl, setSessionUrl] = useState(null);
  const [name, setName] = useState(""); // New state to hold the name

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Initialize PostHog only on the client side
      posthog.init("your-posthog-api-key", {
        api_host: "https://us.i.posthog.com",
        capture_pageview: true,
        session_recording: {
          captureFullscreen: true,
          maskAllInputs: false,
        },
        person_profiles: "identified_only",
      });

      const timer = setTimeout(() => {
        const url = posthog.get_session_replay_url?.();
        if (url) {
          setSessionUrl(url);
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []); // Runs only once on mount

  const handleReplayClick = () => {
    if (sessionUrl) {
      window.open(sessionUrl, "_blank");
    }
  };

  const postData = async () => {
    try {
      const response = await fetch("/your-api-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          sessionUrl: sessionUrl,
          fullUrl: fullUrl,
          hostName: hostName,
        }),
      });

      const result = await response.json();
      console.log("✅ POST response:", result);
      console.log("Response Status:", response.status); // Log response status
    } catch (error) {
      console.error("❌ POST error:", error);
    }
  };

  return (
    <div>
      <h2>Session Replay</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={postData}>Send Name and Session URL</button>

      {sessionUrl ? (
        <div>
          <button onClick={handleReplayClick}>View Session Replay</button>
        </div>
      ) : (
        <p>Loading session replay...</p>
      )}
    </div>
  );
}

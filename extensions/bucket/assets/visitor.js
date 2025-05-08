//  $(document).ready(function () {
//     function sendVisitorData(sessionReplayUrl) {
//       $.get("https://api.ipify.org?format=json", function (ipRes) {
//         const ip = ipRes.ip;

//         const shopifyConfig = window.shopifyConfig || {};
//         const appUrl = shopifyConfig.AppUrl;

//         console.log(shopifyConfig, appUrl, "here to send");
//         if (!appUrl) {
//           console.error("AppUrl is undefined");
//           return;
//         }

//         const payload = {
//           domain: window.location.hostname,
//           country: "Unknown",
//           ipAddress: ip,
//           videoURL: sessionReplayUrl || "Not available",
//           message: "User visited this page",
//           userName: "Guest",
//           actionNumber: 1,
//         };

//         $.ajax({
//           url: "https://bahamas-drinking-chaos-deadly.trycloudflare.com/app/api/post/visitorReply",
//           method: "POST",
//           contentType: "application/json",
//           data: JSON.stringify(payload),
//           success: function (response) {
//             console.log("Visitor data sent:", response);
//           },
//           error: function (xhr, status, error) {
//             console.error("Failed to send visitor data", error);
//           },
//         });
//       }).fail(function () {
//         console.error("Failed to fetch IP address");
//       });
//     }

//     async function handlePostHogTrackingOnly() {
//       console.log("Initializing PostHog...");

//       if (typeof window !== "undefined" && typeof document !== "undefined") {
//         try {
//           const initPosthog = () => {
//             posthog.init("phc_B8Z8cU1pK6TGLc9rMOz2jwv51cfKAatWEivQamURyG6", {
//               api_host: "https://us.i.posthog.com",
//               capture_pageview: true,
//               session_recording: {
//                 captureFullscreen: true,
//                 maskAllInputs: false,
//               },
//               person_profiles: "identified_only",
//               loaded: (posthogInstance) => {
//                 const sessionReplayUrl = posthogInstance.get_session_replay_url?.();
//                 console.log("PostHog Session URL:", sessionReplayUrl);

//                 // ✅ Send visitor data
//                 sendVisitorData(sessionReplayUrl);
//               },
//             });
//           };

//           if (typeof posthog === "undefined") {
//             const script = document.createElement("script");
//             script.src = "https://us.i.posthog.com/static/array.js";
//             script.async = true;
//             script.onload = initPosthog;
//             script.onerror = (error) => {
//               console.error("Failed to load PostHog script:", error);
//             };
//             document.head.appendChild(script);
//           } else {
//             initPosthog();
//           }
//         } catch (error) {
//           console.error("Error initializing PostHog:", error);
//         }
//       } else {
//         console.warn("PostHog not loaded: window or document not available.");
//       }
//     }

//     // Trigger on page load
//     handlePostHogTrackingOnly();
//   });


{
  "domain": "example.com",
  "country": "United States",
  "ipAddress": "192.168.1.1",
  "videoURL": "https://example.com/video.mp4",
  "message": "This is a test message",
  "userName": "John Doe",
  "actionNumber": 1
}

{"domain":"rohit-cybersify.myshopify.com",
 "country":"Unknown", 
 "ipAddress":"127.0.0.1", 
 "videoURL":"Not available", 
 "message":"User visited this page", 
 "userName":"Guest", 
 "actionNumber": 1}

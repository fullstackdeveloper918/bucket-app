// routes/api/getThemeInfo.ts
import { json, LoaderArgs } from "@remix-run/node";
import prisma from "../db.server"; // Adjust this import based on your project structure
import axios from "axios"; // Ensure you have axios installed

export const loader = async ({ request }: LoaderArgs) => {
  try {
    // Get the origin from the request headers
    const origin = request.headers.get("origin");
    if (!origin) {
      return json({ error: "Origin not provided" }, { status: 400 });
    }

    // Extract domain from origin
    const url = new URL(origin);
    const domain = url.hostname;
    console.log("🌐 Domain:", domain);

    // Find session by shop (using domain as shop)
    const session = await prisma.session.findFirst({
      where: {
        shop: domain,
      },
      select: {
        accessToken: true,
      },
    });

    // If no session found, return unauthorized
    if (!session) {
      console.warn("❌ No session found for domain:", domain);
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    console.log("✅ Access Token Found:", accessToken);

    // Step 1: Get All Themes
    const themesUrl = `https://${domain}/admin/api/2024-04/themes.json`;
    const themesResponse = await axios.get(themesUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    const themes = themesResponse.data.themes;
    console.log("🎨 All Themes:", themes);

    // Step 2: Find the Main Theme
    const mainTheme = themes.find(theme => theme.role === "main");
    if (!mainTheme) {
      console.warn("❌ Main theme not found!");
      return json({ error: "Main theme not found" }, { status: 404 });
    }

    console.log("✅ Main Theme Found:", mainTheme);
    const mainThemeId = mainTheme.id;

    // Step 3: Get Settings Data for Main Theme
    const settingsDataUrl = `https://${domain}/admin/api/2024-04/themes/${mainThemeId}/assets.json?asset[key]=config/settings_data.json`;
    const settingsDataResponse = await axios.get(settingsDataUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    const settingsData = settingsDataResponse.data;
    console.log("✅ Settings Data:", settingsData);

    // Step 4: Extract Only cart_type Value
    let cartType;
    if (settingsData?.asset?.value) {
      const parsedSettings = JSON.parse(settingsData.asset.value);
      cartType = parsedSettings?.current?.cart_type || null;
    }
    
    console.log("🛒 Cart Type:", cartType);

    // Step 5: Return Only cart_type
    return json({ cart_type: cartType });
  } catch (error: any) {
    console.error("❌ Error retrieving theme info:", error.message);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};

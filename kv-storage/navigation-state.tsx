import { storeKv } from './kv-storage';

// The screens 'Profile Option Screen' and 'Search Filter Option Screen'
// include parameters which aren't serializable. Those navigation states
// shouldn't be stored.
const safeScreens = [
  "Conversation Screen",
  "Home/Inbox",
  "Home/Profile/Profile Tab",
  "Home/Q&A",
  "Home/Search/Search Filter Screen/Q&A Filter Screen",
  "Home/Search/Search Filter Screen/Search Filter Tab",
  "Home/Search/Search Screen",
  "Home/Traits",
  "Prospect Profile Screen/Prospect Profile",
];

const getCurrentScreen = (navigationState: any): string | null => {
  // Validate the basic structure of the navigation state
  if (
    !navigationState ||
    typeof navigationState !== 'object' ||
    !Array.isArray(navigationState.routes) ||
    typeof navigationState.index !== 'number'
  ) {
    return null;
  }

  // Access the current route using the index
  const currentRoute = navigationState.routes[navigationState.index];
  if (!currentRoute) {
    return null;
  }

  // Recurse into nested state if it exists
  if (currentRoute.state) {
    return currentRoute.name + "/" + getCurrentScreen(currentRoute.state);
  }

  // Return the name of the current route if available
  return currentRoute.name || null;
}

const navigationState = async (value?: any) => {
  const currentScreen = getCurrentScreen(value);
  if (currentScreen && !safeScreens.includes(currentScreen))
    return null;

  const result = await storeKv(
    "navigation_state",
    typeof value === "undefined" ? undefined
      : !value ? null
      : JSON.stringify(value)
  );

  if (!result) return null;

  try {
    return JSON.parse(result);
  } catch {
    // If the navigation state is invalid json, just ignore it. It will be
    // overwritten with a valid state on the next navigation.
    return null;
  }
};

export {
  navigationState
}

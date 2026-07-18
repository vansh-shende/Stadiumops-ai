import { useState, useEffect, Suspense } from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";

// Vision UI Dashboard React example components
import Sidenav from "examples/Sidenav";

// Vision UI Dashboard React themes
import theme from "assets/theme";

// Vision UI Dashboard React routes
import routes from "./routes";

// Context providers
import { SimulationProvider } from "./context/SimulationContext";
import { useVisionUIController, setMiniSidenav } from "context";

/**
 * App — Main entry component for the StadiumOps AI Command Center application.
 *
 * Configures the styling themes, establishes global context providers (SimulationProvider),
 * tracks route changes to handle view scrolls, manages dynamic side navigation state (miniSidenav),
 * and handles main routing/lazy loading boundaries.
 *
 * @returns {React.ReactElement} The base application shell and routing tree.
 */
export default function App() {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, layout, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const history = useHistory();
  const [currentLocation, setCurrentLocation] = useState(history.location);

  useEffect(() => {
    const unlisten = history.listen((newLocation) => {
      setCurrentLocation(newLocation);
    });
    return () => {
      unlisten();
    };
  }, [history]);

  const pathname = currentLocation.pathname;

  /**
   * Opens the side navigation pane on mouse enter if currently minimized.
   */
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  /**
   * Closes/minimizes the side navigation pane on mouse leave.
   */
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Reset scroll offsets back to top whenever active view route path changes
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname]);

  /**
   * Recursively maps route definition configurations to react-router Route components.
   *
   * @param {Array<Object>} allRoutes - List of route configuration structures.
   * @returns {Array<React.ReactElement|null>} Flattened list of active Route components.
   */
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} component={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <SimulationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {layout === "dashboard" && (
          <Sidenav
            color={sidenavColor}
            brandName="FIFA command center"
            routes={routes}
            location={currentLocation}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        )}
        <main id="main-content" role="main" aria-label="StadiumOps Dashboard Content">
          <Suspense fallback={
            <VuiBox display="flex" justifyContent="center" alignItems="center" height="100vh">
              <VuiBox color="white" fontSize="lg" fontWeight="medium">
                Loading Command Center...
              </VuiBox>
            </VuiBox>
          }>
            <div aria-live="polite" aria-atomic="true">
              <Switch location={currentLocation}>
                {getRoutes(routes)}
                <Redirect from="*" to="/dashboard" />
              </Switch>
            </div>
          </Suspense>
        </main>
      </ThemeProvider>
    </SimulationProvider>
  );
}

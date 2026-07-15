import { useState, useEffect, Suspense } from "react";
import { Route, Switch, Redirect, useLocation, useHistory } from "react-router-dom";

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

export default function App() {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, direction, layout, sidenavColor } = controller;
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

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };



  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname]);

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
          <>
            <Sidenav
              color={sidenavColor}
              brandName="FIFA command center"
              routes={routes}
              location={currentLocation}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
          </>
        )}
        <Suspense fallback={
          <VuiBox display="flex" justifyContent="center" alignItems="center" height="100vh">
            <VuiBox color="white" fontSize="lg" fontWeight="medium">
              Loading Command Center...
            </VuiBox>
          </VuiBox>
        }>
          <Switch location={currentLocation}>
            {getRoutes(routes)}
            <Redirect from="*" to="/dashboard" />
          </Switch>
        </Suspense>
      </ThemeProvider>
    </SimulationProvider>
  );
}
